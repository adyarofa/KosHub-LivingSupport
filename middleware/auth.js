import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import pool from '../db/pool.js';
import { config } from '../env.js';

const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey
);

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
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
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

export const checkActiveBooking = async (req, res, next) => {
  try {
    const userId = req.user.id;

    try {
      const token = req.headers['authorization'];
      const response = await axios.get(
        `${config.accommodationServiceUrl}/bookings/active/${userId}`,
        {
          headers: { 'Authorization': token },
          timeout: 5000
        }
      );

      if (response.data && response.data.length > 0) {
        console.log(response.data)
        req.activeBooking = response.data[0];
        console.log(req.activeBooking)
        return next();
      }
    } catch (apiError) {
      console.error('Accommodation API call failed:', {
        message: apiError.message,
        code: apiError.code,
        stack: apiError.stack,
        response: apiError.response ? {
          status: apiError.response.status,
          data: apiError.response.data
        } : undefined,
        request: apiError.request ? {
          path: apiError.request.path,
          method: apiError.request.method,
          headers: apiError.request.headers
        } : undefined
      });
      if (apiError.response) {
        console.error('Accommodation API error response:', apiError.response.data);
      }
      if (apiError.request) {
        console.error('Accommodation API request info:', apiError.request);
      }
      console.error('Accommodation API not reachable, falling back to direct DB query.');
    }
    next();
  } catch (error) {
    console.error('Error checking active booking:', error.message);
    return res.status(500).json({ 
      error: 'Failed to verify active booking. Please try again later.' 
    });
  }
};

export const authenticateAndCheckBooking = [authenticateToken, checkActiveBooking];
