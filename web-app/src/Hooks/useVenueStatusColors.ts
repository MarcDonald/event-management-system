import VenueStatus from '../Models/VenueStatus';

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
        return 'bg-green-600';
      case VenueStatus.High:
        return 'bg-yellow-600';
      case VenueStatus.Evacuate:
        return 'bg-red-600';
    }
  };

  const getLightVenueStatusColor = (venueStatus: VenueStatus): string => {
    switch (venueStatus) {
      case VenueStatus.Low:
        return 'bg-green-500';
      case VenueStatus.High:
        return 'bg-yellow-500';
      case VenueStatus.Evacuate:
        return 'bg-red-500';
    }
  };

  return {
    getVenueStatusColor,
    getLightVenueStatusColor,
  };
}
