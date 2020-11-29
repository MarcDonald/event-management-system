import config from '../config.json';
import { delet, get, post, put, sleep } from './ApiService';
import Event from '../Models/Event';
import AssignedStaffMember from '../Models/AssignedStaffMember';
import AssignedSupervisor from '../Models/AssignedSupervisor';
import Venue from '../Models/Venue';
import AssistanceRequest from '../Models/AssistanceRequest';
import VenueStatus from '../Models/VenueStatus';

const baseUrl = `${config.API.BASE_URL}/events`;

export async function getAllEvents(): Promise<Array<Event>> {
  const result = await get(baseUrl);
  return result.data;
}

interface NewEventDetails {
  name: string;
  venue: Venue;
  start: number;
  end: number;
  supervisors: AssignedSupervisor[];
  staff: AssignedStaffMember[];
}

export async function createNewEvent(
  eventToCreate: NewEventDetails
): Promise<Event> {
  const result = await post(baseUrl, eventToCreate);
  return result.data;
}

interface EditableEventInformation {
  name: string;
  start: number;
  end: number;
}

export async function updateEventInformation(
  eventId: string,
  information: EditableEventInformation
): Promise<EditableEventInformation> {
  return await put(`${baseUrl}/${eventId}/information`, information);
}

export async function updateEventSupervisors(
  eventId: string,
  supervisors: AssignedSupervisor[]
): Promise<any> {
  return await put(`${baseUrl}/${eventId}/supervisors`, supervisors);
}

export async function updateEventStaffMembers(
  eventId: string,
  staff: AssignedStaffMember[]
): Promise<any> {
  return await put(`${baseUrl}/${eventId}/staff`, staff);
}

export async function deleteEvent(id: string): Promise<string> {
  await delet(`${baseUrl}/${id}`);
  return id;
}

export async function getUpcomingEvents(
  count: number = 5
): Promise<Array<Event>> {
  const result = await get(`${baseUrl}/upcoming?count=${count}`);
  return result.data;
}

export async function getAssistanceRequests(
  eventId: string
): Promise<AssistanceRequest[]> {
  const result = await get(`${baseUrl}/${eventId}/assistance`);
  return result.data;
}

export async function getEventInformation(eventId: string): Promise<Event> {
  const result = await get(`${baseUrl}/${eventId}/information`);
  return result.data;
}

export async function getEventVenueStatus(
  eventId: string
): Promise<VenueStatus> {
  const result = await get(`${baseUrl}/${eventId}/status`);
  return result.data.venueStatus;
}

export async function updateEventStatus(
  eventId: string,
  venueStatus: VenueStatus
): Promise<VenueStatus> {
  const result = await put(`${baseUrl}/${eventId}/status`, {
    venueStatus: venueStatus.toString(),
  });
  return result.data.venueStatus;
}
