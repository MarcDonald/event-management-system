import VenueStatus from '../models/VenueStatus';

interface VenueStatusColors {
  getVenueStatusColor: (venueStatus: VenueStatus) => string;
  getLightVenueStatusColor: (venueStatus: VenueStatus) => string;
}

/**
 * Convenience functions for determining the colors to display a Venue Status
 */
export default function useVenueStatusColors(): VenueStatusColors {
  const getVenueStatusColor = (venueStatus: VenueStatus): string => {
    switch (venueStatus) {
      case VenueStatus.Low:
        return '#059669';
      case VenueStatus.High:
        return '#D97706';
      case VenueStatus.Evacuate:
        return '#DC2626';
    }
  };

  const getLightVenueStatusColor = (venueStatus: VenueStatus): string => {
    switch (venueStatus) {
      case VenueStatus.Low:
        return '#10B981';
      case VenueStatus.High:
        return '#F59E0B';
      case VenueStatus.Evacuate:
        return '#EF4444';
    }
  };

  return {
    getVenueStatusColor,
    getLightVenueStatusColor,
  };
}
