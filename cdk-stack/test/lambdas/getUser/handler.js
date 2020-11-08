const { cognitoUserBuilder, testValues } = require('../../testUtils/userUtils');
const MockAWSError = require('../../testUtils/MockAWSError');
const {
  validUsername,
  invalidUsername,
  validSub,
  validRole,
  validGivenName,
  validFamilyName,
  validUserPoolId,
} = testValues;

let handler;
let adminGetUserMock = jest.fn();

beforeEach(() => {
  const Cognito = {
    adminGetUser: adminGetUserMock,
  };

  const dependencies = {
    userPoolId: validUserPoolId,
    Cognito,
  };

  handler = require('../../../lambdas/getUser/handler')(dependencies);
});

afterEach(jest.resetAllMocks);

test('Should return formatted user object when provided with a valid username', async () => {
  adminGetUserMock.mockReturnValue({
    promise: () => {
      return cognitoUserBuilder(
        validUsername,
        validSub,
        validRole,
        validGivenName,
        validFamilyName
      );
    },
  });

  const event = {
    pathParameters: {
      username: validUsername,
    },
  };

  const { statusCode, body } = await handler(event);

  expect(adminGetUserMock).toBeCalledWith({
    UserPoolId: validUserPoolId,
    Username: validUsername,
  });
  expect(statusCode).toBe(200);
  expect(body).toBe(
    JSON.stringify({
      username: validUsername,
      sub: validSub,
      role: validRole,
      givenName: validGivenName,
      familyName: validFamilyName,
    })
  );
});

test('Should return 404 if the user cannot be found', async () => {
  adminGetUserMock.mockImplementation(() => {
    throw new MockAWSError('User could not be found.', 'UserNotFoundException');
  });

  const event = {
    pathParameters: {
      username: invalidUsername,
    },
  };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(404);
  expect(body).toBe(JSON.stringify({ message: 'User could not be found' }));
});

test('Should return 500 if another error is thrown', async () => {
  adminGetUserMock.mockImplementation(() => {
    throw new MockAWSError('The error message.', 'AnotherError');
  });

  const event = {
    pathParameters: {
      username: invalidUsername,
    },
  };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(500);
  expect(body).toBe(
    JSON.stringify({
      message: `Error getting user '${invalidUsername}' - The error message.`,
    })
  );
});
