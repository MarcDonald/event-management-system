import User from './User';
import Position from './Position';

export default interface AssignedSupervisor {
  user: User;
  areaOfSupervision: string;
}
