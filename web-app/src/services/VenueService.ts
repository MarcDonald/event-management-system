import config from '../config.json';
import Venue from '../shared/models/Venue';
import { delet, get, post, put } from './ApiService';
import Position from '../shared/models/Position';

const baseUrl = `${config.API.BASE_URL}/venues`;

export async function getAllVenues(): Promise<Array<Venue>> {
  const result = await get(baseUrl);
  return result.data;
}

interface NewVenueDetails {
  name: string;
  positions: Position[];
}

export async function createNewVenue(
  venueToCreate: NewVenueDetails
): Promise<Venue> {
  const result = await post(baseUrl, venueToCreate);
  return result.data;
}

interface EditableVenueInformation {
  name: string;
}

export async function updateVenueInformation(
  venueId: string,
  information: EditableVenueInformation
): Promise<any> {
  return await put(`${baseUrl}/${venueId}/information`, information);
}

export interface NewPosition {
  name: string;
}

export async function addVenuePositions(
  venueId: string,
  positions: Array<NewPosition>
): Promise<any> {
  return await post(`${baseUrl}/${venueId}/positions`, positions);
}

export async function updateVenuePositions(
  venueId: string,
  positions: Array<Position>
): Promise<any> {
  return await put(`${baseUrl}/${venueId}/positions`, positions);
}

export async function deleteVenuePositions(
  venueId: string,
  positionIds: Array<string>
): Promise<any> {
  return await delet(`${baseUrl}/${venueId}/positions`, positionIds);
}

export async function deleteVenue(id: string): Promise<string> {
  await delet(`${baseUrl}/${id}`);
  return id;
}
