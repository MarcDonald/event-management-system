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
      body: JSON.stringify({
        message: 'Username must be provided',
      }),
    };
  }

  if (!event.body) {
    return {
      ...response,
      statusCode: 400,
      body: JSON.stringify({
        message: `Request must contain a body containing at least one of the following: password, givenName, familyName, role`,
      }),
    };
  }

  const { password, givenName, familyName, role } = JSON.parse(event.body);

  try {
    if (givenName || familyName || role) {
      const attributes = [];
      if (givenName)
        attributes.push({
          Name: 'given_name',
          Value: givenName,
        });
      if (familyName)
        attributes.push({
          Name: 'family_name',
          Value: familyName,
        });
      if (role)
        attributes.push({
          Name: 'custom:jobRole',
          Value: role,
        });

      await Cognito.adminUpdateUserAttributes({
        UserPoolId: userPoolId,
        Username: username,
        UserAttributes: attributes,
      }).promise();
    }

    if (password) {
      await Cognito.adminSetUserPassword({
        UserPoolId: userPoolId,
        Username: username,
        Password: password,
        Permanent: true,
      }).promise();
    }
  } catch (e) {
    console.log(`Caught Error - ${e.message}`);

    if (e.code === 'UserNotFoundException') {
      return {
        ...response,
        statusCode: 404,
        body: JSON.stringify({
          message: `Cannot update user that does not exist`,
        }),
      };
    }

    return {
      ...response,
      statusCode: 500,
      body: JSON.stringify({ message: `Error updating user - ${e.message}` }),
    };
  }

  return {
    ...response,
    statusCode: 200,
    body: JSON.stringify({ message: `${username} updated successfully` }),
  };
};
