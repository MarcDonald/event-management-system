// Based on official AWS Documentation
// https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-lambda-auth.html
// (Creating a Lambda REQUEST authorizer function, n.d.)

module.exports = (dependencies) => async (event, context, callback) => {
  const { verify, getPublicKeys, generateAllowPolicy } = dependencies;

  const token = event.queryStringParameters.Authorization;

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

    if (
      decodedToken['custom:jobRole'] === 'ControlRoomOperator' ||
      decodedToken['custom:jobRole'] === 'Administrator' ||
      decodedToken['custom:jobRole'] === 'Steward'
    ) {
      callback(null, generateAllowPolicy(token, event.methodArn));
    } else {
      console.log(`Not authorized - Role ${decodedToken['custom:jobRole']}`);
      callback('Unauthorized');
    }
  } catch (e) {
    console.error(e.message);
    callback('Unauthorized');
  }
};
