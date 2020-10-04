import React, { useState } from 'react';
import { Auth } from 'aws-amplify';

export default function Login() {
  const [status, setStatus] = useState('Not Logged In');
  const [fields, setFields] = useState({
    username: '',
    password: '',
  });

  const validateForm = () => {
    return fields.username.length > 0 && fields.password.length > 0;
  };

  const submit = async (event: React.FormEvent<HTMLElement>) => {
    event.preventDefault();

    setStatus('Authenticating');

    try {
      const result = await Auth.signIn(fields.username, fields.password);
      console.log(`Successful sign in - ${JSON.stringify(result)}`);
      setStatus(
        `Logged in as ${result.username} - ${JSON.stringify(
          result.challengeParam.userAttributes['custom:jobRole']
        )}`
      );
    } catch (e) {
      setStatus('Login Failure');
      alert(e.message);
    }
  };

  return (
    <div>
      <form onSubmit={(event) => submit(event)}>
        <input
          inputMode="text"
          type="text"
          value={fields.username}
          placeholder="Username"
          onChange={(event) =>
            setFields({
              ...fields,
              username: event.target.value,
            })
          }
        />
        <input
          inputMode="text"
          type="password"
          value={fields.password}
          placeholder="Password"
          onChange={(event) =>
            setFields({
              ...fields,
              password: event.target.value,
            })
          }
        />
        <button disabled={!validateForm()} type="submit">
          Login
        </button>
      </form>
      <div>
        <span>Status: {status}</span>
      </div>
    </div>
  );
}
