const express = require('express');
const db = require('../config/database');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// All routes require organizer role
router.use(authenticate, requireRole('organizer', 'admin'));

// GET /api/organizer/stats
router.get('/stats', async (req, res) => {
  try {
    const organizerId = req.user.id;

    const eventsResult = await db.query(
      'SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = \'published\') as active FROM events WHERE organizer_id = $1',
      [organizerId]
    );

    const revenueResult = await db.query(
      `SELECT COALESCE(SUM(b.total_amount), 0) as total_revenue, COUNT(b.id) as total_bookings
       FROM bookings b
       JOIN events e ON b.event_id = e.id
       WHERE e.organizer_id = $1 AND b.status = 'confirmed'`,
      [organizerId]
    );

    const stats = eventsResult.rows[0];
    const revenue = revenueResult.rows[0];

    res.json({
      totalEvents: parseInt(stats.total, 10),
      activeEvents: parseInt(stats.active, 10),
      totalRevenue: parseFloat(revenue.total_revenue),
      totalBookings: parseInt(revenue.total_bookings, 10),
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Failed to load stats' });
  }
});

// GET /api/organizer/events
router.get('/events', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM events WHERE organizer_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ events: result.rows });
  } catch (error) {
    console.error('My events error:', error);
    res.status(500).json({ message: 'Failed to load events' });
  }
});

module.exports = router;
