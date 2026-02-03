# Planzo Backend API Architecture

This document outlines the RESTful API endpoints required to support the Planzo business case.

## 1. Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/register` | Register a new user (Organizer or Attendee) | Public |
| POST | `/login` | Authenticate and receive JWT | Public |
| GET | `/me` | Get current user's profile | Private |

## 2. Events (`/api/events`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/` | Search events. Query Params: `lat`, `lng`, `radius`, `date` | Public |
| GET | `/:id` | Get detailed event info | Public |
| POST | `/` | Create a new event | Organizer |
| PUT | `/:id` | Update an event | Organizer (Owner) |
| DELETE | `/:id` | Cancel/Delete an event | Organizer (Owner) |

### Search Logic
- **Attendee Discovery**: The `GET /` endpoint is critical.
- **Parameters**: `lat` (Latitude), `lng` (Longitude), `radius` (in km or miles).
- **Implementation**: Use Haversine formula or PostGIS `ST_DWithin` to find events within the radius.

## 3. Bookings (`/api/bookings`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/` | Reserve tickets (creates pending booking + Stripe Intent) | Authenticated |
| POST | `/:id/confirm` | Webhook or client confirmation of payment success | System/Auth |
| GET | `/` | List my bookings (Attendee) or Sales (Organizer) | Private |

## 4. Organizer Dashboard (`/api/organizer`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/stats` | Sales overview, revenue, active events count | Organizer |

## Data Flow for "Create Event"
1. Organizer submits form with `Address`.
2. Backend (or Frontend) calls Google Maps Geocoding API to get `lat/lng`.
3. Backend saves `title`, `description`, `lat`, `lng`, `organizer_id` to PostgreSQL.
