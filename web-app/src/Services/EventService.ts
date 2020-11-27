import config from '../config.json';
import { delet, get, post, sleep } from './ApiService';
import Event from '../Models/Event';
import AssignedStaffMember from '../Models/AssignedStaffMember';
import AssignedSupervisor from '../Models/AssignedSupervisor';
import Venue from '../Models/Venue';

const baseUrl = `${config.API.BASE_URL}/events`;

export async function getAllEvents(): Promise<Array<Event>> {
  const result = await get(baseUrl);
  return result.data;
  // await sleep(1000);
  // return [
  //   {
  //     eventId: '123',
  //     name: 'Event 1',
  //     venue: {
  //       positions: [
  //         {
  //           positionId: '39d49a55-f5f7-4ba7-b070-1616f3f61db0',
  //           name: 'Foyer 1',
  //         },
  //         {
  //           positionId: '42004728-bccf-4614-bd52-cc0fde83df15',
  //           name: 'Backstage 1',
  //         },
  //       ],
  //       name: 'A cool venue',
  //       venueId: '8fb98b42-ec05-4aef-ab9c-3ac5bfd6cd95',
  //     },
  //     start: 1606340678,
  //     end: 1606340800,
  //     supervisors: [
  //       {
  //         staffMember: {
  //           username: 'marc',
  //           sub: 'feggf',
  //           role: StaffRole.Steward,
  //           givenName: 'Marc',
  //           familyName: 'Donald',
  //         },
  //         areaOfSupervision: 'Foyer',
  //       },
  //     ],
  //     staff: [
  //       {
  //         staffMember: {
  //           username: 'steve',
  //           sub: 'fegfgfggf',
  //           role: StaffRole.Steward,
  //           givenName: 'Steve',
  //           familyName: 'Steph',
  //         },
  //         position: {
  //           positionId: '8485348',
  //           name: 'Foyer 2',
  //         },
  //       },
  //     ],
  //   },
  // ];
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

interface EditableEventMetadata {
  name: string;
  start: number;
  end: number;
}

export async function updateEventMetadata(
  eventId: string,
  metadata: EditableEventMetadata
): Promise<EditableEventMetadata> {
  // return await put(`${baseUrl}/${eventId}/metadata`, metadata);
  await sleep(1000);
  return metadata;
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
  // await sleep(1000);
  // return id;
}
