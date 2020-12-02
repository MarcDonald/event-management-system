import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import LoggedInUser from './LoggedInUser';
import Card from '../Card';
import { Auth } from 'aws-amplify';

interface LoginStateDisplayPropTypes {
  showHomeButton?: boolean;
}

/**
 * Displays the currently logged in user's details, an logout option, and an optional home button
 */
export default function LoginStateDisplay(props: LoginStateDisplayPropTypes) {
  const history = useHistory();
  const [showLogout, setShowLogout] = useState<boolean>(false);

  const logout = async () => {
    await Auth.signOut();
    history.replace('/login');
  };

  const userDisplayColumnSetup = props.showHomeButton
    ? 'col-start-2 col-span-4'
    : 'col-start-1 col-span-5';

  return (
    <div
      className="grid grid-cols-5 grid-rows-2 m-2"
      onMouseLeave={() => setShowLogout(false)}
    >
      {props.showHomeButton && (
        <div className="col-start-1 col-span-1 row-start-2">
          <Card
            onClick={() => history.push('/')}
            className="text-center col-start-1 col-span-1 align-middle mr-2 text-2xl"
          >
            <FontAwesomeIcon icon={faHome} className="h-full" />
          </Card>
        </div>
      )}
      <div className={`${userDisplayColumnSetup} row-start-1`}>
        {showLogout && (
          <Card className="align-middle self-end text-xl pl-3" onClick={logout}>
            <FontAwesomeIcon icon={faSignOutAlt} className="h-full" />
            <span className="float-right">Logout</span>
          </Card>
        )}
      </div>
      <div className={`${userDisplayColumnSetup} row-start-2`}>
        <LoggedInUser showLogout={() => setShowLogout(true)} />
      </div>
    </div>
  );
}
