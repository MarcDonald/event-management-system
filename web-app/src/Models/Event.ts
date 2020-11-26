import VenueMetadata from './VenueMetadata';
import AssignedStaffMember from './AssignedStaffMember';
import AssignedSupervisor from './AssignedSupervisor';

export default interface Event {
  eventId: string;
  name: string;
  venue: VenueMetadata;
  start: number;
  end: number;
  supervisors: AssignedSupervisor[];
  staff: AssignedStaffMember[];
}
