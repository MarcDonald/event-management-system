import React, { useEffect, useReducer } from 'react';
import { useParams } from 'react-router-dom';
import Event from '../../Models/Event';
import AssistanceRequest from '../../Models/AssistanceRequest';
import VenueStatus from '../../Models/VenueStatus';
import StatusHeader from './StatusHeader';
import EventDetailsDrawer from './EventDetailsDrawer';
import AssistanceRequestsDrawer from './AssistanceRequestDrawer';
import {
  getAssistanceRequests,
  getEventInformation,
  getEventVenueStatus,
} from '../../Services/EventService';
import Loading from '../../Components/Loading';
import DashboardHolder from './DashboardHolder';
import usePageProtection from '../../Hooks/usePageProtection';
import StaffRole from '../../Models/StaffRole';
import StateAction from '../../Utils/StateAction';

interface DashboardState {
  isLoading: boolean;
  eventInformation: Event | null;
  assistanceRequests: AssistanceRequest[];
  venueStatus: VenueStatus;
}

const initialState: DashboardState = {
  isLoading: false,
  eventInformation: null,
  assistanceRequests: [],
  venueStatus: VenueStatus.Low,
};

enum DashboardStateAction {
  Refresh,
  DataLoaded,
  VenueStatusChange,
}

function stateReducer(
  state: DashboardState,
  action: StateAction<DashboardStateAction>
): DashboardState {
  const { type, parameters } = action;
  switch (type) {
    case DashboardStateAction.Refresh: {
      return {
        ...state,
        isLoading: true,
      };
    }
    case DashboardStateAction.DataLoaded: {
      return {
        ...state,
        isLoading: false,
        eventInformation: parameters?.eventInformation,
        assistanceRequests: parameters?.assistanceRequests,
        venueStatus: parameters?.venueStatus,
      };
    }
    case DashboardStateAction.VenueStatusChange: {
      return {
        ...state,
        venueStatus: parameters?.venueStatus,
      };
    }
    default:
      break;
  }
  return state;
}

/**
 * Main dashboards page
 */
export default function Dashboard() {
  const { eventId } = useParams();
  const pageProtection = usePageProtection();

  const [state, dispatch] = useReducer(stateReducer, initialState);
  const {
    isLoading,
    eventInformation,
    assistanceRequests,
    venueStatus,
  } = state;

  const refresh = async () => {
    dispatch({ type: DashboardStateAction.Refresh });

    const dbEventInformation = getEventInformation(eventId);
    const dbAssistanceRequests = getAssistanceRequests(eventId);
    const dbVenueStatus = getEventVenueStatus(eventId);

    Promise.all([dbEventInformation, dbAssistanceRequests, dbVenueStatus]).then(
      (values) => {
        dispatch({
          type: DashboardStateAction.DataLoaded,
          parameters: {
            eventInformation: values[0],
            assistanceRequests: values[1],
            venueStatus: values[2],
          },
        });
      }
    );
  };

  useEffect(() => {
    pageProtection
      .protectPage(StaffRole.ControlRoomOperator, StaffRole.Administrator)
      .then(() => refresh().then());
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
                />
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
