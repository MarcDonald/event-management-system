const aws = require('aws-sdk');
const { USER_POOL_ID } = process.env;
const Cognito = new aws.CognitoIdentityServiceProvider();

exports.handler = async (event) => {
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
    console.log(e.message);
    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        error: `Error getting user ${username} - ${e.message}`,
      }),
    };
  }
};
