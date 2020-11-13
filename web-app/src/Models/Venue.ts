import Position from './Position';
import VenueStatus from './VenueStatus';

export default interface Venue {
  id: string;
  name: string;
  status: VenueStatus;
  positions: Position[];
}
