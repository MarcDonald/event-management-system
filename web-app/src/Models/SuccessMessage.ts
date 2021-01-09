export default class SuccessMessage {
  message: string;
  private id: number;

  constructor(message: string) {
    this.message = message;
    // This is so that if the same success message needs to be displayed twice it'll work
    // If there was no random ID then useEffect would not detect a change and would not display the second message
    this.id = Math.random();
  }
}
