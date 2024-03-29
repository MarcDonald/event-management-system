// Based on official AWS documentation available at
// https://github.com/awslabs/aws-support-tools/blob/master/Cognito/decode-verify-jwt/decode-verify-jwt.ts
// (Mayer and Tiwari, 2018)

// Cached version of the public keys so that the keys only have to be retrieved on cold starts
let keyCache;

module.exports = (dependencies) => async () => {
  const { region, userPoolId, axios, jwkToPem } = dependencies;

  if (keyCache) {
    return keyCache;
  } else {
    // Gets the public keys from AWS and converts it to a usable format
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
