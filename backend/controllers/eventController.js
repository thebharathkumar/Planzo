const db = require('../db'); // Hypothetical database connection module

// Helper: Haversine Formula for distance (if not using PostGIS)
// In production, prefer PostGIS: WHERE ST_DWithin(geom, ST_MakePoint(lon, lat), radius)
const haversineQuery = `
    SELECT *, (
      6371 * acos(
        cos(radians($1)) * cos(radians(latitude)) * cos(radians(longitude) - radians($2)) +
        sin(radians($1)) * sin(radians(latitude))
      )
    ) AS distance
    FROM events
    WHERE status = 'published'
`;

// Helper: Geocode Address (Mock implementation for structure)
// In reality, use @googlemaps/google-maps-services-js
async function geocodeAddress(address) {
    // Call Google Maps API here
    // const response = await googleClient.geocode({ params: { address, key: process.env.GOOGLE_MAPS_KEY }});
    // return response.data.results[0].geometry.location;
    
    console.log(`Geocoding address: ${address}`);
    return { lat: 40.7128, lng: -74.0060 }; // Mock: NYC Coordinates
}

module.exports = {
    /**
     * Create a new event
     * POST /api/events
     * Body: { title, description, startTime, endTime, address, tickets: [] }
     */
    createEvent: async (req, res) => {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            const { title, description, startTime, endTime, address, tickets } = req.body;
            const organizerId = req.user.id; // Assumes Auth middleware populates req.user

            // 1. Geocode the address to get coordinates
            // This ensures we always have lat/long for the "location-based discovery" requirement
            let location;
            try {
                location = await geocodeAddress(address);
            } catch (err) {
                throw new Error("Invalid address, could not locate.");
            }

            // 2. Insert Event into Database
            // Note: We store lat/lng explicitly for easy indexing
            const eventQuery = `
                INSERT INTO events 
                (organizer_id, title, description, start_time, end_time, venue_name, address, latitude, longitude, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'published')
                RETURNING id, title
            `;
            const eventValues = [
                organizerId, title, description, startTime, endTime, 
                "TBD Venue Name", address, location.lat, location.lng
            ];
            
            const eventResult = await client.query(eventQuery, eventValues);
            const newEvent = eventResult.rows[0];

            // 3. Insert Tickets (if any)
            if (tickets && tickets.length > 0) {
                const ticketQuery = `
                    INSERT INTO tickets (event_id, name, price, quantity_available)
                    VALUES ($1, $2, $3, $4)
                `;
                for (const ticket of tickets) {
                    await client.query(ticketQuery, [newEvent.id, ticket.name, ticket.price, ticket.quantity]);
                }
            }

            await client.query('COMMIT');
            
            res.status(201).json({
                success: true,
                message: "Event published successfully",
                event: newEvent
            });

        } catch (error) {
            await client.query('ROLLBACK');
            console.error("Create Event Error:", error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        } finally {
            client.release();
        }
    },

    /**
     * Search Events by Location
     * GET /api/events?lat=...&lng=...&radius=...
     */
    searchEvents: async (req, res) => {
        try {
            const { lat, lng, radius = 50 } = req.query; // Radius in KM

            if (!lat || !lng) {
                return res.status(400).json({ message: "Latitude and Longitude are required" });
            }

            // Using the Haversine query defined above (simplified for standard SQL)
            // Ideally, construct the query to filter WHERE distance < radius
            const query = `
                SELECT * FROM (${haversineQuery}) AS detailed_events
                WHERE distance < $3
                ORDER BY distance ASC
                LIMIT 50
            `;
            
            const result = await db.query(query, [lat, lng, radius]);
            
            res.json({
                count: result.rowCount,
                events: result.rows
            });

        } catch (error) {
            console.error("Search Error:", error);
            res.status(500).json({ message: "Search failed" });
        }
    }
};
