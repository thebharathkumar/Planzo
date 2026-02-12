import { useContext } from 'react';
import { LocationContext } from '../providers/contexts';

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocation must be used within a LocationProvider');
  return context;
}
