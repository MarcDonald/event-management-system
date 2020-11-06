const aws = require('aws-sdk');
const { USER_POOL_ID } = process.env;
const Cognito = new aws.CognitoIdentityServiceProvider();

exports.handler = require('./handler')({
  USER_POOL_ID,
  Cognito,
});
