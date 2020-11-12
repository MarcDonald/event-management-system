import config from '../config.json';
import Venue from '../Models/Venue';
import { sleep } from './ApiService';
import Position from '../Models/Position';

const baseUrl = `${config.API.BASE_URL}/venues`;

export async function getAllVenues(): Promise<Array<Venue>> {
  // const result = await get(baseUrl);
  // return result.data;
  await sleep(1000);
  return [
    {
      id: 'abc1',
      name: 'Air Arena',
      positions: [
        {
          id: 'D1',
          name: 'Door 1',
        },
        {
          id: 'D2',
          name: 'Door 2',
        },
      ],
    },
    {
      id: 'abc2',
      name: 'Sea Stadium',
      positions: [
        {
          id: 'T1',
          name: 'Tickets 1',
        },
        {
          id: 'C1',
          name: 'Concourse 1',
        },
      ],
    },
  ];
}

interface NewVenueDetails {
  name: string;
  positions: Position[];
}

export async function createNewVenue(
  venueToCreate: NewVenueDetails
): Promise<Venue> {
  // const result = await post(baseUrl, {});
  // return result.data;
  await sleep(1000);
  return {
    ...venueToCreate,
    id: 'ghj123',
  };
}

export async function updateExistingVenue(venueToEdit: Venue): Promise<Venue> {
  // await put(`${baseUrl}/${venueToEdit.id}`, {});
  // return venueToEdit;
  await sleep(1000);
  return venueToEdit;
}

export async function deleteVenue(id: string): Promise<string> {
  // await delet(`${baseUrl}/${id}`);
  // return id;
  await sleep(1000);
  return id;
}
