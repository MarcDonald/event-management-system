import React from 'react';
import LoginStateDisplay from '../../../shared/components/LoginStateDisplay';
import AssignedSupervisor from '../../../shared/models/AssignedSupervisor';
import { SideNavTitle } from '../../../styles/GlobalStyles';
import { Card } from '../../../styles/GlobalStyles';
import styled from 'styled-components';

interface EventDetailsDrawerProps {
  venueName: string;
  eventName: string;
  supervisors: AssignedSupervisor[];
}

const Container = styled.div`
  grid-column-start: 1;
  display: grid;
  background-color: ${(props) => props.theme.surface};
`;

const EventNameAndVenueCard = styled.div`
  margin: 1rem;
  padding: 0.5rem;
  border-radius: 0.375rem;
  color: ${(props) => props.theme.onBrand};
  background-color: ${(props) => props.theme.brand};
  text-align: center;
`;

const VenueName = styled.p`
  font-weight: bold;
  font-size: 1.5rem;
`;

const EventName = styled.p`
  font-size: 1.25rem;
`;

const SupervisorCard = styled(Card)`
  margin: 0.5rem 0.75rem 0 0.75rem;
  transition: none;
  transform: none;
  cursor: auto;
`;

const SupervisorName = styled.p`
  font-weight: bold;
  font-size: 1.25rem;
`;

const SupervisorPosition = styled.p``;

const LoginDetailsContainer = styled.div`
  align-self: end;
`;

/**
 * Drawer that displays the basic details of the event as well as the supervisors assigned to the event
 */
export default function EventDetailsDrawer(props: EventDetailsDrawerProps) {
  const supervisorDisplayList = () => {
    return props.supervisors.map((supervisor) => {
      return (
        <SupervisorCard key={supervisor.staffMember.sub}>
          <SupervisorName>
            {supervisor.staffMember.givenName}{' '}
            {supervisor.staffMember.familyName}
          </SupervisorName>
          <SupervisorPosition>
            {supervisor.areaOfSupervision}
          </SupervisorPosition>
        </SupervisorCard>
      );
    });
  };

  return (
    <Container>
      <section>
        <EventNameAndVenueCard>
          <VenueName>{props.venueName}</VenueName>
          <EventName>{props.eventName}</EventName>
        </EventNameAndVenueCard>
        <SideNavTitle>Supervisors</SideNavTitle>
        {supervisorDisplayList()}
      </section>
      <LoginDetailsContainer>
        <LoginStateDisplay showHomeButton={true} />
      </LoginDetailsContainer>
    </Container>
  );
}
