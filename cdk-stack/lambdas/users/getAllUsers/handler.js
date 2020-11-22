const response = {
  headers: { 'content-type': 'application/json' },
  statusCode: 500,
};

module.exports = (dependencies) => async (event) => {
  const { Cognito, userPoolId } = dependencies;

  try {
    const users = await Cognito.listUsers({
      UserPoolId: userPoolId,
    }).promise();

    const formattedUsers = users.Users.map((rawUser) => {
      return {
        username: rawUser.Username,
        sub: rawUser.Attributes[0].Value,
        role: rawUser.Attributes[1].Value,
        givenName: rawUser.Attributes[2].Value,
        familyName: rawUser.Attributes[3].Value,
      };
    });

    return {
      ...response,
      statusCode: 200,
      body: JSON.stringify(formattedUsers),
    };
  } catch (e) {
    console.error(`${e.code} - ${e.message}`);

    return {
      ...response,
      statusCode: 500,
      body: JSON.stringify({
        message: `Unable to retrieve all users - ${e.message}`,
      }),
    };
  }
};
