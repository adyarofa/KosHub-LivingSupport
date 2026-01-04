import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { config } from '../env.js';

const router = express.Router();

// Connect ke Supabase A (Wijak) untuk authentication
const supabase = createClient(
  config.supabase.url,    // Supabase A (Wijak)
  config.supabase.anonKey
);

// POST /auth/login - Login user
// User harus sudah register via Accommodation Service 
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return res.status(401).json({ 
      message: error.message,
      note: 'User must be registered via Accommodation Service first'
    });
  }

  res.json({
    access_token: data.session.access_token,
    expires_in: data.session.expires_in,
    user: {
      id: data.user.id,
      email: data.user.email
    }
  });
});

// GET /auth/me - Get current user info (untuk testing)
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: 'No authorization header' });
  }
  
  const token = authHeader.split(' ')[1];

  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return res.status(403).json({ message: 'Invalid token' });
  }

  res.json({
    id: user.id,
    email: user.email,
    created_at: user.created_at
  });
});

export default router;
