import config from '../config.json';
import Venue from '../Models/Venue';
import { delet, get, post, put } from './ApiService';
import Position from '../Models/Position';

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

interface EditableVenueMetadata {
  name: string;
}

export async function updateVenueMetadata(
  venueId: string,
  metadata: EditableVenueMetadata
): Promise<Venue> {
  return await put(`${baseUrl}/${venueId}/metadata`, metadata);
}

export interface NewPosition {
  name: string;
}

export async function addVenuePositions(
  venueId: string,
  positions: Array<NewPosition>
): Promise<Venue> {
  return await post(`${baseUrl}/${venueId}/positions`, positions);
}

export async function updateVenuePositions(
  venueId: string,
  positions: Array<Position>
): Promise<Venue> {
  return await put(`${baseUrl}/${venueId}/positions`, positions);
}

export async function deleteVenuePositions(
  venueId: string,
  positionIds: Array<string>
): Promise<Venue> {
  return await delet(`${baseUrl}/${venueId}/positions`, positionIds);
}

export async function deleteVenue(id: string): Promise<string> {
  await delet(`${baseUrl}/${id}`);
  return id;
}
