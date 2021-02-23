import StateAction from '../../../Utils/StateAction';
import Event from '../../../Models/Event';
import AssistanceRequest from '../../../Models/AssistanceRequest';
import VenueStatus from '../../../Models/VenueStatus';
import DashboardStateAction from './DashboardStateActions';

interface DashboardState {
  isLoading: boolean;
  eventInformation: Event | null;
  assistanceRequests: AssistanceRequest[];
  venueStatus: VenueStatus;
}

export const initialDashboardState: DashboardState = {
  isLoading: false,
  eventInformation: null,
  assistanceRequests: [],
  venueStatus: VenueStatus.Low,
};

export default function DashboardStateReducer(
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
    case DashboardStateAction.InitialDataLoaded: {
      return {
        ...state,
        isLoading: false,
        eventInformation: parameters?.eventInformation,
        assistanceRequests: parameters?.assistanceRequests.reverse(),
        venueStatus: parameters?.venueStatus,
      };
    }
    case DashboardStateAction.VenueStatusChange: {
      if (parameters?.venueStatus !== state.venueStatus) {
        return {
          ...state,
          venueStatus: parameters?.venueStatus,
        };
      }
      return state;
    }
    case DashboardStateAction.NewAssistanceRequest: {
      if (parameters?.newAssistanceRequest) {
        const newRequest = parameters.newAssistanceRequest as AssistanceRequest;
        return {
          ...state,
          assistanceRequests: [
            ...state.assistanceRequests,
            {
              assistanceRequestId: newRequest.assistanceRequestId,
              message: newRequest.message,
              position: {
                name: newRequest.position.name,
                positionId: newRequest.position.positionId,
              },
              time: newRequest.time,
              handled: newRequest.handled,
            },
          ].reverse(),
        };
      }
      console.error(
        'Dispatched NewAssistanceRequest action but no newAssistanceRequest was provided in parameters'
      );
      return state;
    }
    case DashboardStateAction.HandleAssistanceRequest: {
      if (parameters?.id) {
        return {
          ...state,
          assistanceRequests: [
            ...state.assistanceRequests.filter(
              (request) => request.assistanceRequestId !== parameters.id
            ),
          ],
        };
      }
      return state;
    }
    default:
      break;
  }
  return state;
}
