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
      venueId: 'abc1',
      name: 'Air Arena',
      positions: [
        {
          positionId: 'D1',
          name: 'Door 1',
        },
        {
          positionId: 'D2',
          name: 'Door 2',
        },
      ],
    },
    {
      venueId: 'abc2',
      name: 'Sea Stadium',
      positions: [
        {
          positionId: 'T1',
          name: 'Tickets 1',
        },
        {
          positionId: 'C1',
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
    venueId: 'ghj123',
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
