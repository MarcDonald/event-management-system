const testValues = {
  region: 'eu-test-1',
  validMetadataIndexName: 'validMetadataIndexName',
  validTableName: 'validTableName',
};

const dynamoQueryResponseBuilder = (items) => {
  return {
    ConsumedCapacity: {},
    Count: items.length,
    Items: items,
    ScannedCount: items.length,
  };
};

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

class MockAWSError extends Error {
  code;
  statusCode;

  constructor(message, code, statusCode = 500) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

module.exports = {
  testValues,
  dynamoQueryResponseBuilder,
  cognitoUserBuilder,
  MockAWSError,
};
