import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Event from '../../Models/Event';
import StaffRole from '../../Models/StaffRole';
import AssistanceRequest from '../../Models/AssistanceRequest';
import VenueStatus from '../../Models/VenueStatus';
import StatusHeader from './StatusHeader';
import { sleep } from '../../Services/ApiService';
import DashDetailsDrawer from './DashDetailsDrawer';
import PositionsDashboard from './PositionsDashboard';
import AssistanceRequestsDrawer from './AssistanceRequestsDrawer';

interface DashboardPropTypes {}

export default function Dashboard(props: DashboardPropTypes) {
  const { eventId } = useParams();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeEvent, setActiveEvent] = useState<Event>();
  const [assistanceRequests, setAssistanceRequests] = useState<
    AssistanceRequest[]
  >([]);
  const [venueStatus, setVenueStatus] = useState<VenueStatus>(VenueStatus.Low);

  useEffect(() => {
    const setup = async () => {
      setIsLoading(false);
      setActiveEvent({
        eventId,
        name: 'My Cool Event',
        start: new Date().getTime() / 1000,
        end: new Date().getTime() / 1000 + 40000,
        venue: {
          venueId: 'jsdfjsdfjdfs',
          name: 'The Big Arena',
          positions: [
            {
              positionId: 'jsdfkjfgjfsd',
              name: 'Door 1',
            },
            {
              positionId: 'jgdghfsdfkjfgjfsd',
              name: 'Door 2',
            },
          ],
        },
        staff: [
          {
            staffMember: {
              username: 'abc123',
              sub: 'fgjfds',
              givenName: 'Marc',
              familyName: 'Donald',
              role: StaffRole.Steward,
            },
            position: {
              positionId: 'jgdghfsdfkjfgjfsd',
              name: 'Door 2',
            },
          },
        ],
        supervisors: [
          {
            staffMember: {
              username: 'def456',
              sub: 'fgfgfgddfg',
              givenName: 'Darc',
              familyName: 'Monald',
              role: StaffRole.Steward,
            },
            areaOfSupervision: 'Tickets',
          },
          {
            staffMember: {
              username: 'hghgfhfggsdfsdfg',
              sub: 'fgfgfsdfgfgsdgddfg',
              givenName: 'Dorc',
              familyName: 'Mernald',
              role: StaffRole.Steward,
            },
            areaOfSupervision: 'Backstage',
          },
        ],
      });

      setAssistanceRequests([
        {
          position: {
            positionId: 'jgdghfsdfkjfgjfsd',
            name: 'Door 2',
          },
          time: new Date().getTime() / 1000,
          message: 'Request for Supervisor',
        },
        {
          position: {
            positionId: 'jgdghfsdfkjfgjfsd',
            name: 'Door 2',
          },
          time: new Date().getTime() / 1000,
          message: 'Request for Security',
        },
      ]);

      setVenueStatus(VenueStatus.Low);
      setIsLoading(false);
    };
    setup().then();
  }, [eventId]);

  const refresh = async () => {
    setIsLoading(true);
    await sleep(1000);
    setIsLoading(false);
    return;
  };

  return (
    <div
      className="min-h-screen bg-background-gray"
      style={{
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        gridTemplateColumns: '100%',
      }}
    >
      <div className="row-start-1 h-auto">
        <StatusHeader status={venueStatus} />
      </div>
      <div className="row-start-2 grid grid-cols-6">
        {activeEvent && (
          <>
            <DashDetailsDrawer
              venueName={activeEvent.venue.name}
              eventName={activeEvent.name}
              supervisors={activeEvent.supervisors}
            />
            <PositionsDashboard
              positions={activeEvent.venue.positions}
              assignedStaff={activeEvent.staff}
              assistanceRequests={assistanceRequests}
            />
            <AssistanceRequestsDrawer
              refresh={refresh}
              isLoading={isLoading}
              assistanceRequests={assistanceRequests}
            />
          </>
        )}
      </div>
    </div>
  );
}
