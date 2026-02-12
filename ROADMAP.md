# Planzo: Zero to MVP Roadmap

## Phase 1: Foundation & Infrastructure (Week 1)
- [x] **Project Setup**: Initialize Monorepo (or separate Frontend/Backend repos).
- [ ] **Database**: Spin up PostgreSQL (preferably with PostGIS). Run `schema.sql`.
- [x] **Backend Base**: Setup Express app, configure `dotenv`, `cors`, and connect to DB.
- [x] **Frontend Base**: `create-react-app` or `vite`. Install `react-router-dom`, `axios`, `react-query`.
- [ ] **CI/CD**: Basic GitHub Actions to run linting/tests on PRs.

## Phase 2: Core User Management (Week 1-2)
- [x] **Backend Auth**: Implement JWT Authentication (`/register`, `/login`, `/me`).
- [x] **Frontend Auth**: Create Login/Register forms. Implement `AuthProvider` to store token.
- [x] **Roles**: Ensure middleware restricts "Create Event" to Organizers.

## Phase 3: The "Organizer" Experience (Week 2)
- [x] **Event CRUD API**: Implement `createEvent` (as designed in `EventController.js`).
- [ ] **Image Upload**: Integrate AWS S3 or Cloudinary for event banners.
- [x] **Organizer Dashboard**: Build the UI for generating events and adding tickets.
- [ ] **Google Places**: Integrate Places Autocomplete in the "Create Event" form to get accurate addresses.

## Phase 4: The "Discovery" Experience (Week 3) (Critical Value Prop)
- [ ] **Geocoding**: Connect Backend to Google Maps Geocoding API.
- [x] **Search API**: Implement the Haversine/PostGIS query logic (`GET /events?lat=...`).
- [x] **Interactive Map**: Build the `MapView` in React. Plot pins for events.
- [x] **User Location**: Implement the browser geolocation prompt logic.

## Phase 5: Ticketing & Payments (Week 3-4)
- [ ] **Stripe Account**: Set up Stripe connect or standard account.
- [x] **Backend Booking**: Implement `/api/bookings` to create a `PaymentIntent`.
- [x] **Frontend Checkout**: Build `CheckoutFlow` using `Stripe Elements`.
- [ ] **Webhooks**: Handle `payment_intent.succeeded` to flip Booking status to `confirmed`.

## Phase 6: Polish & Launch (Week 4)
- [ ] **Emails**: Integrate SendGrid/Resend to email tickets (QR Codes) upon confirmation.
- [ ] **Load Testing**: high-traffic lookup test (using Redis for caching if needed).
- [x] **Deployment**:
  - Backend: Vercel Serverless Functions (Express wrapped as serverless).
  - Frontend: Vercel (Vite build served as static files).
  - DB: Vercel Postgres / Supabase / Neon (see DEPLOYMENT.md).

## MVP Cut-Line (Post-MVP Features)
- Social features (Following organizers).
- Advanced Recurring Events.
- Waitlists.
- Admin Payout Management (Manual payouts for MVP).
