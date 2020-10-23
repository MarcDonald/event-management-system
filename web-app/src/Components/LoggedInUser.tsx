import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import useLocalAuth from '../Hooks/useLocalAuth';
import { Auth } from 'aws-amplify';

export default function LoggedInUser() {
  const localAuth = useLocalAuth();
  const history = useHistory();
  const [user, setUser] = useState({
    name: '',
    role: '',
  });

  useEffect(() => {
    const onLoad = async () => {
      const currentUser = await localAuth.getLoggedInUser();
      const { attributes } = currentUser;
      setUser({
        name: `${attributes.givenName} ${attributes.familyName}`,
        role: attributes.role,
      });
    };

    onLoad().then();
  }, []);

  const logout = async () => {
    await Auth.signOut();
    history.replace('/login');
  };

  return (
    <div
      onClick={logout}
      className="bg-inactive-gray hover:bg-active-gray cursor-pointer rounded-md items-center flex flex-row justify-around py-1"
    >
      <div className="flex flex-col text-right">
        <span className="text-md">
          Logged in as <span className="font-semibold">{user.name}</span>
        </span>
        <span className="text-sm">{user.role}</span>
      </div>
    </div>
  );
}
