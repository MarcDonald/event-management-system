import React, { useEffect, useReducer } from 'react';
import { useHistory } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import BrandHeader from '../../shared/components/BrandHeader';
import usePageProtection from '../../shared/hooks/usePageProtection';
import LoginStateReducer, {
  loginInitialState,
} from './state/LoginStateReducer';
import LoginStateActions from './state/LoginStateActions';
import { toast, Toaster } from 'react-hot-toast';
import {
  ContentContainer,
  LoginForm,
  FormInput,
  Label,
  LabelWithTopGap,
} from './LoginStyles';
import LoginButton from './LoginButton';

/**
 * Login page
 */
export default function Login() {
  const [state, dispatch] = useReducer(LoginStateReducer, loginInitialState);
  const { isLoading, username, password } = state;
  const pageProtection = usePageProtection();
  const history = useHistory();

  useEffect(() => {
    pageProtection.loggedOutProtection().then();
  }, []);

  useEffect(() => {
    if (state.error) {
      toast.error(state.error.message);
    }
  }, [state.error]);

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
      <Toaster position="top-center" />
      <BrandHeader />
      <ContentContainer>
        <LoginForm onSubmit={submit}>
          <Label htmlFor="username">Username</Label>
          <FormInput
            id="username"
            inputMode="text"
            type="text"
            value={username}
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
          <LabelWithTopGap htmlFor="password">Password</LabelWithTopGap>
          <FormInput
            id="password"
            inputMode="text"
            type="password"
            value={password}
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
          <LoginButton
            text="Login"
            disabled={!validateForm()}
            type="submit"
            isLoading={isLoading}
          />
        </LoginForm>
      </ContentContainer>
    </>
  );
}
