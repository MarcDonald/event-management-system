const aws = require('aws-sdk');
const { promisify } = require('util');
const { REGION, USER_POOL_ID } = process.env;
const jwt = require('jsonwebtoken');
const axios = require('axios');
const jwkToPem = require('jwk-to-pem');
const verify = promisify(jwt.verify.bind(jwt));
const getPublicKeys = require('./getPublicKeys');
const Dynamo = new aws.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: 'eu-west-1',
});

exports.handler = require('./handler')({
  verify,
  getPublicKeys: getPublicKeys({
    region: REGION,
    userPoolId: USER_POOL_ID,
    axios,
    jwkToPem,
  }),
  Dynamo,
  tableName: process.env.TABLE_NAME,
});
