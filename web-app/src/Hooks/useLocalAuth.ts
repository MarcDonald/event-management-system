import { Auth } from 'aws-amplify';
import StaffMember from '../Models/StaffMember';
import StaffRole from '../Models/StaffRole';

interface LoggedInUser {
  getLoggedInUser: () => Promise<StaffMember> | any;
  isAdmin: (user: StaffMember) => boolean;
}

export default function useLocalAuth(): LoggedInUser {
  const getLoggedInUser = async (): Promise<StaffMember | null> => {
    try {
      await Auth.currentSession();
      const authUser = await Auth.currentAuthenticatedUser();
      return {
        username: authUser.username,
        sub: authUser.sub,
        role: authUser.attributes['custom:jobRole'],
        givenName: authUser.attributes['given_name'],
        familyName: authUser.attributes['family_name'],
      };
    } catch (err) {
      console.log(err);
      return null;
    }
  };

  const isAdmin = (user: StaffMember): boolean => {
    return user.role === StaffRole.Administrator;
  };

  return {
    getLoggedInUser,
    isAdmin,
  };
}
