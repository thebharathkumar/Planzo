const express = require('express');
const db = require('../config/database');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// Haversine query for location-based search
const haversineQuery = `
  SELECT *, (
    6371 * acos(
      LEAST(1.0, GREATEST(-1.0,
        cos(radians($1)) * cos(radians(latitude)) * cos(radians(longitude) - radians($2)) +
        sin(radians($1)) * sin(radians(latitude))
      ))
    )
  ) AS distance
  FROM events
  WHERE status = 'published'
`;

// GET /api/events — Search events by location
router.get('/', async (req, res) => {
  try {
    const { lat, lng, radius = 50, q } = req.query;

    if (!lat || !lng) {
      // Return all published events if no location provided
      const result = await db.query(
        "SELECT * FROM events WHERE status = 'published' ORDER BY start_time ASC LIMIT 50"
      );
      return res.json({ count: result.rowCount, events: result.rows });
    }

    let query = `
      SELECT * FROM (${haversineQuery}) AS nearby_events
      WHERE distance < $3
    `;
    const params = [parseFloat(lat), parseFloat(lng), parseFloat(radius)];

    if (q) {
      query += ` AND (title ILIKE $4 OR description ILIKE $4)`;
      params.push(`%${q}%`);
    }

    query += ` ORDER BY distance ASC LIMIT 50`;

    const result = await db.query(query, params);
    res.json({ count: result.rowCount, events: result.rows });
  } catch (error) {
    console.error('Search events error:', error);
    res.status(500).json({ message: 'Search failed' });
  }
});

// GET /api/events/:id — Get event details with tickets
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const eventResult = await db.query('SELECT * FROM events WHERE id = $1', [id]);
    if (eventResult.rowCount === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const ticketResult = await db.query(
      'SELECT * FROM tickets WHERE event_id = $1 ORDER BY price ASC',
      [id]
    );

    const event = eventResult.rows[0];
    event.tickets = ticketResult.rows;

    res.json({ event });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Failed to get event' });
  }
});

// POST /api/events — Create event (Organizer only)
router.post('/', authenticate, requireRole('organizer', 'admin'), async (req, res) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const { title, description, startTime, endTime, address, venueName, latitude, longitude, tickets } = req.body;
    const organizerId = req.user.id;

    if (!title || !address || !startTime || !endTime) {
      return res.status(400).json({ message: 'Title, address, start time, and end time are required' });
    }

    // Use provided lat/lng or defaults (in production, geocode the address)
    const lat = latitude || 40.7128;
    const lng = longitude || -74.0060;

    const eventQuery = `
      INSERT INTO events (organizer_id, title, description, start_time, end_time, venue_name, address, latitude, longitude, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'published')
      RETURNING *
    `;
    const eventValues = [organizerId, title, description || '', startTime, endTime, venueName || 'TBD', address, lat, lng];
    const eventResult = await client.query(eventQuery, eventValues);
    const newEvent = eventResult.rows[0];

    // Insert tickets
    if (tickets && tickets.length > 0) {
      const ticketQuery = `INSERT INTO tickets (event_id, name, price, quantity_available) VALUES ($1, $2, $3, $4) RETURNING *`;
      const eventTickets = [];
      for (const ticket of tickets) {
        const tr = await client.query(ticketQuery, [newEvent.id, ticket.name, ticket.price || 0, ticket.quantity]);
        eventTickets.push(tr.rows[0]);
      }
      newEvent.tickets = eventTickets;
    }

    await client.query('COMMIT');
    res.status(201).json({ success: true, message: 'Event published successfully', event: newEvent });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create event error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    client.release();
  }
});

// PUT /api/events/:id — Update event
router.put('/:id', authenticate, requireRole('organizer', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, startTime, endTime, address, venueName, status } = req.body;

    // Verify ownership
    const existing = await db.query('SELECT organizer_id FROM events WHERE id = $1', [id]);
    if (existing.rowCount === 0) return res.status(404).json({ message: 'Event not found' });
    if (existing.rows[0].organizer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this event' });
    }

    const result = await db.query(
      `UPDATE events SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        start_time = COALESCE($3, start_time),
        end_time = COALESCE($4, end_time),
        address = COALESCE($5, address),
        venue_name = COALESCE($6, venue_name),
        status = COALESCE($7, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8 RETURNING *`,
      [title, description, startTime, endTime, address, venueName, status, id]
    );

    res.json({ event: result.rows[0] });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Failed to update event' });
  }
});

// DELETE /api/events/:id — Delete event
router.delete('/:id', authenticate, requireRole('organizer', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.query('SELECT organizer_id FROM events WHERE id = $1', [id]);
    if (existing.rowCount === 0) return res.status(404).json({ message: 'Event not found' });
    if (existing.rows[0].organizer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await db.query('DELETE FROM events WHERE id = $1', [id]);
    res.json({ message: 'Event deleted' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Failed to delete event' });
  }
});

module.exports = router;
