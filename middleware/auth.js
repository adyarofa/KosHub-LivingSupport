import { createClient } from '@supabase/supabase-js';
import pool from '../db/pool.js';
import { config } from '../env.js';

// Initialize Supabase client (SAMA seperti teman!)
const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey
);

// Middleware untuk authenticate token (SAMA dengan teman!)
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' });
  }

  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // Verify token via Supabase Auth (SAMA seperti teman!)
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    // Set user info ke request
    req.user = {
      id: user.id,
      email: user.email,
    };
    
    next();
  } catch (err) {
    console.error('Auth Error:', err.message);
    return res.status(403).json({ error: 'Invalid token', details: err.message });
  }
};

// Middleware untuk check apakah user punya booking aktif
export const checkActiveBooking = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // OPTION 1: Try API call first (if accommodation service is running)
    try {
      const token = req.headers['authorization'];
      const response = await axios.get(
        `${config.accommodationServiceUrl}/bookings/active/${userId}`,
        {
          headers: { 'Authorization': token },
          timeout: 3000 // 3 second timeout
        }
      );

      if (response.data && response.data.length > 0) {
        req.activeBooking = response.data[0];
        return next();
      }
    } catch (apiError) {
      console.log('⚠️  Accommodation service not available, checking database directly...');
    }

    // OPTION 2: Direct database query (shared Supabase)
    // Query bookings table dari Supabase yang sama
    const result = await pool.query(
      `SELECT b.*, a.address, a.name as accommodation_name
       FROM bookings b
       LEFT JOIN accommodations a ON b.accommodation_id = a.accommodation_id
       WHERE b.user_id = $1 
         AND b.status = 'SUCCESS' 
         AND CURRENT_DATE BETWEEN b.start_date AND b.end_date
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ 
        error: 'No active booking found. You need an active accommodation booking to use living support services.' 
      });
    }

    // simpan booking info ke request untuk digunakan di route
    req.activeBooking = result.rows[0];
    next();
  } catch (error) {
    console.error('Error checking active booking:', error.message);
    return res.status(500).json({ 
      error: 'Failed to verify active booking. Please try again later.' 
    });
  }
};

export const authenticateAndCheckBooking = [authenticateToken, checkActiveBooking];
