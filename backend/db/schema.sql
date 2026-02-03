-- Enable PostGIS if available (optional but recommended for geo-queries)
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. USERS (Organizers, Attendees, Admins)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Implement secure hashing (e.g., bcrypt)
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('organizer', 'attendee', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. EVENTS (Location-aware)
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    organizer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Location Data
    venue_name VARCHAR(255),
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,  -- For standard geo-lookups
    longitude DOUBLE PRECISION NOT NULL, -- For standard geo-lookups
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for location-based searching (bounding box or radius)
CREATE INDEX idx_events_location ON events (latitude, longitude);
-- Ideally, with PostGIS: CREATE INDEX idx_events_geom ON events USING GIST (ST_MakePoint(longitude, latitude));

-- 3. TICKETS (Types and Inventory)
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g., "General Admission", "VIP"
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    quantity_available INTEGER NOT NULL CHECK (quantity_available >= 0),
    quantity_sold INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. BOOKINGS (Transactions/Reservations)
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL, -- Attendee
    event_id INTEGER NOT NULL REFERENCES events(id),
    total_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'refunded')),
    stripe_payment_intent_id VARCHAR(255), -- Link to Stripe Payment
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. BOOKING ITEMS (Line items for specific tickets in a booking)
CREATE TABLE booking_items (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_booking DECIMAL(10, 2) NOT NULL -- Snapshot of price at time of purchase
);

-- 6. PAYMENTS (Audit trail for financial transactions)
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(id),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    provider VARCHAR(50) DEFAULT 'stripe',
    transaction_id VARCHAR(255) NOT NULL, -- Stripe Charge ID or similar
    status VARCHAR(20) NOT NULL CHECK (status IN ('succeeded', 'failed', 'refunded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. COMMISSION/PAYOUTS (For Business Model)
-- Tracks how much platform fee was taken and what is owed to the organizer
CREATE TABLE payouts (
    id SERIAL PRIMARY KEY,
    organizer_id INTEGER NOT NULL REFERENCES users(id),
    booking_id INTEGER REFERENCES bookings(id), -- Optional: could be aggregated
    amount DECIMAL(10, 2) NOT NULL, -- Amount to be paid out to organizer
    platform_fee DECIMAL(10, 2) NOT NULL, -- Commission retained by Planzo
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
