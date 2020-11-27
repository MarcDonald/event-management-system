import Position from './Position';

export default interface AssistanceRequest {
  position: Position;
  message: string;
  time: number;
}
