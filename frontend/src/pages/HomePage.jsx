import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from '../hooks/useLocation';
import api from '../utils/api';
import HeroSection from '../components/home/HeroSection';
import FilterBar from '../components/home/FilterBar';
import MapView from '../components/home/MapView';
import EventList from '../components/home/EventList';

export default function HomePage() {
  const { location } = useLocation();
  const [radius, setRadius] = useState(50);
  const [category, setCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['events', location.lat, location.lng, radius, category, searchQuery],
    queryFn: async () => {
      const params = {
        lat: location.lat,
        lng: location.lng,
        radius,
      };
      if (category !== 'All') params.category = category;
      if (searchQuery) params.q = searchQuery;

      const { data } = await api.get('/events', { params });
      return data;
    },
    staleTime: 60000,
    retry: 1,
  });

  return (
    <div className="home-page">
      <HeroSection onSearch={setSearchQuery} />
      <div className="home-content">
        <FilterBar
          radius={radius}
          onRadiusChange={setRadius}
          category={category}
          onCategoryChange={setCategory}
        />
        <div className="home-grid">
          <div className="home-map-section">
            <MapView events={data?.events || []} />
          </div>
          <div className="home-events-section">
            <h2 className="section-title">
              {searchQuery ? `Results for "${searchQuery}"` : 'Events Near You'}
              {data?.count != null && (
                <span className="section-count"> ({data.count})</span>
              )}
            </h2>
            <EventList events={data?.events || []} loading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
