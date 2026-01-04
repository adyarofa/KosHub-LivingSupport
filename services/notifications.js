import pool from '../db/pool.js';

export const createNotification = async (
  userId, 
  serviceType, 
  serviceId, 
  title, 
  message, 
  notificationType = 'info'
) => {
  try {
    const result = await pool.query(
      `INSERT INTO notifications 
       (user_id, service_type, service_id, title, message, notification_type, is_read) 
       VALUES ($1, $2, $3, $4, $5, $6, false) 
       RETURNING *`,
      [userId, serviceType, serviceId, title, message, notificationType]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Get notification by ID
export const getNotificationById = async (notificationId, userId) => {
  try {
    const result = await pool.query(
      'SELECT * FROM notifications WHERE id = $1 AND user_id = $2',
      [notificationId, userId]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching notification:', error);
    throw error;
  }
};

// Mark notification as read
export const markAsRead = async (notificationId, userId) => {
  try {
    const result = await pool.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *',
      [notificationId, userId]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Get unread count
export const getUnreadCount = async (userId) => {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false',
      [userId]
    );
    return parseInt(result.rows[0].count);
  } catch (error) {
    console.error('Error getting unread count:', error);
    throw error;
  }
};
