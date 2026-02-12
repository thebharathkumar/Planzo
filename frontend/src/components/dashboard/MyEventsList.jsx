import { Link } from 'react-router-dom';

export default function MyEventsList({ events, loading }) {
  if (loading) {
    return <div className="loading-text">Loading your events...</div>;
  }

  if (!events || events.length === 0) {
    return (
      <div className="my-events-empty">
        <p>You haven't created any events yet.</p>
      </div>
    );
  }

  return (
    <div className="my-events-list">
      <h2>My Events</h2>
      <div className="my-events-table">
        <div className="table-header">
          <span>Event</span>
          <span>Date</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        {events.map((event) => (
          <div key={event.id} className="table-row">
            <span className="table-title">{event.title}</span>
            <span>{new Date(event.start_time).toLocaleDateString()}</span>
            <span className={`status-badge status-${event.status}`}>{event.status}</span>
            <Link to={`/event/${event.id}`} className="btn btn-outline btn-sm">
              View
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
