import { CancelTokenSource } from 'axios';

export default interface Api {
  getCancelTokenSource: () => CancelTokenSource;
}
