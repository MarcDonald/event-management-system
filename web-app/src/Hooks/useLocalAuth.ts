import { Auth } from 'aws-amplify';

interface LoggedInUser {
  getLoggedInUser: () => Promise<User> | any;
  isAdmin: (user: User) => boolean;
}

export enum Role {
  Administrator = 'Administrator',
  Steward = 'Steward',
  ControlRoomOperator = 'ControlRoomOperator',
}

export interface User {
  username: string;
  attributes: {
    sub: string;
    role: Role;
    givenName: string;
    familyName: string;
  };
}

export default function useLocalAuth(): LoggedInUser {
  const getLoggedInUser = async (): Promise<User | null> => {
    try {
      await Auth.currentSession();
      const authUser = await Auth.currentAuthenticatedUser();
      return {
        username: authUser.username,
        attributes: {
          sub: authUser.sub,
          role: authUser.attributes['custom:jobRole'],
          givenName: authUser.attributes['given_name'],
          familyName: authUser.attributes['family_name'],
        },
      };
    } catch (err) {
      console.log(err);
      return null;
    }
  };

  const isAdmin = (user: User): boolean => {
    return user.attributes.role === Role.Administrator;
  };

  return {
    getLoggedInUser,
    isAdmin,
  };
}
