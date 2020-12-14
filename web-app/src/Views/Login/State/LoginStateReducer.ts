import StateAction from '../../../Utils/StateAction';
import LoginStateActions from './LoginStateActions';

interface LoginState {
  username: string;
  password: string;
  error: Error | null;
  isLoading: boolean;
}

export const loginInitialState: LoginState = {
  username: '',
  password: '',
  error: null,
  isLoading: false,
};

export default function LoginStateReducer(
  state: LoginState,
  action: StateAction<LoginStateActions>
): LoginState {
  const { type, parameters } = action;
  switch (type) {
    case LoginStateActions.Login: {
      return {
        ...state,
        isLoading: true,
      };
    }
    case LoginStateActions.LoginSuccess: {
      return {
        ...state,
        isLoading: false,
      };
    }
    case LoginStateActions.LoginFailure: {
      return {
        ...state,
        isLoading: false,
        error: parameters?.error,
        password: '',
      };
    }
    case LoginStateActions.FieldChange: {
      return {
        ...state,
        [parameters?.fieldName]: parameters?.fieldValue,
        error: null,
      };
    }
    default:
      break;
  }
  return state;
}
