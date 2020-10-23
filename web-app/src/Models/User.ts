import UserRole from './UserRole';

export default interface User {
  username: string;
  attributes: {
    sub: string;
    role: UserRole;
    givenName: string;
    familyName: string;
  };
}
