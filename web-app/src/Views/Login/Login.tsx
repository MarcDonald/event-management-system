import React, { useEffect, useReducer } from 'react';
import { useHistory } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import BrandHeader from '../../Components/BrandHeader';
import AsyncButton from '../../Components/AsyncButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import usePageProtection from '../../Hooks/usePageProtection';
import LoginStateReducer, {
  loginInitialState,
} from './State/LoginStateReducer';
import LoginStateActions from './State/LoginStateActions';

/**
 * Login page
 */
export default function Login() {
  const [state, dispatch] = useReducer(LoginStateReducer, loginInitialState);
  const { isLoading, error, username, password } = state;
  const pageProtection = usePageProtection();
  const history = useHistory();

  useEffect(() => {
    pageProtection.loggedOutProtection().then();
  }, []);

  const validateForm = () => username.length > 0 && password.length >= 8;

  const submit = async (event: React.FormEvent<HTMLElement>) => {
    event.preventDefault();
    dispatch({ type: LoginStateActions.Login });
    try {
      await Auth.signIn(username, password);
      dispatch({ type: LoginStateActions.LoginSuccess });
      history.replace('/');
    } catch (e) {
      dispatch({
        type: LoginStateActions.LoginFailure,
        parameters: { error: e },
      });
    }
  };

  return (
    <>
      <BrandHeader />
      <div className="grid grid-cols-5">
        <form
          onSubmit={submit}
          className="
          xl:col-start-3 xl:col-end-4
          col-start-2 col-end-5
          flex flex-col mt-4"
        >
          <label htmlFor="username">Username</label>
          <input
            id="username"
            inputMode="text"
            type="text"
            value={username}
            className="outline-none border border-gray-400 focus:border-brand rounded-md p-2"
            placeholder="Username"
            onChange={(event) =>
              dispatch({
                type: LoginStateActions.FieldChange,
                parameters: {
                  fieldName: event.target.id,
                  fieldValue: event.target.value,
                },
              })
            }
          />
          <label htmlFor="password" className="mt-2">
            Password
          </label>
          <input
            id="password"
            inputMode="text"
            type="password"
            value={password}
            className="outline-none border border-gray-400 focus:border-brand rounded-md p-2"
            placeholder="Password"
            onChange={(event) =>
              dispatch({
                type: LoginStateActions.FieldChange,
                parameters: {
                  fieldName: event.target.id,
                  fieldValue: event.target.value,
                },
              })
            }
          />
          <AsyncButton
            text="Login"
            disabled={!validateForm()}
            type="submit"
            isLoading={isLoading}
            className="mt-2"
          />
          {error && (
            <div className="text-center mt-2 mb-8">
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="text-error mr-2"
              />
              <span>{error.message}</span>
            </div>
          )}
        </form>
      </div>
    </>
  );
}
