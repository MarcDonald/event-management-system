import { Auth } from 'aws-amplify';
import StaffMember from '../models/StaffMember';
import StaffRole from '../models/StaffRole';

interface LoggedInUserDetails {
  getLoggedInUser: () => Promise<StaffMember> | any;
  isAdmin: (user: StaffMember) => boolean;
  isControlRoomOperator: (user: StaffMember) => boolean;
  isSteward: (user: StaffMember) => boolean;
}

/**
 * Provides some convenience functions for retrieving details about the currently logged in user
 */
export default function useLoggedInUserDetails(): LoggedInUserDetails {
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
      if (err === 'No current user') {
        console.debug(err);
      } else {
        console.log(err);
      }
      return null;
    }
  };

  const isAdmin = (user: StaffMember): boolean => {
    return user.role === StaffRole.Administrator;
  };

  const isControlRoomOperator = (user: StaffMember): boolean => {
    return user.role === StaffRole.ControlRoomOperator;
  };

  const isSteward = (user: StaffMember): boolean => {
    return user.role === StaffRole.Steward;
  };

  return {
    getLoggedInUser,
    isAdmin,
    isControlRoomOperator,
    isSteward,
  };
}
