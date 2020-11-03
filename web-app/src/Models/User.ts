import UserRole from './UserRole';

export default interface User {
  username: string;
  sub: string;
  role: UserRole;
  givenName: string;
  familyName: string;
}
