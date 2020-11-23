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
    await Cognito.adminDeleteUser({
      UserPoolId: userPoolId,
      Username: username,
    }).promise();
  } catch (e) {
    console.log(`${e.code} - ${e.message}`);

    if (e.code === 'UserNotFoundException') {
      return {
        ...response,
        statusCode: 404,
        body: JSON.stringify({
          message: `Cannot delete user that does not exist`,
        }),
      };
    }

    return {
      ...response,
      statusCode: 500,
      body: JSON.stringify({
        message: `Error deleting user ${username} - ${e.message}`,
      }),
    };
  }

  return {
    ...response,
    statusCode: 204,
  };
};
