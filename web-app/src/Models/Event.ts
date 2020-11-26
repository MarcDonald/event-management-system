import AssignedStaffMember from './AssignedStaffMember';
import AssignedSupervisor from './AssignedSupervisor';
import Venue from './Venue';

export default interface Event {
  eventId: string;
  name: string;
  venue: Venue;
  start: number;
  end: number;
  supervisors: AssignedSupervisor[];
  staff: AssignedStaffMember[];
}
