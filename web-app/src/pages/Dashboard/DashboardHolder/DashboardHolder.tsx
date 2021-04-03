import React, { useState } from 'react';
import PositionsDashboard from './PositionsDashboard/PositionsDashboard';
import Event from '../../../shared/models/Event';
import AssistanceRequest from '../../../shared/models/AssistanceRequest';
import VenueStatus from '../../../shared/models/VenueStatus';
import DashboardSelectorTabs, {
  Dashboards,
} from './components/DashboardSelectorTabs';
import StatusFooter from './components/StatusFooter';
import VenueStatusChanger from './components/VenueStatusChanger';
import styled from 'styled-components';
import IncidentsDashboard from './IncidentsDashboard/IncidentsDashboard';

interface DashboardHolderProps {
  eventInformation: Event;
  assistanceRequests: AssistanceRequest[];
  venueStatus: VenueStatus;
  onVenueStatusChange: (venueStatus: VenueStatus) => void;
  onHandleAssistanceRequest: (id: string) => void;
}

const Container = styled.section`
  grid-column-start: 2;
  grid-column: span 4 / span 4;
  margin-top: 0.5rem;
  display: grid;
  grid-template-rows: auto 1fr auto auto;
  grid-template-columns: 100%;
`;

/**
 * Centerpiece of the main dashboard page which contains the tabs for changing the type of dashboard, as well as containing the specific dashboard selected
 */
export default function DashboardHolder(props: DashboardHolderProps) {
  const { eventInformation, assistanceRequests, venueStatus } = props;
  const [currentDashboard, setCurrentDashboard] = useState<Dashboards>(
    Dashboards.Positions
  );

  function onTabChange(dashboardChangedTo: Dashboards) {
    setCurrentDashboard(dashboardChangedTo);
  }

  return (
    <Container>
      <DashboardSelectorTabs
        onTabChange={onTabChange}
        currentTab={currentDashboard}
      />
      {currentDashboard === Dashboards.Incidents && (
        <IncidentsDashboard
          assistanceRequests={assistanceRequests}
          onHandleAssistanceRequest={props.onHandleAssistanceRequest}
        />
      )}
      {currentDashboard === Dashboards.Positions && (
        <PositionsDashboard
          positions={eventInformation.venue.positions}
          assignedStaff={eventInformation.staff}
          assistanceRequests={assistanceRequests}
        />
      )}
      <VenueStatusChanger
        eventId={eventInformation.eventId}
        status={venueStatus}
        onVenueStatusChange={props.onVenueStatusChange}
      />
      <StatusFooter status={venueStatus} />
    </Container>
  );
}
