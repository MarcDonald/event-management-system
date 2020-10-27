const aws = require('aws-sdk');
const { USER_POOL_ID } = process.env;
const Cognito = new aws.CognitoIdentityServiceProvider();

exports.handler = async (event) => {
  const { username } = event.pathParameters;

  try {
    await Cognito.adminDeleteUser({
      UserPoolId: USER_POOL_ID,
      Username: username,
    }).promise();
  } catch (e) {
    console.log(e.message);
    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        error: `Error deleting user ${username} - ${e.message}`,
      }),
    };
  }

  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({}),
  };
};
