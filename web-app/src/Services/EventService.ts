import config from '../config.json';
import { sleep } from './ApiService';
import Event from '../Models/Event';
import UserRole from '../Models/UserRole';
import VenueMetadata from '../Models/VenueMetadata';
import AssignedStaffMember from '../Models/AssignedStaffMember';
import AssignedSupervisor from '../Models/AssignedSupervisor';

const baseUrl = `${config.API.BASE_URL}/events`;

export async function getAllEvents(): Promise<Array<Event>> {
  // const result = await get(baseUrl);
  // return result.data;
  await sleep(1000);
  return [
    {
      eventId: '123',
      name: 'Event 1',
      venue: {
        venueId: '345',
        name: 'My venue',
      },
      start: 1606340678,
      end: 1606340800,
      supervisors: [
        {
          user: {
            username: 'marc',
            sub: 'feggf',
            role: UserRole.Steward,
            givenName: 'Marc',
            familyName: 'Donald',
          },
          areaOfSupervision: 'Foyer',
        },
      ],
      staff: [
        {
          user: {
            username: 'steve',
            sub: 'fegfgfggf',
            role: UserRole.Steward,
            givenName: 'Steve',
            familyName: 'Steph',
          },
          position: {
            positionId: '8485348',
            name: 'Foyer 2',
          },
        },
      ],
    },
  ];
}

interface NewEventDetails {
  name: string;
  venue: VenueMetadata;
  start: number;
  end: number;
  supervisors: AssignedSupervisor[];
  staff: AssignedStaffMember[];
}

export async function createNewEvent(
  eventToCreate: NewEventDetails
): Promise<Event> {
  // const result = await post(baseUrl, eventToCreate);
  // return result.data;
  await sleep(1000);
  return {
    eventId: new Date().getTime().toString(),
    ...eventToCreate,
  };
}

interface EditableEventMetadata {
  name: string;
  start: number;
  end: number;
}

export async function updateEventMetadata(
  eventId: string,
  metadata: EditableEventMetadata
): Promise<any> {
  // return await put(`${baseUrl}/${eventId}/metadata`, metadata);
  await sleep(1000);
  return;
}

export async function deleteEvent(id: string): Promise<string> {
  // await delet(`${baseUrl}/${id}`);
  // return id;
  await sleep(1000);
  return id;
}
