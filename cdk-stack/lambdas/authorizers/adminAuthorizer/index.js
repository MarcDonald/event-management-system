const { promisify } = require('util');
const { REGION, USER_POOL_ID } = process.env;
const jwt = require('jsonwebtoken');
const axios = require('axios');
const jwkToPem = require('jwk-to-pem');
const verify = promisify(jwt.verify.bind(jwt));

exports.handler = require('./handler')({
  region: REGION,
  userPoolId: USER_POOL_ID,
  axios,
  jwkToPem,
  verify,
});
