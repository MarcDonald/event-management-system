import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import LoggedInUser from './LoggedInUser';
import { Auth } from 'aws-amplify';
import styled from 'styled-components';
import { Card } from '../../../styles/GlobalStyles';

interface LoginStateDisplayProps {
  showHomeButton?: boolean;
}

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  grid-template-rows: repeat(2, minmax(0, 1fr));
  margin: 0.5rem;
`;

const HomeButtonContainer = styled.div`
  grid-column-start: 1;
  grid-column: span 1 / span 1;
  grid-row-start: 2;
`;

const HomeCard = styled(Card)`
  text-align: center;
  grid-column-start: 1;
  grid-column: span 1 / span 1;
  vertical-align: middle;
  font-size: 1.5rem;
  padding: 0.75rem;
`;

const HomeIcon = styled(FontAwesomeIcon)`
  height: 100%;
`;

const ActionContainer = styled.div.attrs(
  (props: { showHomeButton: boolean }) => ({
    showHomeButton: props.showHomeButton,
  })
)`
  grid-row-start: 1;
  grid-column-start: ${(props) => (props.showHomeButton ? '2' : '1')};
  grid-column: span 5 / span 5;
`;

const ActionCard = styled(Card)`
  vertical-align: middle;
  align-self: end;
  font-size: 1.25rem;
  padding-left: 0.75rem;

  :hover {
    transform: scale(1.02);
  }
`;

const ActionIcon = styled(FontAwesomeIcon)`
  height: 100%;
`;

const ActionText = styled.span`
  float: right;
`;

const LoggedInUserContainer = styled.div.attrs(
  (props: { showHomeButton: boolean }) => ({
    showHomeButton: props.showHomeButton,
  })
)`
  grid-column-start: ${(props) => {
    return props.showHomeButton ? '2' : '1';
  }};
  grid-column: ${(props) => {
    return props.showHomeButton ? 'span 4 / span 4' : 'span 5 / span 5';
  }};
  grid-row-start: 2;
`;

/**
 * Displays the currently logged in user's details, an logout option, and an optional home button
 */
export default function LoginStateDisplay(props: LoginStateDisplayProps) {
  const history = useHistory();
  const [showLogout, setShowLogout] = useState<boolean>(false);

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
            <ActionIcon
              icon={faSignOutAlt}
              title="Sign Out"
              aria-label="Sign Out"
            />
            <ActionText>Logout</ActionText>
          </ActionCard>
        )}
      </ActionContainer>
      <LoggedInUserContainer showHomeButton={props.showHomeButton}>
        <LoggedInUser showLogout={() => setShowLogout(true)} />
      </LoggedInUserContainer>
    </Container>
  );
}
