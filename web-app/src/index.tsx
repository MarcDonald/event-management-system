import React from 'react';
import ReactDOM from 'react-dom';
import './tailwind.css';
import App from './App';
import { Amplify } from 'aws-amplify';
import * as config from './config.json';

Amplify.configure({
  Auth: {
    mandatorySignIn: true,
    region: config.REGION,
    userPoolId: config.cognito.USER_POOL_ID,
    userPoolWebClientId: config.cognito.APP_CLIENT_ID,
    identityPoolId: config.cognito.IDENTITY_POOL_ID,
  },
});

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
