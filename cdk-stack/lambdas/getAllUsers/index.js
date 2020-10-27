const aws = require('aws-sdk');
const { USER_POOL_ID } = process.env;
const Cognito = new aws.CognitoIdentityServiceProvider();

exports.handler = async () => {
  const users = await Cognito.listUsers({
    UserPoolId: USER_POOL_ID,
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
    statusCode: 200,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(formattedUsers),
  };
};
