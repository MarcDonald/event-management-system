import { Auth } from 'aws-amplify';
import StaffMember from '../Models/StaffMember';
import StaffRole from '../Models/StaffRole';
import VenueStatus from '../Models/VenueStatus';

interface VenueStatusColors {
  getVenueStatusColor: (venueStatus: VenueStatus) => string;
  getLightVenueStatusColor: (venueStatus: VenueStatus) => string;
}

export default function useVenueStatusColors(): VenueStatusColors {
  const getVenueStatusColor = (venueStatus: VenueStatus): string => {
    switch (venueStatus) {
      case VenueStatus.Low:
        return 'bg-green-600';
      case VenueStatus.High:
        return 'bg-orange-600';
      case VenueStatus.Evacuate:
        return 'bg-red-600';
    }
  };

  const getLightVenueStatusColor = (venueStatus: VenueStatus): string => {
    switch (venueStatus) {
      case VenueStatus.Low:
        return 'bg-green-500';
      case VenueStatus.High:
        return 'bg-orange-500';
      case VenueStatus.Evacuate:
        return 'bg-red-500';
    }
  };

  return {
    getVenueStatusColor,
    getLightVenueStatusColor,
  };
}
