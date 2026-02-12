import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import EventHero from '../components/events/EventHero';
import TicketSelector from '../components/events/TicketSelector';

export default function EventDetailsPage() {
  const { id } = useParams();

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const { data } = await api.get(`/events/${id}`);
      return data.event || data;
    },
  });

  if (isLoading) return <div className="loading-screen">Loading event...</div>;
  if (error) return <div className="error-screen">Event not found.</div>;

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

  return (
    <div className="event-details-page">
      <EventHero event={event} />

      <div className="event-details-content">
        <div className="event-details-main">
          <section className="event-info-section">
            <h2>About This Event</h2>
            <p>{event.description || 'No description provided.'}</p>
          </section>

          <section className="event-info-section">
            <h2>Date & Time</h2>
            <p>
              <strong>Start:</strong> {formatDate(event.start_time)}
            </p>
            <p>
              <strong>End:</strong> {formatDate(event.end_time)}
            </p>
          </section>

          <section className="event-info-section">
            <h2>Location</h2>
            <p>{event.venue_name}</p>
            <p>{event.address}</p>
          </section>
        </div>

        <div className="event-details-sidebar">
          <TicketSelector event={event} tickets={event.tickets || []} />
        </div>
      </div>
    </div>
  );
}
