const aws = require('aws-sdk');
const { USER_POOL_ID, API_CLIENT_ID } = process.env;
const Cognito = new aws.CognitoIdentityServiceProvider();

exports.handler = require('./handler')({
  userPoolId: USER_POOL_ID,
  apiClientId: API_CLIENT_ID,
  Cognito,
});
