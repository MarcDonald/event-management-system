import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Amplify } from 'aws-amplify';
import * as config from './config.json';

// Configures AWS Amplify with the details stored in src/config.json
Amplify.configure({
  Auth: {
    mandatorySignIn: true,
    region: config.REGION,
    userPoolId: config.COGNITO.USER_POOL_ID,
    userPoolWebClientId: config.COGNITO.APP_CLIENT_ID,
    identityPoolId: config.COGNITO.IDENTITY_POOL_ID,
  },
});

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
