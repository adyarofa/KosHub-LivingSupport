import express from 'express';
import pool from '../db/pool.js';
import { createNotification } from '../services/notifications.js';

const router = express.Router();

// Price mapping untuk layanan laundry (Rupiah per kg)
const LAUNDRY_PRICES = {
  wash: 5000,              // Cuci saja - Rp 5.000/kg
  wash_iron: 7000,         // Cuci + Setrika - Rp 7.000/kg
  dry_clean: 15000,        // Dry Clean - Rp 15.000/kg
  iron_only: 3000          // Setrika saja - Rp 3.000/kg
};

// GET /laundry - Get all laundry services for logged in user
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      'SELECT * FROM laundry_services WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching laundry services:', error);
    res.status(500).json({ error: 'Failed to fetch laundry services' });
  }
});

// GET /laundry/:id - Get specific laundry service
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const result = await pool.query(
      'SELECT * FROM laundry_services WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Laundry service not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching laundry service:', error);
    res.status(500).json({ error: 'Failed to fetch laundry service' });
  }
});

// POST /laundry - Create new laundry service request
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const bookingId = req.activeBooking.id;
    const { service_type, weight, pickup_date, pickup_time, notes } = req.body;

    // Validation
    if (!service_type || !weight || !pickup_date || !pickup_time) {
      return res.status(400).json({ 
        error: 'Missing required fields: service_type, weight, pickup_date, pickup_time' 
      });
    }

    if (!LAUNDRY_PRICES[service_type]) {
      return res.status(400).json({ 
        error: 'Invalid service_type. Valid options: wash, wash_iron, dry_clean, iron_only' 
      });
    }

    if (weight <= 0) {
      return res.status(400).json({ error: 'Weight must be greater than 0' });
    }

    // Calculate price
    const total_price = LAUNDRY_PRICES[service_type] * weight;

    const result = await pool.query(
      `INSERT INTO laundry_services 
       (user_id, booking_id, service_type, weight, pickup_date, pickup_time, total_price, notes, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [userId, bookingId, service_type, weight, pickup_date, pickup_time, total_price, notes, 'pending']
    );

    const laundryService = result.rows[0];

    // Create notification
    await createNotification(
      userId,
      'laundry',
      laundryService.id,
      'Laundry Request Created',
      `Your ${service_type} laundry request for ${weight}kg has been created. Total: Rp ${total_price.toLocaleString()}`,
      'success'
    );

    res.status(201).json(laundryService);
  } catch (error) {
    console.error('Error creating laundry service:', error);
    res.status(500).json({ error: 'Failed to create laundry service' });
  }
});

// PUT /laundry/:id - Update laundry service
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { pickup_date, pickup_time, notes } = req.body;

    // Check if laundry service exists and belongs to user
    const checkResult = await pool.query(
      'SELECT * FROM laundry_services WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Laundry service not found' });
    }

    const currentService = checkResult.rows[0];

    // Only allow updates if status is pending
    if (currentService.status !== 'pending') {
      return res.status(400).json({ 
        error: 'Can only update laundry service with pending status' 
      });
    }

    const result = await pool.query(
      `UPDATE laundry_services 
       SET pickup_date = COALESCE($1, pickup_date),
           pickup_time = COALESCE($2, pickup_time),
           notes = COALESCE($3, notes)
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [pickup_date, pickup_time, notes, id, userId]
    );

    // Create notification
    await createNotification(
      userId,
      'laundry',
      id,
      'Laundry Request Updated',
      `Your laundry request #${id} has been updated.`,
      'info'
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating laundry service:', error);
    res.status(500).json({ error: 'Failed to update laundry service' });
  }
});

// PUT /laundry/:id/status - Update laundry status (for admin/system)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { status, delivery_date, delivery_time } = req.body;

    const validStatuses = ['pending', 'picked_up', 'in_progress', 'ready', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await pool.query(
      `UPDATE laundry_services 
       SET status = $1,
           delivery_date = COALESCE($2, delivery_date),
           delivery_time = COALESCE($3, delivery_time)
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [status, delivery_date, delivery_time, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Laundry service not found' });
    }

    // Create notification based on status
    const statusMessages = {
      picked_up: 'Your laundry has been picked up',
      in_progress: 'Your laundry is being processed',
      ready: 'Your laundry is ready for delivery',
      delivered: 'Your laundry has been delivered',
      cancelled: 'Your laundry request has been cancelled'
    };

    if (statusMessages[status]) {
      await createNotification(
        userId,
        'laundry',
        id,
        'Laundry Status Update',
        statusMessages[status],
        status === 'delivered' ? 'success' : 'info'
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating laundry status:', error);
    res.status(500).json({ error: 'Failed to update laundry status' });
  }
});

// DELETE /laundry/:id - Cancel laundry service
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if exists and is pending
    const checkResult = await pool.query(
      'SELECT * FROM laundry_services WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Laundry service not found' });
    }

    if (checkResult.rows[0].status !== 'pending') {
      return res.status(400).json({ 
        error: 'Can only cancel laundry service with pending status' 
      });
    }

    await pool.query(
      'UPDATE laundry_services SET status = $1 WHERE id = $2 AND user_id = $3',
      ['cancelled', id, userId]
    );

    // Create notification
    await createNotification(
      userId,
      'laundry',
      id,
      'Laundry Request Cancelled',
      `Your laundry request #${id} has been cancelled.`,
      'warning'
    );

    res.json({ message: 'Laundry service cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling laundry service:', error);
    res.status(500).json({ error: 'Failed to cancel laundry service' });
  }
});

export default router;
