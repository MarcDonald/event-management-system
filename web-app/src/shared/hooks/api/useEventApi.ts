import config from '../../../config.json';
import useApi from './useApi';
import Venue from '../../models/Venue';
import AssignedSupervisor from '../../models/AssignedSupervisor';
import AssignedStaffMember from '../../models/AssignedStaffMember';
import Event from '../../models/Event';
import AssistanceRequest from '../../models/AssistanceRequest';
import VenueStatus from '../../models/VenueStatus';
import Sockette from 'sockette';

interface NewEventDetails {
  name: string;
  venue: Venue;
  start: number;
  end: number;
  supervisors: AssignedSupervisor[];
  staff: AssignedStaffMember[];
}

interface EditableEventInformation {
  name: string;
  start: number;
  end: number;
}

interface UseEventApi {
  getAllEvents: () => Promise<Event[]>;
  createNewEvent: (eventToCreate: NewEventDetails) => Promise<Event>;
  updateEventInformation: (
    eventId: string,
    information: EditableEventInformation
  ) => Promise<EditableEventInformation>;
  updateEventSupervisors: (
    eventId: string,
    supervisors: AssignedSupervisor[]
  ) => Promise<any>;
  updateEventStaffMembers: (
    eventId: string,
    staff: AssignedStaffMember[]
  ) => Promise<any>;
  deleteEvent: (eventId: string) => Promise<string>;
  getUpcomingEvents: (count?: number) => Promise<Event[]>;
  getAssistanceRequests: (eventId: string) => Promise<AssistanceRequest[]>;
  handleAssistanceRequest: (
    eventId: string,
    assistanceRequestId: string
  ) => Promise<void>;
  getEventInformation: (eventId: string) => Promise<Event>;
  getEventVenueStatus: (eventId: string) => Promise<VenueStatus>;
  updateEventStatus: (
    eventId: string,
    venueStatus: VenueStatus
  ) => Promise<VenueStatus>;
  connectToVenueStatusWebSocket: (
    eventId: string,
    onMessage: (e: MessageEvent) => void
  ) => Promise<Sockette>;
  connectToAssistanceRequestWebSocket: (
    eventId: string,
    onMessage: (e: MessageEvent) => void
  ) => Promise<Sockette>;
}

const baseUrl = `${config.API.BASE_URL}/events`;

/**
 * Hook that provides easy access to the event API
 */
export default function useEventApi(): UseEventApi {
  const api = useApi();
  const { get, put, post, del, connectToWebsocket } = api;

  const getAllEvents = async (): Promise<Array<Event>> => {
    const result = await get(baseUrl);
    return result.data;
  };

  const createNewEvent = async (
    eventToCreate: NewEventDetails
  ): Promise<Event> => {
    const result = await post(baseUrl, eventToCreate);
    return result.data;
  };

  const updateEventInformation = async (
    eventId: string,
    information: EditableEventInformation
  ): Promise<EditableEventInformation> => {
    return await put(`${baseUrl}/${eventId}/information`, information);
  };

  const updateEventSupervisors = async (
    eventId: string,
    supervisors: AssignedSupervisor[]
  ): Promise<any> => {
    return await put(`${baseUrl}/${eventId}/supervisors`, supervisors);
  };

  const updateEventStaffMembers = async (
    eventId: string,
    staff: AssignedStaffMember[]
  ): Promise<any> => {
    return await put(`${baseUrl}/${eventId}/staff`, staff);
  };

  const deleteEvent = async (id: string): Promise<string> => {
    await del(`${baseUrl}/${id}`);
    return id;
  };

  const getUpcomingEvents = async (
    count: number = 5
  ): Promise<Array<Event>> => {
    const result = await get(`${baseUrl}/upcoming?count=${count}`);
    return result.data;
  };

  const getAssistanceRequests = async (
    eventId: string
  ): Promise<AssistanceRequest[]> => {
    const result = await get(`${baseUrl}/${eventId}/assistance`);
    return result.data;
  };

  const handleAssistanceRequest = async (
    eventId: string,
    assistanceRequestId: string
  ): Promise<void> => {
    return await put(
      `${baseUrl}/${eventId}/assistance/${assistanceRequestId}/handle`,
      {}
    );
  };

  const getEventInformation = async (eventId: string): Promise<Event> => {
    const result = await get(`${baseUrl}/${eventId}/information`);
    return result.data;
  };

  const getEventVenueStatus = async (eventId: string): Promise<VenueStatus> => {
    const result = await get(`${baseUrl}/${eventId}/status`);
    return result.data.venueStatus;
  };

  const updateEventStatus = async (
    eventId: string,
    venueStatus: VenueStatus
  ): Promise<VenueStatus> => {
    const result = await put(`${baseUrl}/${eventId}/status`, {
      venueStatus: venueStatus.toString(),
    });
    return result.data.venueStatus;
  };

  const connectToVenueStatusWebSocket = async (
    eventId: string,
    onMessage: (e: MessageEvent) => void
  ): Promise<Sockette> => {
    return await connectToWebsocket(
      config.API.VENUE_STATUS_WEBSOCKET,
      eventId,
      'Venue Status Websocket',
      onMessage
    );
  };

  const connectToAssistanceRequestWebSocket = async (
    eventId: string,
    onMessage: (e: MessageEvent) => void
  ): Promise<Sockette> => {
    return await connectToWebsocket(
      config.API.ASSISTANCE_REQUEST_WEBSOCKET,
      eventId,
      'Assistance Request Websocket',
      onMessage
    );
  };

  return {
    getAllEvents,
    createNewEvent,
    updateEventInformation,
    updateEventStaffMembers,
    updateEventStatus,
    updateEventSupervisors,
    deleteEvent,
    connectToAssistanceRequestWebSocket,
    connectToVenueStatusWebSocket,
    getAssistanceRequests,
    getEventInformation,
    getEventVenueStatus,
    getUpcomingEvents,
    handleAssistanceRequest,
  };
}
