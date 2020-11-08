const cognitoUserBuilder = (
  username,
  sub,
  role,
  givenName,
  familyName,
  attributeKeyName = 'UserAttributes'
) => {
  const user = {
    Username: username,
  };

  user[attributeKeyName] = [
    {
      Name: 'sub',
      Value: sub,
    },
    {
      Name: 'custom:jobRole',
      Value: role,
    },
    {
      Name: 'givenName',
      Value: givenName,
    },
    {
      Name: 'familyName',
      Value: familyName,
    },
  ];

  return user;
};

const testValues = {
  validUserPoolId: 'validUserPoolId',
  invalidUserPoolId: 'invalidUserPoolId',
  validApiClientId: 'validApiClientId',
  invalidApiClientId: 'invalidApiClientId',
  validUsername: 'validUsername',
  invalidUsername: 'invalidUsername',
  validPassword: 'validPassword',
  invalidPassword: 'invalidPassword',
  validSub: 'validSub',
  invalidSub: 'invalidSub',
  validRole: 'validRole',
  invalidRole: 'invalidRole',
  validGivenName: 'validGivenName',
  invalidGivenName: 'invalidGivenName',
  validFamilyName: 'validFamilyName',
  invalidFamilyName: 'invalidFamilyName',
};

module.exports = {
  cognitoUserBuilder,
  testValues,
};
