import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import Event from '../../Models/Event';
import StaffRole from '../../Models/StaffRole';
import AssistanceRequest from '../../Models/AssistanceRequest';
import VenueStatus from '../../Models/VenueStatus';
import StatusHeader from './StatusHeader';
import { sleep } from '../../Services/ApiService';
import DashDetailsDrawer from './DashDetailsDrawer';
import PositionsDashboard from './PositionsDashboard';
import AssistanceRequestsDrawer from './AssistanceRequestsDrawer';
import {
  getAssistanceRequests,
  getEventInformation,
} from '../../Services/EventService';
import useLocalAuth from '../../Hooks/useLocalAuth';
import Loading from '../../Components/Loading';

interface DashboardPropTypes {}

export default function Dashboard(props: DashboardPropTypes) {
  const { eventId } = useParams();
  const localAuth = useLocalAuth();
  const history = useHistory();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [eventInformation, setEventInformation] = useState<Event>();
  const [assistanceRequests, setAssistanceRequests] = useState<
    AssistanceRequest[]
  >([]);
  const [venueStatus, setVenueStatus] = useState<VenueStatus>(VenueStatus.Low);

  const refresh = async () => {
    setIsLoading(true);
    const dbEventInformation = await getEventInformation(eventId);
    setEventInformation(dbEventInformation);

    const dbAssistanceRequests = await getAssistanceRequests(eventId);
    setAssistanceRequests(dbAssistanceRequests);

    setVenueStatus(VenueStatus.Low);
    setIsLoading(false);
  };

  useEffect(() => {
    const authorizeUser = async () => {
      const user = await localAuth.getLoggedInUser();
      if (
        !user ||
        !(localAuth.isControlRoomOperator(user) || localAuth.isAdmin(user))
      ) {
        history.replace('/404');
      }
    };

    authorizeUser().then(() => refresh().then());
  }, [eventId]);

  return (
    <>
      {isLoading && (
        <Loading containerClassName="mt-16" spinnerClassName="text-4xl" />
      )}
      {!isLoading && (
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
            {eventInformation && (
              <>
                <DashDetailsDrawer
                  venueName={eventInformation.venue.name}
                  eventName={eventInformation.name}
                  supervisors={eventInformation.supervisors}
                />
                <PositionsDashboard
                  positions={eventInformation.venue.positions}
                  assignedStaff={eventInformation.staff}
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
      )}
    </>
  );
}
