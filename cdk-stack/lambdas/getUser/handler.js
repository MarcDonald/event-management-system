module.exports = (dependencies) => async (event) => {
  const { Cognito, USER_POOL_ID } = dependencies;
  const { username } = event.pathParameters;

  try {
    const user = await Cognito.adminGetUser({
      UserPoolId: USER_POOL_ID,
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
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(formattedUser),
    };
  } catch (e) {
    console.error(`${e.code} - ${e.message}`);
    if (e.code === 'UserNotFoundException') {
      return {
        statusCode: 404,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          message: 'User could not be found',
        }),
      };
    }

    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        message: `Error getting user '${username}' - ${e.message}`,
      }),
    };
  }
};
