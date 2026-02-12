import { useLocation } from '../../hooks/useLocation';

export default function MapView({ events = [] }) {
  const { location } = useLocation();

  // Placeholder for Google Maps integration
  // In production, integrate @react-google-maps/api or similar
  return (
    <div className="map-view">
      <div className="map-placeholder">
        <div className="map-placeholder-content">
          <span className="map-icon">🗺️</span>
          <p>Map View</p>
          <p className="map-coords">
            {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </p>
          <p className="map-event-count">
            {events.length} event{events.length !== 1 ? 's' : ''} nearby
          </p>
        </div>
      </div>
    </div>
  );
}
