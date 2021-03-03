import Position from './Position';

export default interface AssistanceRequest {
  assistanceRequestId: string;
  position: Position;
  message: string;
  time: number;
  handled: boolean;
}
