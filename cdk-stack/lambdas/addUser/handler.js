const response = {
  headers: { 'content-type': 'application/json' },
  statusCode: 500,
};

module.exports = (dependencies) => async (event) => {
  const { Cognito, apiClientId, userPoolId } = dependencies;

  if (!event.body) {
    return {
      ...response,
      statusCode: 400,
      body: JSON.stringify({
        error: `Request must contain a body containing username, password, givenName, familyName, and role`,
      }),
    };
  }

  const { username, password, givenName, familyName, role } = JSON.parse(
    event.body
  );

  if (!username || !password || !givenName || !familyName || !role) {
    return {
      ...response,
      statusCode: 400,
      body: JSON.stringify({
        error: `Request must contain username, password, givenName, familyName, and role`,
      }),
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
      UserPoolId: userPoolId,
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
      ClientId: apiClientId,
      UserPoolId: userPoolId,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: temporaryPassword,
      },
    }).promise();

    console.log('Updating user password to password provided in event');
    await Cognito.adminRespondToAuthChallenge({
      ClientId: apiClientId,
      UserPoolId: userPoolId,
      ChallengeName: 'NEW_PASSWORD_REQUIRED',
      ChallengeResponses: {
        USERNAME: username,
        NEW_PASSWORD: password,
      },
      Session: authResponse.Session,
    }).promise();

    console.log('User created successfully');
    return {
      ...response,
      statusCode: 201,
      body: JSON.stringify({ username, givenName, familyName, role }),
    };
  } catch (e) {
    console.log(`Caught Error - ${JSON.stringify(e, null, 2)}`);
    return {
      ...response,
      statusCode: 500,
      body: JSON.stringify({ error: `Error creating user - ${e.message}` }),
    };
  }
};
