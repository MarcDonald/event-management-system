const aws = require('aws-sdk');
const { USER_POOL_ID, API_CLIENT_ID } = process.env;
const Cognito = new aws.CognitoIdentityServiceProvider();

exports.handler = async (event) => {
  const { username } = event.pathParameters;

  if (!event.body) {
    return {
      statusCode: 400,
      headers: { 'content-type': 'application/json' },
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
        UserPoolId: USER_POOL_ID,
        Username: username,
        UserAttributes: attributes,
      }).promise();
    }

    if (password) {
      await Cognito.adminSetUserPassword({
        UserPoolId: USER_POOL_ID,
        Username: username,
        Password: password,
        Permanent: true,
      }).promise();
    }
  } catch (e) {
    console.log(`Caught Error - ${e.message}`);
    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ error: `Error updating user - ${e.message}` }),
    };
  }

  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json' },
    body: `${username} updated successfully`,
  };
};
