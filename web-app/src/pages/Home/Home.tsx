import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import useLoggedInUserDetails from '../../shared/hooks/useLoggedInUserDetails';
import StaffMember from '../../shared/models/StaffMember';
import LoginStateDisplay from '../../shared/components/LoginStateDisplay/LoginStateDisplay';
import UpcomingEvents from './components/UpcomingEvents';
import usePageProtection from '../../shared/hooks/usePageProtection';
import {
  ActionsContainer,
  Container,
  Content,
  Header,
  ManagementButton,
  ManagementSection,
  ManagementTitle,
  StewardAccessWarning,
  UpcomingEventsSection,
  UserDetailsRow,
  UserDetailsWrapper,
} from './HomeStyles';

/**
 * Home page for logged in users
 */
export default function Home() {
  const loggedInUserDetails = useLoggedInUserDetails();
  const pageProtection = usePageProtection();
  const history = useHistory();
  const [user, setUser] = useState<null | StaffMember>(null);

  useEffect(() => {
    pageProtection.loggedInProtection().then(async () => {
      const user = await loggedInUserDetails.getLoggedInUser();
      setUser(user);
    });
  }, []);

  if (user) {
    return (
      <Container>
        <Header />
        <Content>
          <UserDetailsRow>
            <UserDetailsWrapper>
              <LoginStateDisplay />
            </UserDetailsWrapper>
          </UserDetailsRow>
          <ActionsContainer>
            {loggedInUserDetails.isSteward(user) && (
              <StewardAccessWarning>
                This dashboard is for Control Room Operators and Administrators
                only
              </StewardAccessWarning>
            )}
            {(loggedInUserDetails.isControlRoomOperator(user) ||
              loggedInUserDetails.isAdmin(user)) && (
              <UpcomingEventsSection>
                <UpcomingEvents />
              </UpcomingEventsSection>
            )}
            {loggedInUserDetails.isAdmin(user) && (
              <ManagementSection>
                <ManagementTitle>Management</ManagementTitle>
                <ManagementButton
                  onClick={() => history.push('/management/venues')}
                >
                  Manage Venues
                </ManagementButton>
                <ManagementButton
                  onClick={() => history.push('/management/events')}
                >
                  Manage Events
                </ManagementButton>
                <ManagementButton
                  onClick={() => history.push('/management/staff')}
                >
                  Manage Staff
                </ManagementButton>
              </ManagementSection>
            )}
          </ActionsContainer>
        </Content>
      </Container>
    );
  } else {
    return <></>;
  }
}
