const { promisify } = require('util');
const { REGION, USER_POOL_ID } = process.env;
const jwt = require('jsonwebtoken');
const axios = require('axios');
const jwkToPem = require('jwk-to-pem');
const verifyPromised = promisify(jwt.verify.bind(jwt));

// Cached version of the public keys so that the keys only have to be retrieved on cold starts
let keyCache;

// Based on official AWS documentation available at
// https://github.com/awslabs/aws-support-tools/blob/master/Cognito/decode-verify-jwt/decode-verify-jwt.ts

const getPublicKeys = async () => {
  if (keyCache) {
    return keyCache;
  } else {
    const publicKeysUrl = `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`;
    const publicKeysJwkResponse = await axios.get(publicKeysUrl);

    keyCache = publicKeysJwkResponse.data.keys.reduce((agg, current) => {
      const pem = jwkToPem(current);
      agg[current.kid] = { instance: current, pem };
      return agg;
    }, {});
    return keyCache;
  }
};

exports.handler = async (event) => {
  const token = event.identitySource[0];
  try {
    const tokenSections = (token || '').split('.');
    if (tokenSections.length < 2) {
      throw new Error('Invalid number of sections in token');
    }
    const rawHeader = Buffer.from(tokenSections[0], 'base64').toString('utf8');
    const headerJson = JSON.parse(rawHeader);
    const keys = await getPublicKeys();
    const key = keys[headerJson.kid];
    if (key === undefined) {
      throw new Error('Unknown kid');
    }

    const decodedToken = await verifyPromised(token, key.pem);

    if (decodedToken['custom:jobRole'] === 'Administrator') {
      return {
        statusCode: 200,
        isAuthorized: true,
      };
    }
    console.log(`Not authorized - Role ${decodedToken['custom:jobRole']}`);
  } catch (e) {
    console.log(e.message);
  }

  return {
    statusCode: 401,
    isAuthorized: false,
  };
};
