import Position from './Position';

export default interface Venue {
  venueId: string;
  name: string;
  positions: Position[];
}
