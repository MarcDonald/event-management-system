import React, { useEffect, useState } from 'react';
import useLoggedInUserDetails from '../../hooks/useLoggedInUserDetails';
import styled from 'styled-components';
import { Card } from '../../../styles/GlobalStyles';

interface LoggedInUserProps {
  showLogout: () => void;
}

const LoginDetailsCard = styled(Card)`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  padding: 0.5rem;
  cursor: default;

  :hover {
    transition: none;
    transform: none;
  }

  :focus {
    transition: none;
    transform: none;
  }
`;

const Content = styled.span`
  display: flex;
  flex-direction: column;
  text-align: right;
`;

const Username = styled.span`
  font-weight: 600;
`;

const Role = styled.span`
  font-size: 0.875rem;
`;

/**
 * Displays the currently logged in user's details as well as a logout option
 */
export default function LoggedInUser(props: LoggedInUserProps) {
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
    <LoginDetailsCard onMouseEnter={props.showLogout}>
      <Content>
        <span>
          Logged in as <Username>{user.name}</Username>
        </span>
        <Role>{user.role}</Role>
      </Content>
    </LoginDetailsCard>
  );
}
