import React, { useEffect, useState } from 'react';
import useLoggedInUserDetails from '../../Hooks/useLoggedInUserDetails';
import Card from '../Card';

interface LoggedInUserPropTypes {
  showLogout: () => void;
}

/**
 * Displays the currently logged in user's details as well as a logout option
 */
export default function LoggedInUser(props: LoggedInUserPropTypes) {
  const loggedInUserDetails = useLoggedInUserDetails();
  const [user, setUser] = useState({
    name: '',
    role: '',
  });

  useEffect(() => {
    const onLoad = async () => {
      const currentUser = await loggedInUserDetails.getLoggedInUser();
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
        className="flex flex-row justify-end py-1 transition-none transform-none cursor-auto"
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
