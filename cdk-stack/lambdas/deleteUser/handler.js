const response = {
  headers: { 'content-type': 'application/json' },
  statusCode: 500,
};

module.exports = (dependencies) => async (event) => {
  const { Cognito, userPoolId } = dependencies;
  const { username } = event.pathParameters;

  try {
    await Cognito.adminDeleteUser({
      UserPoolId: userPoolId,
      Username: username,
    }).promise();
  } catch (e) {
    console.log(e.message);
    return {
      ...response,
      statusCode: 500,
      body: JSON.stringify({
        error: `Error deleting user ${username} - ${e.message}`,
      }),
    };
  }

  return {
    ...response,
    statusCode: 200,
    body: JSON.stringify({}),
  };
};
