import { Auth } from 'aws-amplify';

interface LoggedInUser {
  getLoggedInUser: () => any;
}

export default function useLoggedInUser(): LoggedInUser {
  const getLoggedInUser = async () => {
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
