import config from '../config.json';
import { delet, get, post, put, sleep } from './ApiService';
import Event from '../Models/Event';
import AssignedStaffMember from '../Models/AssignedStaffMember';
import AssignedSupervisor from '../Models/AssignedSupervisor';
import Venue from '../Models/Venue';

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
): Promise<AssignedSupervisor[]> {
  // return await put(`${baseUrl}/${eventId}/supervisors`, supervisors);
  await sleep(1000);
  return supervisors;
}

export async function updateEventStaffMembers(
  eventId: string,
  staff: AssignedStaffMember[]
): Promise<AssignedStaffMember[]> {
  // return await put(`${baseUrl}/${eventId}/staff`, staff);
  await sleep(1000);
  return staff;
}

export async function deleteEvent(id: string): Promise<string> {
  await delet(`${baseUrl}/${id}`);
  return id;
}
