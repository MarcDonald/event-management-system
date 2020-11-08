const { promisify } = require('util');
const { REGION, USER_POOL_ID } = process.env;
const jwt = require('jsonwebtoken');
const axios = require('axios');
const jwkToPem = require('jwk-to-pem');
const verify = promisify(jwt.verify.bind(jwt));
const getPublicKeys = require('./getPublicKeys');

exports.handler = require('./handler')({
  verify,
  getPublicKeys: getPublicKeys({ REGION, USER_POOL_ID, axios, jwkToPem }),
});
