import app from './app.js';
import { config } from './env.js';
import pool from './db/pool.js';

const port = config.port;

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Failed to connect to database:', err.message);
    console.log('Server will start but database operations will fail');
  } else {
    console.log('Database connected successfully');
  }
});

app.listen(port, () => {
  console.log('KosHub Living Support Service');
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
  console.log('');
  console.log('Available endpoints:');
  console.log('   - POST   /api/laundry          (Create laundry request)');
  console.log('   - GET    /api/laundry          (Get all laundry requests)');
  console.log('   - GET    /api/laundry/:id      (Get specific laundry)');
  console.log('   - PUT    /api/laundry/:id      (Update laundry request)');
  console.log('   - DELETE /api/laundry/:id      (Cancel laundry request)');
  console.log('');
  console.log('   - GET    /api/catering/menu    (Get catering menu)');
  console.log('   - POST   /api/catering         (Create catering order)');
  console.log('   - GET    /api/catering         (Get all catering orders)');
  console.log('   - GET    /api/catering/:id     (Get specific order)');
  console.log('   - PUT    /api/catering/:id     (Update catering order)');
  console.log('   - DELETE /api/catering/:id     (Cancel catering order)');
  console.log('');
  console.log('   - GET    /api/notifications         (Get all notifications)');
  console.log('   - GET    /api/notifications/unread-count');
  console.log('   - PUT    /api/notifications/:id/read');
  console.log('   - PUT    /api/notifications/read-all');
  console.log('   - DELETE /api/notifications/:id');
  console.log('');
  console.log('All /api/* endpoints require authentication token');
  console.log('Laundry & Catering require active booking');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});
