import express from 'express';
import pool from '../db/pool.js';
import { createNotification } from '../services/notifications.js';

const router = express.Router();

export const CATERING_MENU = {
  breakfast: [
    { name: 'Nasi Goreng + Telur', price: 15000 },
    { name: 'Bubur Ayam', price: 12000 },
    { name: 'Roti Bakar + Kopi', price: 10000 },
    { name: 'Lontong Sayur', price: 13000 },
  ],
  lunch: [
    { name: 'Nasi Ayam Geprek', price: 20000 },
    { name: 'Nasi Rendang', price: 25000 },
    { name: 'Nasi Pecel', price: 15000 },
    { name: 'Mie Goreng Spesial', price: 18000 },
  ],
  dinner: [
    { name: 'Nasi Ayam Bakar', price: 22000 },
    { name: 'Nasi Ikan Bakar', price: 23000 },
    { name: 'Nasi Soto Betawi', price: 20000 },
    { name: 'Nasi Rawon', price: 21000 },
  ],
  snack: [
    { name: 'Pisang Goreng', price: 8000 },
    { name: 'Tahu Isi', price: 10000 },
    { name: 'Martabak Mini', price: 15000 },
    { name: 'Es Buah', price: 12000 },
  ]
};

router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      'SELECT * FROM catering_orders WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching catering orders:', error);
    res.status(500).json({ error: 'Failed to fetch catering orders' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const result = await pool.query(
      'SELECT * FROM catering_orders WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Catering order not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching catering order:', error);
    res.status(500).json({ error: 'Failed to fetch catering order' });
  }
});

router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      meal_type, 
      menu_name, 
      quantity, 
      delivery_date, 
      delivery_time,
      delivery_address,
      special_requests,
      booking_id
    } = req.body;

    if (!meal_type || !menu_name || !quantity || !delivery_date || !delivery_time) {
      return res.status(400).json({ 
        error: 'Missing required fields: meal_type, menu_name, quantity, delivery_date, delivery_time' 
      });
    }

    const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    if (!validMealTypes.includes(meal_type)) {
      return res.status(400).json({ 
        error: 'Invalid meal_type. Valid options: breakfast, lunch, dinner, snack' 
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than 0' });
    }

    const menuItem = CATERING_MENU[meal_type]?.find(item => item.name === menu_name);
    if (!menuItem) {
      return res.status(400).json({ 
        error: `Menu '${menu_name}' not found in ${meal_type} category` 
      });
    }

    const total_price = menuItem.price * quantity;

    const finalDeliveryAddress = delivery_address || req.activeBooking.accommodation_address || 'Room address';

    const result = await pool.query(
      `INSERT INTO catering_orders 
       (user_id, booking_id, meal_type, menu_name, quantity, delivery_date, delivery_time, 
        total_price, delivery_address, special_requests, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
       RETURNING *`,
      [userId, booking_id, meal_type, menu_name, quantity, delivery_date, delivery_time, 
       total_price, finalDeliveryAddress, special_requests, 'pending']
    );

    const cateringOrder = result.rows[0];

    await createNotification(
      userId,
      'catering',
      cateringOrder.id,
      'Catering Order Created',
      `Your order for ${quantity}x ${menu_name} has been placed. Total: Rp ${total_price.toLocaleString()}`,
      'success'
    );

    res.status(201).json(cateringOrder);
  } catch (error) {
    console.error('Error creating catering order:', error);
    res.status(500).json({ error: 'Failed to create catering order' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { quantity, delivery_date, delivery_time, delivery_address, special_requests } = req.body;

    const checkResult = await pool.query(
      'SELECT * FROM catering_orders WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Catering order not found' });
    }

    const currentOrder = checkResult.rows[0];

    if (currentOrder.status !== 'pending') {
      return res.status(400).json({ 
        error: 'Can only update catering order with pending status' 
      });
    }

    let updateQuery = `UPDATE catering_orders SET `;
    let updateParams = [];
    let paramCount = 1;
    let newTotalPrice = currentOrder.total_price;

    if (quantity && quantity !== currentOrder.quantity) {
      const menuItem = CATERING_MENU[currentOrder.meal_type]?.find(
        item => item.name === currentOrder.menu_name
      );
      newTotalPrice = menuItem.price * quantity;
      updateQuery += `quantity = $${paramCount}, total_price = $${paramCount + 1}, `;
      updateParams.push(quantity, newTotalPrice);
      paramCount += 2;
    }

    if (delivery_date) {
      updateQuery += `delivery_date = $${paramCount}, `;
      updateParams.push(delivery_date);
      paramCount++;
    }

    if (delivery_time) {
      updateQuery += `delivery_time = $${paramCount}, `;
      updateParams.push(delivery_time);
      paramCount++;
    }

    if (delivery_address) {
      updateQuery += `delivery_address = $${paramCount}, `;
      updateParams.push(delivery_address);
      paramCount++;
    }

    if (special_requests !== undefined) {
      updateQuery += `special_requests = $${paramCount}, `;
      updateParams.push(special_requests);
      paramCount++;
    }

    updateQuery = updateQuery.slice(0, -2);
    updateQuery += ` WHERE id = $${paramCount} AND user_id = $${paramCount + 1} RETURNING *`;
    updateParams.push(id, userId);

    const result = await pool.query(updateQuery, updateParams);

    await createNotification(
      userId,
      'catering',
      id,
      'Catering Order Updated',
      `Your catering order #${id} has been updated.`,
      'info'
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating catering order:', error);
    res.status(500).json({ error: 'Failed to update catering order' });
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'preparing', 'on_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await pool.query(
      'UPDATE catering_orders SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [status, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Catering order not found' });
    }

    const statusMessages = {
      confirmed: 'Your catering order has been confirmed',
      preparing: 'Your food is being prepared',
      on_delivery: 'Your food is on the way',
      delivered: 'Your food has been delivered. Enjoy your meal!',
      cancelled: 'Your catering order has been cancelled'
    };

    if (statusMessages[status]) {
      await createNotification(
        userId,
        'catering',
        id,
        'Catering Status Update',
        statusMessages[status],
        status === 'delivered' ? 'success' : 'info'
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating catering status:', error);
    res.status(500).json({ error: 'Failed to update catering status' });
  }
});

// DELETE /catering/:id - Cancel catering order
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if exists and is pending
    const checkResult = await pool.query(
      'SELECT * FROM catering_orders WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Catering order not found' });
    }

    if (checkResult.rows[0].status !== 'pending') {
      return res.status(400).json({ 
        error: 'Can only cancel catering order with pending status' 
      });
    }

    await pool.query(
      'UPDATE catering_orders SET status = $1 WHERE id = $2 AND user_id = $3',
      ['cancelled', id, userId]
    );

    await createNotification(
      userId,
      'catering',
      id,
      'Catering Order Cancelled',
      `Your catering order #${id} has been cancelled.`,
      'warning'
    );

    res.json({ message: 'Catering order cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling catering order:', error);
    res.status(500).json({ error: 'Failed to cancel catering order' });
  }
});

export default router;
