import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import BrandHeader from '../../Components/BrandHeader';
import useLocalAuth from '../../Hooks/useLocalAuth';
import { CognitoUser } from 'amazon-cognito-identity-js';
import { Auth } from 'aws-amplify';
import AsyncButton from '../../Components/AsyncButton';

function Home() {
  const localAuth = useLocalAuth();
  const history = useHistory();
  const [user, setUser] = useState<null | CognitoUser>(null);
  const [isLoadingLogout, setIsLoadingLogout] = useState(false);

  useEffect(() => {
    const redirectToLogin = async () => {
      const user = await localAuth.getLoggedInUser();
      if (user) {
        setUser(user);
      } else {
        history.replace('/login');
      }
    };

    redirectToLogin().then();
  }, []);

  const logout = async () => {
    await Auth.signOut();
    history.replace('/login');
  };

  if (user) {
    return (
      <>
        <BrandHeader />
        <h1 className="text-xl">Home</h1>
        <h2>{user.getUsername()}</h2>
        <AsyncButton
          onClick={logout}
          isLoading={isLoadingLogout}
          text="Log Out"
        />
      </>
    );
  } else {
    return <></>;
  }
}

export default Home;
