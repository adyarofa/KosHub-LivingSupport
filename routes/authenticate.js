import express from 'express';
import { createClient } from '@supabase/supabase-js';
import pool from '../db/pool.js';

const router = express.Router();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return res.status(401).json({ message: error.message });
    }

    res.json({
        access_token: data.session.access_token,
        expires_in: data.session.expires_in,
        user: data.user,
    });
});

router.post('/register', async (req, res) => {
    const { email, password, name, membership_level } = req.body;

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        return res.status(400).json({ message: error.message });
    }

    const discountRates = {
        'BASIC': 0.0,
        'SILVER': 0.05,
        'GOLD': 0.10
    };

    const selectedMembership = membership_level || 'BASIC';
    const discountRate = discountRates[selectedMembership] || 0.0;

    try {
        await pool.query(
            'INSERT INTO users (id, name, membership_level, discount_rate) VALUES ($1, $2, $3, $4)',
            [data.user.id, name || null, selectedMembership, discountRate]
        );
    } catch (dbError) {
        console.error(dbError);
        return res.status(500).json({ message: 'Failed to create user profile' });
    }
    res.json(data);
});

router.put('/change-password', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'No authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const { new_password } = req.body;

    if (!new_password || new_password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const { data, error } = await supabase.auth.updateUser(
        { password: new_password },
        { accessToken: token }
    );

    if (error) {
        return res.status(400).json({ message: error.message });
    }

    res.json({ message: 'Password updated successfully' });
});

export default router;
