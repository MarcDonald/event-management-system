import config from '../../../config.json';

import useApi from './useApi';
import Venue from '../../models/Venue';
import Position from '../../models/Position';

interface NewVenueDetails {
  name: string;
  positions: Position[];
}

interface EditableVenueInformation {
  name: string;
}

export interface NewPosition {
  name: string;
}

interface UseVenueApi {
  getAllVenues: () => Promise<Array<Venue>>;
  createNewVenue: (venueToCreate: NewVenueDetails) => Promise<Venue>;
  updateVenueInformation: (
    venueId: string,
    information: EditableVenueInformation
  ) => Promise<any>;
  addVenuePositions: (
    venueId: string,
    positions: Array<NewPosition>
  ) => Promise<any>;
  updateVenuePositions: (
    venueId: string,
    positions: Array<Position>
  ) => Promise<any>;
  deleteVenuePositions: (
    venueId: string,
    positionIds: Array<string>
  ) => Promise<any>;
  deleteVenue: (venueId: string) => Promise<string>;
}

const baseUrl = `${config.API.BASE_URL}/venues`;

/**
 * Hook that provides easy access to the venue API
 */
export default function useVenueApi(): UseVenueApi {
  const api = useApi();
  const { get, put, post, del } = api;

  const getAllVenues = async (): Promise<Array<Venue>> => {
    const result = await get(baseUrl);
    return result.data;
  };

  const createNewVenue = async (
    venueToCreate: NewVenueDetails
  ): Promise<Venue> => {
    const result = await post(baseUrl, venueToCreate);
    return result.data;
  };

  const updateVenueInformation = async (
    venueId: string,
    information: EditableVenueInformation
  ): Promise<any> => {
    return await put(`${baseUrl}/${venueId}/information`, information);
  };

  const addVenuePositions = async (
    venueId: string,
    positions: Array<NewPosition>
  ): Promise<any> => {
    return await post(`${baseUrl}/${venueId}/positions`, positions);
  };

  const updateVenuePositions = async (
    venueId: string,
    positions: Array<Position>
  ): Promise<any> => {
    return await put(`${baseUrl}/${venueId}/positions`, positions);
  };

  const deleteVenuePositions = async (
    venueId: string,
    positionIds: Array<string>
  ): Promise<any> => {
    return await del(`${baseUrl}/${venueId}/positions`, positionIds);
  };

  const deleteVenue = async (id: string): Promise<string> => {
    await del(`${baseUrl}/${id}`);
    return id;
  };

  return {
    getAllVenues,
    createNewVenue,
    updateVenueInformation,
    addVenuePositions,
    updateVenuePositions,
    deleteVenue,
    deleteVenuePositions,
  };
}
