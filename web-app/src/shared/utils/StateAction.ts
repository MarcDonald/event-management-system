export default interface StateAction<T> {
  type: T;
  parameters?: { [key: string]: any };
}
