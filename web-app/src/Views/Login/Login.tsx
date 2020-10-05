import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import BrandHeader from '../../Components/BrandHeader';
import AsyncButton from '../../Components/AsyncButton';
import useLocalAuth from '../../Hooks/useLocalAuth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

export default function Login() {
  const localAuth = useLocalAuth();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [fields, setFields] = useState({
    username: '',
    password: '',
  });

  useEffect(() => {
    const onLoad = async () => {
      const user = await localAuth.getLoggedInUser();
      if (user) {
        history.replace('/');
      }
    };

    onLoad().then();
  }, []);

  const validateForm = () => {
    return fields.username.length > 0 && fields.password.length >= 8;
  };

  const submit = async (event: React.FormEvent<HTMLElement>) => {
    event.preventDefault();

    setIsLoading(true);

    try {
      await Auth.signIn(fields.username, fields.password);
      history.replace('/');
    } catch (e) {
      setIsLoading(false);
      setError(e);
      setFields({ ...fields, password: '' });
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
            value={fields.username}
            className="outline-none border border-gray-400 focus:border-brand rounded-md p-2"
            placeholder="Username"
            // TODO this feels like it can be extracted out to a hook
            onChange={(event) => {
              setFields({
                ...fields,
                username: event.target.value,
              });
              setError(null);
            }}
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
            onChange={(event) => {
              setFields({
                ...fields,
                password: event.target.value,
              });
              setError(null);
            }}
          />
          <AsyncButton
            text="Login"
            disabled={!validateForm()}
            type="submit"
            isLoading={isLoading}
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
