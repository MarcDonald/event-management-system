import React from 'react';
import PositionsDashboard from './PositionsDashboard/PositionsDashboard';
import Event from '../../../Models/Event';
import AssistanceRequest from '../../../Models/AssistanceRequest';
import VenueStatus from '../../../Models/VenueStatus';
import DashboardSelectorTabs from './DashboardSelectorTabs';
import StatusFooter from './StatusFooter';
import VenueStatusChanger from './VenueStatusChanger';

interface DashboardHolderPropTypes {
  eventInformation: Event;
  assistanceRequests: AssistanceRequest[];
  venueStatus: VenueStatus;
  onVenueStatusChange: (venueStatus: VenueStatus) => void;
}

/**
 * Centerpiece of the main dashboard page which contains the tabs for changing the type of dashboard, as well as containing the specific dashboard selected
 */
export default function DashboardHolder(props: DashboardHolderPropTypes) {
  const { eventInformation, assistanceRequests, venueStatus } = props;

  return (
    <section
      className="col-start-2 col-span-4 mt-2"
      style={{
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto auto',
        gridTemplateColumns: '100%',
      }}
    >
      <DashboardSelectorTabs />
      <PositionsDashboard
        positions={eventInformation.venue.positions}
        assignedStaff={eventInformation.staff}
        assistanceRequests={assistanceRequests}
      />
      <VenueStatusChanger
        eventId={eventInformation.eventId}
        status={venueStatus}
        onVenueStatusChange={props.onVenueStatusChange}
      />
      <StatusFooter status={venueStatus} />
    </section>
  );
}
