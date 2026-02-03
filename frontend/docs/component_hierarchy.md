# Planzo Frontend Component Hierarchy

## 1. High-Level Structure
The application behaves somewhat differently for Organizers vs Attendees.
- **Shared Layout**: Navbar, Footer, ToastNotifications.
- **Routes**:
  - `/` (Home/Discovery - Attendee focused)
  - `/login`, `/register`
  - `/event/:id` (Event Details)
  - `/checkout` (Booking Flow)
  - `/organizer` (Dashboard - Protected)

## 2. Component Tree

### App Root
- `App.js` (Routes definitions, Providers)
  - `AuthProvider` (Context: User Session)
  - `LocationProvider` (Context: Lat/Lng)
  - `CartProvider` (Context: Selected Tickets)

### Core Pages & Components

#### A. Discovery (Home)
- `HomePage`
  - `HeroSection` (Search bar)
  - `MapView` (Google Maps integration)
    - `EventMarker` (Clickable pins)
  - `EventList`
    - `EventCard` (Thumbnail, Title, Date, "Book Now" button)
  - `FilterBar` (Distance, Date, Category)

#### B. Event Details
- `EventDetailsPage`
  - `EventHero` (Image, Title)
  - `InfoSection` (Description, Map static view)
  - `TicketSelector`
    - `TicketItem` (Type, Price, Counter)
    - `AddToCartButton`

#### C. Checkout Flow
- `CheckoutPage`
  - `CartSummary` (Items, total)
  - `PaymentForm` (Stripe Elements wrappers)
  - `ConfirmationView` (Success message, QR code placeholder)

#### D. Organizer Dashboard
- `DashboardLayout` (Sidebar navigation)
  - `StatsOverview` (Graph of sales)
  - `MyEventsList`
  - `CreateEventForm`
    - `LocationPicker` (Google Places Autocomplete)
    - `TicketConfigurator` (Dynamic list for adding ticket types)

## 3. State Management Strategy

### A. User Location (`LocationProvider`)
- **Requirement**: "Solves the visibility gap... inclusive location-based discovery".
- **Strategy**: React Context + `navigator.geolocation`.
- **Logic**:
  - On load, ask for permission.
  - If granted, store `{ lat, lng }` in Context.
  - If denied, fallback to IP-based location or default (e.g., San Francisco).
  - This context is consumed by `HomePage` to trigger the API call: `GET /events?lat=...`.

### B. Cart Data (`CartProvider`)
- **Requirement**: "Book tickets".
- **Strategy**: React Context (simpler than Redux for this MVP).
- **Structure**:
  ```json
  {
    "eventId": "123",
    "items": [
        { "ticketId": 1, "quantity": 2, "price": 20.00 }
    ],
    "total": 40.00,
    "expiresAt": "timestamp"
  }
  ```
- **Persistence**: `localStorage` to persist cart across refresh, but clear it if they navigate to a different event (Planzo restricts bookings to one event at a time to simplify logic).

### C. Server State (Events, Bookings)
- **Strategy**: React Query (TanStack Query).
- **Why**: Handles caching, loading states, and refetching automatically. Essential for the "Discovery" map which might need frequent updates as the user drags the map.
