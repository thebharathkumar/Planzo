const express = require('express');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /api/bookings — Create a booking
router.post('/', authenticate, async (req, res) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const { eventId, items } = req.body;
    const userId = req.user.id;

    if (!eventId || !items || items.length === 0) {
      return res.status(400).json({ message: 'eventId and items are required' });
    }

    // Calculate total
    let totalAmount = 0;
    for (const item of items) {
      const ticketResult = await client.query(
        'SELECT * FROM tickets WHERE id = $1 AND event_id = $2',
        [item.ticketId, eventId]
      );
      if (ticketResult.rowCount === 0) {
        throw new Error(`Ticket ${item.ticketId} not found`);
      }
      const ticket = ticketResult.rows[0];
      const available = ticket.quantity_available - (ticket.quantity_sold || 0);
      if (item.quantity > available) {
        throw new Error(`Not enough tickets available for ${ticket.name}`);
      }
      totalAmount += Number(ticket.price) * item.quantity;
    }

    // Create booking
    const bookingResult = await client.query(
      `INSERT INTO bookings (user_id, event_id, total_amount, status)
       VALUES ($1, $2, $3, 'pending')
       RETURNING *`,
      [userId, eventId, totalAmount]
    );
    const booking = bookingResult.rows[0];

    // Create booking items and update ticket quantities
    for (const item of items) {
      const ticket = (await client.query('SELECT price FROM tickets WHERE id = $1', [item.ticketId])).rows[0];
      await client.query(
        `INSERT INTO booking_items (booking_id, ticket_id, quantity, price_at_booking)
         VALUES ($1, $2, $3, $4)`,
        [booking.id, item.ticketId, item.quantity, ticket.price]
      );
      await client.query(
        'UPDATE tickets SET quantity_sold = COALESCE(quantity_sold, 0) + $1 WHERE id = $2',
        [item.quantity, item.ticketId]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ booking });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create booking error:', error);
    res.status(500).json({ message: error.message || 'Failed to create booking' });
  } finally {
    client.release();
  }
});

// POST /api/bookings/:id/confirm — Confirm a booking
router.post('/:id/confirm', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `UPDATE bookings SET status = 'confirmed' WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ booking: result.rows[0] });
  } catch (error) {
    console.error('Confirm booking error:', error);
    res.status(500).json({ message: 'Failed to confirm booking' });
  }
});

// GET /api/bookings — List my bookings
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT b.*, e.title as event_title, e.start_time, e.venue_name
       FROM bookings b
       JOIN events e ON b.event_id = e.id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );

    res.json({ bookings: result.rows });
  } catch (error) {
    console.error('List bookings error:', error);
    res.status(500).json({ message: 'Failed to list bookings' });
  }
});

module.exports = router;
