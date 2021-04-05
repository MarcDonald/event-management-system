import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { faHome, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Auth } from 'aws-amplify';
import {
  Container,
  HomeButtonContainer,
  HomeCard,
  HomeIcon,
  ActionContainer,
  ActionCard,
  LoggedInUserContainer,
  LoginDetailsCard,
  Username,
  Role,
  LoggedInUserDetails,
} from './LoginStateDisplayStyles';
import useLoggedInUserDetails from '../../hooks/useLoggedInUserDetails';

interface LoginStateDisplayProps {
  showHomeButton?: boolean;
}

/**
 * Displays the currently logged in user's details, an logout option, and an optional home button
 */
export default function LoginStateDisplay(props: LoginStateDisplayProps) {
  const history = useHistory();
  const [showLogout, setShowLogout] = useState<boolean>(false);
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

  const logout = async () => {
    await Auth.signOut();
    history.replace('/login');
  };

  return (
    <Container onMouseLeave={() => setShowLogout(false)}>
      {props.showHomeButton && (
        <HomeButtonContainer>
          <HomeCard onClick={() => history.push('/')}>
            <HomeIcon icon={faHome} title="Home" aria-label="Home" />
          </HomeCard>
        </HomeButtonContainer>
      )}
      <ActionContainer showHomeButton={props.showHomeButton}>
        {showLogout && (
          <ActionCard onClick={logout}>
            <FontAwesomeIcon
              icon={faSignOutAlt}
              title="Logout"
              aria-label="Logout"
            />
            <span>Logout</span>
          </ActionCard>
        )}
      </ActionContainer>
      <LoggedInUserContainer showHomeButton={props.showHomeButton}>
        <LoginDetailsCard onMouseEnter={() => setShowLogout(true)}>
          <LoggedInUserDetails>
            <span>
              Logged in as <Username>{user.name}</Username>
            </span>
            <Role>{user.role}</Role>
          </LoggedInUserDetails>
        </LoginDetailsCard>
      </LoggedInUserContainer>
    </Container>
  );
}
