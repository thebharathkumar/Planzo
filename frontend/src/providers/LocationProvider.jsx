import { useState, useRef, useCallback } from 'react';
import { LocationContext } from './contexts';

// Default fallback: San Francisco
const DEFAULT_LOCATION = { lat: 37.7749, lng: -122.4194 };

function getInitialLocationStatus() {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return 'denied';
  }
  return 'pending';
}

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [locationStatus, setLocationStatus] = useState(getInitialLocationStatus);
  const initialized = useRef(false);

  const requestLocation = useCallback(() => {
    if (initialized.current) return;
    initialized.current = true;

    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationStatus('granted');
      },
      () => {
        setLocationStatus('denied');
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );
  }, []);

  // Trigger geolocation on first render via ref callback
  const refCallback = useCallback(
    (node) => {
      if (node) requestLocation();
    },
    [requestLocation]
  );

  return (
    <LocationContext.Provider value={{ location, locationStatus, setLocation }}>
      <div ref={refCallback} style={{ display: 'contents' }}>
        {children}
      </div>
    </LocationContext.Provider>
  );
}
