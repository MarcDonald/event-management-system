import config from '../config.json';
import { delet, get, post, put, sleep } from './ApiService';
import Event from '../Models/Event';
import AssignedStaffMember from '../Models/AssignedStaffMember';
import AssignedSupervisor from '../Models/AssignedSupervisor';
import Venue from '../Models/Venue';
import AssistanceRequest from '../Models/AssistanceRequest';
import StaffRole from '../Models/StaffRole';

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
  // await sleep(1000);
  // return [
  //   {
  //     assistanceRequestId: 'jasdjadjnjasdnasd',
  //     position: {
  //       positionId: 'jgdghfsdfkjfgjfsd',
  //       name: 'Door 2',
  //     },
  //     time: new Date().getTime() / 1000,
  //     message: 'Request for Supervisor',
  //   },
  //   {
  //     assistanceRequestId: 'jasdjadjnjasdnasdasd',
  //     position: {
  //       positionId: 'jgdghfsdfkjfgjfsd',
  //       name: 'Door 2',
  //     },
  //     time: new Date().getTime() / 1000,
  //     message: 'Request for Security',
  //   },
  // ];
}

export async function getEventInformation(eventId: string): Promise<Event> {
  const result = await get(`${baseUrl}/${eventId}/information`);
  return result.data;
  // return {
  //   eventId,
  //   name: 'My Cool Event',
  //   start: new Date().getTime() / 1000,
  //   end: new Date().getTime() / 1000 + 40000,
  //   venue: {
  //     venueId: 'jsdfjsdfjdfs',
  //     name: 'The Big Arena',
  //     positions: [
  //       {
  //         positionId: 'jsdfkjfgjfsd',
  //         name: 'Door 1',
  //       },
  //       {
  //         positionId: 'jgdghfsdfkjfgjfsd',
  //         name: 'Door 2',
  //       },
  //     ],
  //   },
  //   staff: [
  //     {
  //       staffMember: {
  //         username: 'abc123',
  //         sub: 'fgjfds',
  //         givenName: 'Marc',
  //         familyName: 'Donald',
  //         role: StaffRole.Steward,
  //       },
  //       position: {
  //         positionId: 'jgdghfsdfkjfgjfsd',
  //         name: 'Door 2',
  //       },
  //     },
  //   ],
  //   supervisors: [
  //     {
  //       staffMember: {
  //         username: 'def456',
  //         sub: 'fgfgfgddfg',
  //         givenName: 'Darc',
  //         familyName: 'Monald',
  //         role: StaffRole.Steward,
  //       },
  //       areaOfSupervision: 'Tickets',
  //     },
  //     {
  //       staffMember: {
  //         username: 'hghgfhfggsdfsdfg',
  //         sub: 'fgfgfsdfgfgsdgddfg',
  //         givenName: 'Dorc',
  //         familyName: 'Mernald',
  //         role: StaffRole.Steward,
  //       },
  //       areaOfSupervision: 'Backstage',
  //     },
  //   ],
  // };
}
