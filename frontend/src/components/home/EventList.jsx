import EventCard from './EventCard';

export default function EventList({ events, loading }) {
  if (loading) {
    return (
      <div className="event-list-loading">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="event-card-skeleton" />
        ))}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="event-list-empty">
        <span className="empty-icon">🎭</span>
        <h3>No events found nearby</h3>
        <p>Try expanding your search radius or check back later.</p>
      </div>
    );
  }

  return (
    <div className="event-list">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
