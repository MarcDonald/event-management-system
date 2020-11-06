const response = {
  headers: { 'content-type': 'application/json' },
  statusCode: 500,
};

module.exports = (dependencies) => async (event) => {
  const { Cognito, userPoolId } = dependencies;
  const { username } = event.pathParameters;

  if (!event.body) {
    return {
      ...response,
      statusCode: 400,
      body: JSON.stringify({
        error: `Request must contain a body containing at least one of the following: password, givenName, familyName, role`,
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
    return {
      ...response,
      statusCode: 500,
      body: JSON.stringify({ error: `Error updating user - ${e.message}` }),
    };
  }

  return {
    ...response,
    statusCode: 200,
    body: `${username} updated successfully`,
  };
};
