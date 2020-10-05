import { Auth } from 'aws-amplify';
import { CognitoUser } from 'amazon-cognito-identity-js';

interface LoggedInUser {
  getLoggedInUser: () => any;
}

export default function useLocalAuth(): LoggedInUser {
  const getLoggedInUser = async (): Promise<CognitoUser | null> => {
    try {
      await Auth.currentSession();
      return Auth.currentAuthenticatedUser();
    } catch (err) {
      console.log(err);
      return null;
    }
  };

  return {
    getLoggedInUser,
  };
}
