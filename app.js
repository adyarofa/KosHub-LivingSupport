import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import laundryRoutes from './routes/laundry.js';
import cateringRoutes from './routes/catering.js';
import notificationRoutes from './routes/notifications.js';
import { authenticateToken, authenticateAndCheckBooking } from './middleware/auth.js';
import { CATERING_MENU } from './routes/catering.js';
import { config } from './env.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (public)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'KosHub Living Support Service',
    timestamp: new Date().toISOString()
  });
});

// Public routes info (public)
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to KosHub Living Support API',
    version: '1.0.0',
    services: ['laundry', 'catering', 'notifications'],
    endpoints: {
      health: 'GET /health',
      laundry: 'GET /api/laundry',
      catering: 'GET /api/catering',
      notifications: 'GET /api/notifications'
    },
    documentation: 'See README.md for complete API documentation',
    note: 'All /api/* endpoints require authentication token and active booking'
  });
});

// Auth routes (public) - untuk login/register
app.use('/auth', authRoutes);

// Protected routes - require authentication only
app.use('/api/notifications', authenticateToken, notificationRoutes);

// Public menu endpoint hanya perlu auth, tidak perlu active booking
app.get('/api/catering/menu', authenticateToken, (req, res) => {
  try {
    res.json({
      message: 'Available catering menu',
      menu: CATERING_MENU
    });
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

// Protected routes - require authentication only
app.use('/api/notifications', authenticateToken, notificationRoutes);

// Protected routes - require authentication AND active booking
app.use('/api/laundry', authenticateAndCheckBooking, laundryRoutes);
app.use('/api/catering', authenticateAndCheckBooking, cateringRoutes);
// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

export default app;
