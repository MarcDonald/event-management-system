import Position from './Position';

export default interface Venue {
  id: string;
  name: string;
  positions: Position[];
}
