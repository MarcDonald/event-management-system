import React, { useEffect, useState } from 'react';
import { Auth } from 'aws-amplify';
import BrandHeader from '../../Components/BrandHeader';
import AsyncButton from '../../Components/AsyncButton';
import useLocalAuth from '../../Hooks/useLoggedInUser';

export default function Login() {
  const localAuth = useLocalAuth();
  const [status, setStatus] = useState('Not Logged In');
  const [fields, setFields] = useState({
    username: '',
    password: '',
  });

  useEffect(() => {
    const onLoad = async () => {
      const user = await localAuth.getLoggedInUser();
      if (user) {
        setStatus(
          `Logged in as ${user.username} - ${
            user.getSignInUserSession().getIdToken().payload['custom:jobRole']
          }`
        );
      }
    };

    onLoad().then();
  }, []);

  const validateForm = () => {
    return fields.username.length > 0 && fields.password.length >= 8;
  };

  const submit = async (event: React.FormEvent<HTMLElement>) => {
    event.preventDefault();

    setStatus('Authenticating');

    try {
      const result = await Auth.signIn(fields.username, fields.password);
      setStatus(
        `Logged in as ${result.username} - ${
          result.getSignInUserSession().getIdToken().payload['custom:jobRole']
        }`
      );
    } catch (e) {
      setStatus('Login Failure');
      setFields({ ...fields, password: '' });
      alert(e.message);
    }
  };

  const enabledButtonStyle =
    'bg-brand rounded-md text-white font-semibold p-2 mt-4 hover:bg-brand-light focus:bg-brand-light focus:outline-none';
  const disabledButtonStyle =
    'bg-gray-500 rounded-md text-white font-semibold p-2 mt-4 cursor-not-allowed focus:outline-none';

  return (
    <>
      <BrandHeader />
      <div className="grid grid-cols-5">
        <form
          onSubmit={submit}
          className="
          xl:col-start-3 xl:col-end-4
          col-start-2 col-end-5
          flex flex-col"
        >
          <div className="text-center mt-2 mb-8">
            <span>Status: {status}</span>
          </div>

          <label htmlFor="username">Username</label>
          <input
            id="username"
            inputMode="text"
            type="text"
            value={fields.username}
            className="outline-none border border-gray-400 focus:border-brand rounded-md p-2"
            placeholder="Username"
            onChange={(event) =>
              setFields({
                ...fields,
                username: event.target.value,
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
            value={fields.password}
            className="outline-none border border-gray-400 focus:border-brand rounded-md p-2"
            placeholder="Password"
            onChange={(event) =>
              setFields({
                ...fields,
                password: event.target.value,
              })
            }
          />
          <AsyncButton
            text="Login"
            enabledClassName={enabledButtonStyle}
            disabledClassName={disabledButtonStyle}
            disabled={!validateForm()}
            type="submit"
            isLoading={status === 'Authenticating'}
          />
        </form>
      </div>
    </>
  );
}
