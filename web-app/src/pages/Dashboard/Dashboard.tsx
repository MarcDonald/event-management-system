import React, { useEffect, useReducer, useState } from 'react';
import { useParams } from 'react-router-dom';
import StatusHeader from './components/StatusHeader';
import EventDetailsDrawer from './components/EventDetailsDrawer';
import AssistanceRequestsDrawer from './components/AssistanceRequestDrawer';
import DashboardHolder from './DashboardHolder';
import usePageProtection from '../../shared/hooks/usePageProtection';
import StaffRole from '../../shared/models/StaffRole';
import Sockette from 'sockette';
import DashboardStateAction from './state/DashboardStateActions';
import DashboardStateReducer, {
  initialDashboardState,
} from './state/DashboardStateReducer';
import { toast, Toaster } from 'react-hot-toast';
import { toastErrorStyle } from '../../styles/ToastStyles';
import {
  LoadingContainer,
  Container,
  ContentContainer,
} from './DashboardStyles';
import Loading from '../../shared/components/Loading';
import useEventApi from '../../shared/hooks/api/useEventApi';
import { CancelToken } from 'axios';

/**
 * Main dashboards page
 */
export default function Dashboard() {
  const eventApi = useEventApi();
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

  const loadInfoAndConnectToWebSocket = async (cancelToken: CancelToken) => {
    dispatch({ type: DashboardStateAction.LoadInfo });

    if (assistanceRequestSocket) {
      assistanceRequestSocket.close();
    }
    if (venueStatusSocket) {
      venueStatusSocket.close();
    }

    const dbEventInformation = eventApi.getEventInformation(
      eventId,
      cancelToken
    );
    const dbAssistanceRequests = eventApi.getAssistanceRequests(
      eventId,
      cancelToken
    );
    const dbVenueStatus = eventApi.getEventVenueStatus(eventId, cancelToken);

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
      })
      .catch((err) => {
        if (err.message === 'Component unmounted') return;
        else console.error(err);
      });
  };

  const openAssistanceRequestWebsocketConnection = async () => {
    const socket = await eventApi.connectToAssistanceRequestWebSocket(
      eventId,
      (e) => {
        const event = JSON.parse(e.data);
        if (event.type === 'NewAssistanceRequest') {
          dispatch({
            type: DashboardStateAction.NewAssistanceRequest,
            parameters: {
              newAssistanceRequest: event.assistanceRequest,
            },
          });
        }
        if (event.type === 'AssistanceRequestHandled') {
          dispatch({
            type: DashboardStateAction.HandleAssistanceRequest,
            parameters: {
              id: event.assistanceRequestId,
            },
          });
        }
      }
    );
    setAssistanceRequestSocket(socket);
  };

  const openVenueStatusWebsocketConnection = async () => {
    const socket = await eventApi.connectToVenueStatusWebSocket(eventId, (e) =>
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
    const cancelTokenSource = eventApi.getCancelTokenSource();
    pageProtection
      .protectPage(StaffRole.ControlRoomOperator, StaffRole.Administrator)
      .then(
        async () => await loadInfoAndConnectToWebSocket(cancelTokenSource.token)
      );
    return () => {
      try {
        cancelTokenSource.cancel('Component unmounted');
      } catch (err) {
        console.error(`ERROR ${JSON.stringify(err, null, 2)}`);
      }
      venueStatusSocket?.close(1001);
      assistanceRequestSocket?.close(1001);
    };
  }, [eventId]);

  const onHandleAssistanceRequest = async (assistanceRequestId: string) => {
    await toast.promise(
      eventApi.handleAssistanceRequest(eventId, assistanceRequestId),
      {
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
      }
    );
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
        <LoadingContainer>
          <Loading />
        </LoadingContainer>
      )}
      {!isLoading && (
        <Container>
          <StatusHeader status={venueStatus} />
          <ContentContainer>
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
                  onHandleAssistanceRequest={onHandleAssistanceRequest}
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
                  isLoading={isLoading}
                  assistanceRequests={assistanceRequests}
                  onHandleAssistanceRequest={onHandleAssistanceRequest}
                />
              </>
            )}
          </ContentContainer>
        </Container>
      )}
    </>
  );
}
