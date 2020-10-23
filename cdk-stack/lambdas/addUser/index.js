const aws = require('aws-sdk');
const { USER_POOL_ID, API_CLIENT_ID } = process.env;
const Cognito = new aws.CognitoIdentityServiceProvider();

exports.handler = async (event) => {
  if (!event.body) {
    return {
      statusCode: 400,
      body: `Request must contain a body containing username, password, givenName, familyName, and role`,
    };
  }

  const { username, password, givenName, familyName, role } = JSON.parse(
    event.body
  );

  if (!username || !password || !givenName || !familyName || !role) {
    return {
      statusCode: 400,
      body:
        'Request must contain username, password, givenName, familyName, and role',
    };
  }

  // This is a temporary password that is only used within this lambda to initially create the user
  const temporaryPassword = `A2${Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, '')
    .substr(0, 8)}`;

  try {
    console.log('Creating user with temporary password');
    await Cognito.adminCreateUser({
      UserPoolId: USER_POOL_ID,
      Username: username,
      TemporaryPassword: temporaryPassword,
      UserAttributes: [
        {
          Name: 'given_name',
          Value: givenName,
        },
        {
          Name: 'family_name',
          Value: familyName,
        },
        {
          Name: 'custom:jobRole',
          Value: role,
        },
      ],
    }).promise();

    console.log('Obtaining user session');
    const authResponse = await Cognito.adminInitiateAuth({
      AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
      ClientId: API_CLIENT_ID,
      UserPoolId: USER_POOL_ID,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: temporaryPassword,
      },
    }).promise();

    console.log('Updating user password to password provided in event');
    await Cognito.adminRespondToAuthChallenge({
      ClientId: API_CLIENT_ID,
      UserPoolId: USER_POOL_ID,
      ChallengeName: 'NEW_PASSWORD_REQUIRED',
      ChallengeResponses: {
        USERNAME: username,
        NEW_PASSWORD: password,
      },
      Session: authResponse.Session,
    }).promise();

    console.log('User created successfully');
    return {
      statusCode: 201,
      body: JSON.stringify({ username, givenName, familyName, role }),
    };
  } catch (e) {
    console.log(`Caught Error - ${JSON.stringify(e, null, 2)}`);
    return {
      statusCode: 500,
      body: `Error creating user - ${e.message}`,
    };
  }
};
