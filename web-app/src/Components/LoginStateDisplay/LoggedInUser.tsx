import React, { useEffect, useState } from 'react';
import useLocalAuth from '../../Hooks/useLocalAuth';
import Card from '../Card';

interface LoggedInUserPropTypes {
  showLogout: () => any | void;
}

export default function LoggedInUser(props: LoggedInUserPropTypes) {
  const localAuth = useLocalAuth();
  const [user, setUser] = useState({
    name: '',
    role: '',
  });

  useEffect(() => {
    const onLoad = async () => {
      const currentUser = await localAuth.getLoggedInUser();
      setUser({
        name: `${currentUser.givenName} ${currentUser.familyName}`,
        role: currentUser.role,
      });
    };

    onLoad().then();
  }, []);

  return (
    <div>
      <Card
        onMouseEnter={props.showLogout}
        className="flex flex-row justify-end py-1"
      >
        <div className="flex flex-col text-right">
          <span className="text-md">
            Logged in as <span className="font-semibold">{user.name}</span>
          </span>
          <span className="text-sm">{user.role}</span>
        </div>
      </Card>
    </div>
  );
}
