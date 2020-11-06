// Based on official AWS documentation available at
// https://github.com/awslabs/aws-support-tools/blob/master/Cognito/decode-verify-jwt/decode-verify-jwt.ts

// Cached version of the public keys so that the keys only have to be retrieved on cold starts
let keyCache;

const getPublicKeys = async (dependencies) => {
  const { region, userPoolId, axios, jwkToPem } = dependencies;

  if (keyCache) {
    return keyCache;
  } else {
    const publicKeysUrl = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;
    const publicKeysJwkResponse = await axios.get(publicKeysUrl);

    keyCache = publicKeysJwkResponse.data.keys.reduce((agg, current) => {
      const pem = jwkToPem(current);
      agg[current.kid] = { instance: current, pem };
      return agg;
    }, {});
    return keyCache;
  }
};

module.exports = (dependencies) => async (event) => {
  const { verify } = dependencies;

  const token = event.identitySource[0];
  try {
    const tokenSections = (token || '').split('.');
    if (tokenSections.length < 2) {
      throw new Error('Invalid number of sections in token');
    }
    const rawHeader = Buffer.from(tokenSections[0], 'base64').toString('utf8');
    const headerJson = JSON.parse(rawHeader);
    const keys = await getPublicKeys(dependencies);
    const key = keys[headerJson.kid];
    if (key === undefined) {
      throw new Error('Unknown kid');
    }

    const decodedToken = await verify(token, key.pem);

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
