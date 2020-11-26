import StaffRole from './StaffRole';

export default interface StaffMember {
  username: string;
  sub: string;
  role: StaffRole;
  givenName: string;
  familyName: string;
}
