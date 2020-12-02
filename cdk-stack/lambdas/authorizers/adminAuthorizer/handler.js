// Based on official AWS documentation available at
// https://github.com/awslabs/aws-support-tools/blob/master/Cognito/decode-verify-jwt/decode-verify-jwt.ts
// (Mayer and Tiwari, 2018)

module.exports = (dependencies) => async (event) => {
  const { verify, getPublicKeys } = dependencies;

  // The first index in the identity source array is the Authorization header value i.e the JWT
  const token = event.identitySource[0];
  try {
    const tokenSections = (token || '').split('.');
    if (tokenSections.length < 2) {
      throw new Error('Invalid number of sections in token');
    }
    const rawHeader = Buffer.from(tokenSections[0], 'base64').toString('utf8');
    const headerJson = JSON.parse(rawHeader);
    if (!headerJson.kid) {
      throw new Error('No kid provided');
    }
    const keys = await getPublicKeys();
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
    console.error(e.message);
  }

  return {
    statusCode: 401,
    isAuthorized: false,
  };
};
