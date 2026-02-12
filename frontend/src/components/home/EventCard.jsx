import { Link } from 'react-router-dom';

export default function EventCard({ event }) {
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <Link to={`/event/${event.id}`} className="event-card">
      <div className="event-card-image">
        <div className="event-card-placeholder">
          <span>📅</span>
        </div>
        {event.status === 'published' && (
          <span className="event-card-badge">Live</span>
        )}
      </div>
      <div className="event-card-body">
        <p className="event-card-date">{formatDate(event.start_time)}</p>
        <h3 className="event-card-title">{event.title}</h3>
        <p className="event-card-venue">
          📍 {event.venue_name || event.address}
        </p>
        {event.distance && (
          <p className="event-card-distance">{event.distance.toFixed(1)} km away</p>
        )}
      </div>
    </Link>
  );
}
