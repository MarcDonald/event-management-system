import StaffMember from './StaffMember';
import Position from './Position';

export default interface AssignedSupervisor {
  staffMember: StaffMember;
  areaOfSupervision: string;
}
