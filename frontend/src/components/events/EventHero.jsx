export default function EventHero({ event }) {
  return (
    <div className="event-hero">
      <div className="event-hero-image">
        <div className="event-hero-placeholder">
          <span>🎉</span>
        </div>
      </div>
      <div className="event-hero-overlay">
        <h1 className="event-hero-title">{event.title}</h1>
        <p className="event-hero-venue">📍 {event.venue_name || event.address}</p>
      </div>
    </div>
  );
}
