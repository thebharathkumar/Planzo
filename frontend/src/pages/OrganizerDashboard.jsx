import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import StatsOverview from '../components/dashboard/StatsOverview';
import MyEventsList from '../components/dashboard/MyEventsList';
import CreateEventForm from '../components/dashboard/CreateEventForm';

export default function OrganizerDashboard() {
  const [tab, setTab] = useState('events');

  const { data: stats } = useQuery({
    queryKey: ['organizer-stats'],
    queryFn: async () => {
      const { data } = await api.get('/organizer/stats');
      return data;
    },
    retry: 1,
  });

  const { data: eventsData, isLoading: eventsLoading, refetch } = useQuery({
    queryKey: ['my-events'],
    queryFn: async () => {
      const { data } = await api.get('/organizer/events');
      return data;
    },
    retry: 1,
  });

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Organizer Dashboard</h1>
      </div>

      <StatsOverview stats={stats} />

      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${tab === 'events' ? 'active' : ''}`}
          onClick={() => setTab('events')}
        >
          My Events
        </button>
        <button
          className={`tab-btn ${tab === 'create' ? 'active' : ''}`}
          onClick={() => setTab('create')}
        >
          Create Event
        </button>
      </div>

      <div className="dashboard-content">
        {tab === 'events' && (
          <MyEventsList events={eventsData?.events || []} loading={eventsLoading} />
        )}
        {tab === 'create' && (
          <CreateEventForm
            onCreated={() => {
              refetch();
              setTab('events');
            }}
          />
        )}
      </div>
    </div>
  );
}
