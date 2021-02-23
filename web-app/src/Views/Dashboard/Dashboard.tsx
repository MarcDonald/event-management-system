import React, { useEffect, useReducer, useState } from 'react';
import { useParams } from 'react-router-dom';
import StatusHeader from './StatusHeader';
import EventDetailsDrawer from './EventDetailsDrawer';
import AssistanceRequestsDrawer from './AssistanceRequestDrawer';
import {
  connectToAssistanceRequestWebsocket,
  connectToVenueStatusWebsocket,
  getAssistanceRequests,
  getEventInformation,
  getEventVenueStatus,
  handleAssistanceRequest,
} from '../../Services/EventService';
import Loading from '../../Components/Loading';
import DashboardHolder from './DashboardHolder';
import usePageProtection from '../../Hooks/usePageProtection';
import StaffRole from '../../Models/StaffRole';
import Sockette from 'sockette';
import DashboardStateAction from './State/DashboardStateActions';
import DashboardStateReducer, {
  initialDashboardState,
} from './State/DashboardStateReducer';
import { toast, Toaster } from 'react-hot-toast';
import { toastErrorStyle } from '../../Utils/ToastStyles';
import { createNewStaffMember } from '../../Services/StaffService';

/**
 * Main dashboards page
 */
export default function Dashboard() {
  const { eventId } = useParams();
  const pageProtection = usePageProtection();

  const [state, dispatch] = useReducer(
    DashboardStateReducer,
    initialDashboardState
  );
  const {
    isLoading,
    eventInformation,
    assistanceRequests,
    venueStatus,
  } = state;

  const [
    assistanceRequestSocket,
    setAssistanceRequestSocket,
  ] = useState<Sockette | null>(null);
  const [venueStatusSocket, setVenueStatusSocket] = useState<Sockette | null>(
    null
  );

  const refresh = async () => {
    dispatch({ type: DashboardStateAction.Refresh });

    if (assistanceRequestSocket) {
      assistanceRequestSocket.close();
    }
    if (venueStatusSocket) {
      venueStatusSocket.close();
    }

    const dbEventInformation = getEventInformation(eventId);
    const dbAssistanceRequests = getAssistanceRequests(eventId);
    const dbVenueStatus = getEventVenueStatus(eventId);

    Promise.all([dbEventInformation, dbAssistanceRequests, dbVenueStatus])
      .then((values) => {
        dispatch({
          type: DashboardStateAction.InitialDataLoaded,
          parameters: {
            eventInformation: values[0],
            assistanceRequests: values[1],
            venueStatus: values[2],
          },
        });
      })
      .then(async () => {
        await openAssistanceRequestWebsocketConnection();
      })
      .then(async () => {
        await openVenueStatusWebsocketConnection();
      });
  };

  const openAssistanceRequestWebsocketConnection = async () => {
    const socket = await connectToAssistanceRequestWebsocket(eventId, (e) => {
      dispatch({
        type: DashboardStateAction.NewAssistanceRequest,
        parameters: {
          newAssistanceRequest: JSON.parse(e.data),
        },
      });
    });
    setAssistanceRequestSocket(socket);
  };

  const openVenueStatusWebsocketConnection = async () => {
    const socket = await connectToVenueStatusWebsocket(eventId, (e) =>
      dispatch({
        type: DashboardStateAction.VenueStatusChange,
        parameters: {
          venueStatus: JSON.parse(e.data).venueStatus,
        },
      })
    );
    setVenueStatusSocket(socket);
  };

  useEffect(() => {
    pageProtection
      .protectPage(StaffRole.ControlRoomOperator, StaffRole.Administrator)
      .then(async () => await refresh());
    return () => {
      venueStatusSocket?.close(1001);
      assistanceRequestSocket?.close(1001);
    };
  }, [eventId]);

  const onHandleAssistanceRequest = async (assistanceRequestId: string) => {
    await toast.promise(handleAssistanceRequest(eventId, assistanceRequestId), {
      error: (e) => {
        console.log(e);
        return 'Error Handling Request';
      },
      loading: 'Handling Request',
      success: () => {
        dispatch({
          type: DashboardStateAction.HandleAssistanceRequest,
          parameters: { id: assistanceRequestId },
        });
        return 'Request Handled';
      },
    });
  };

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          error: toastErrorStyle,
          duration: 1500,
        }}
      />
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
                <EventDetailsDrawer
                  venueName={eventInformation.venue.name}
                  eventName={eventInformation.name}
                  supervisors={eventInformation.supervisors}
                />
                <DashboardHolder
                  eventInformation={eventInformation}
                  assistanceRequests={assistanceRequests}
                  venueStatus={venueStatus}
                  onVenueStatusChange={(newStatus) => {
                    dispatch({
                      type: DashboardStateAction.VenueStatusChange,
                      parameters: {
                        venueStatus: newStatus,
                      },
                    });
                  }}
                />
                <AssistanceRequestsDrawer
                  refresh={refresh}
                  isLoading={isLoading}
                  assistanceRequests={assistanceRequests}
                  onHandleAssistanceRequest={onHandleAssistanceRequest}
                />
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
