const response = {
  headers: { 'content-type': 'application/json' },
  statusCode: 500,
};

module.exports = (dependencies) => async (event) => {
  const { Cognito, userPoolId } = dependencies;
  const { username } = event.pathParameters;

  if (!username) {
    return {
      ...response,
      statusCode: 400,
      body: JSON.stringify({ message: 'Username must be provided' }),
    };
  }

  try {
    const user = await Cognito.adminGetUser({
      UserPoolId: userPoolId,
      Username: username,
    }).promise();

    const formattedUser = {
      username: user.Username,
      sub: user.UserAttributes[0].Value,
      role: user.UserAttributes[1].Value,
      givenName: user.UserAttributes[2].Value,
      familyName: user.UserAttributes[3].Value,
    };

    return {
      ...response,
      statusCode: 200,
      body: JSON.stringify(formattedUser),
    };
  } catch (e) {
    console.error(`${e.code} - ${e.message}`);

    if (e.code === 'UserNotFoundException') {
      return {
        ...response,
        statusCode: 404,
        body: JSON.stringify({
          message: 'User could not be found',
        }),
      };
    }

    return {
      ...response,
      body: JSON.stringify({
        message: `Error getting user '${username}' - ${e.message}`,
      }),
    };
  }
};
