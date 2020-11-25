const { awsUtils, userUtils } = require('../../../testUtils');
const { MockAWSError } = awsUtils;
const { testValues } = userUtils;
const {
  validUsername,
  validUserPoolId,
  validGivenName,
  validFamilyName,
  validPassword,
  validRole,
} = testValues;

let handler;

const adminUpdateUserAttributesMock = jest.fn();
const adminSetUserPasswordMock = jest.fn();

beforeEach(() => {
  const Cognito = {
    adminUpdateUserAttributes: adminUpdateUserAttributesMock,
    adminSetUserPassword: adminSetUserPasswordMock,
  };

  const dependencies = {
    userPoolId: validUserPoolId,
    Cognito,
  };

  handler = require('../../../../lambdas/users/updateUser/handler')(
    dependencies
  );
});

afterEach(jest.resetAllMocks);

test('Should return 400 if a username is not provided', async () => {
  const event = {
    pathParameters: {},
  };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(JSON.stringify({ message: 'Username must be provided' }));
  expect(adminSetUserPasswordMock).toBeCalledTimes(0);
  expect(adminUpdateUserAttributesMock).toBeCalledTimes(0);
});

test('Should return 400 when called with an event with no body', async () => {
  const event = {
    pathParameters: {
      username: validUsername,
    },
  };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message:
        'Request must contain a body containing at least one of the following: password, givenName, familyName, role',
    })
  );
});

test('Should return 400 when called with an event with an empty body', async () => {
  const event = {
    pathParameters: {
      username: validUsername,
    },
    body: '',
  };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message:
        'Request must contain a body containing at least one of the following: password, givenName, familyName, role',
    })
  );
});

test("Should update user's given name when provided with a givenName in the request body", async () => {
  const eventBody = JSON.stringify({
    givenName: validGivenName,
  });
  const event = {
    pathParameters: {
      username: validUsername,
    },
    body: eventBody,
  };

  adminUpdateUserAttributesMock.mockReturnValue({
    promise: () => {},
  });

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(200);
  expect(body).toBe(
    JSON.stringify({ message: `${validUsername} updated successfully` })
  );
  expect(adminUpdateUserAttributesMock).toBeCalledTimes(1);
  expect(adminUpdateUserAttributesMock).toBeCalledWith({
    UserPoolId: validUserPoolId,
    Username: validUsername,
    UserAttributes: [
      {
        Name: 'given_name',
        Value: validGivenName,
      },
    ],
  });
  expect(adminSetUserPasswordMock).toBeCalledTimes(0);
});

test("Should update user's family name when provided with a givenName in the request body", async () => {
  const eventBody = JSON.stringify({
    familyName: validFamilyName,
  });
  const event = {
    pathParameters: {
      username: validUsername,
    },
    body: eventBody,
  };

  adminUpdateUserAttributesMock.mockReturnValue({
    promise: () => {},
  });

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(200);
  expect(body).toBe(
    JSON.stringify({ message: `${validUsername} updated successfully` })
  );
  expect(adminUpdateUserAttributesMock).toBeCalledTimes(1);
  expect(adminUpdateUserAttributesMock).toBeCalledWith({
    UserPoolId: validUserPoolId,
    Username: validUsername,
    UserAttributes: [
      {
        Name: 'family_name',
        Value: validFamilyName,
      },
    ],
  });
  expect(adminSetUserPasswordMock).toBeCalledTimes(0);
});

test("Should update user's family name when provided with a role in the request body", async () => {
  const eventBody = JSON.stringify({
    role: validRole,
  });
  const event = {
    pathParameters: {
      username: validUsername,
    },
    body: eventBody,
  };

  adminUpdateUserAttributesMock.mockReturnValue({
    promise: () => {},
  });

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(200);
  expect(body).toBe(
    JSON.stringify({ message: `${validUsername} updated successfully` })
  );
  expect(adminUpdateUserAttributesMock).toBeCalledTimes(1);
  expect(adminUpdateUserAttributesMock).toBeCalledWith({
    UserPoolId: validUserPoolId,
    Username: validUsername,
    UserAttributes: [
      {
        Name: 'custom:jobRole',
        Value: validRole,
      },
    ],
  });
  expect(adminSetUserPasswordMock).toBeCalledTimes(0);
});

test("Should update user's attributes when provided with multiple in the event body", async () => {
  const eventBody = JSON.stringify({
    role: validRole,
    givenName: validGivenName,
    familyName: validFamilyName,
  });
  const event = {
    pathParameters: {
      username: validUsername,
    },
    body: eventBody,
  };

  adminUpdateUserAttributesMock.mockReturnValue({
    promise: () => {},
  });

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(200);
  expect(body).toBe(
    JSON.stringify({ message: `${validUsername} updated successfully` })
  );
  expect(adminUpdateUserAttributesMock).toBeCalledTimes(1);
  expect(adminUpdateUserAttributesMock).toBeCalledWith({
    UserPoolId: validUserPoolId,
    Username: validUsername,
    UserAttributes: [
      {
        Name: 'given_name',
        Value: validGivenName,
      },
      {
        Name: 'family_name',
        Value: validFamilyName,
      },
      {
        Name: 'custom:jobRole',
        Value: validRole,
      },
    ],
  });
  expect(adminSetUserPasswordMock).toBeCalledTimes(0);
});

test("Should update user's password when provided with a password in the request body", async () => {
  const eventBody = JSON.stringify({
    password: validPassword,
  });
  const event = {
    pathParameters: {
      username: validUsername,
    },
    body: eventBody,
  };

  adminSetUserPasswordMock.mockReturnValue({
    promise: () => {},
  });

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(200);
  expect(body).toBe(
    JSON.stringify({ message: `${validUsername} updated successfully` })
  );
  expect(adminUpdateUserAttributesMock).toBeCalledTimes(0);
  expect(adminSetUserPasswordMock).toBeCalledTimes(1);
  expect(adminSetUserPasswordMock).toBeCalledWith({
    UserPoolId: validUserPoolId,
    Username: validUsername,
    Password: validPassword,
    Permanent: true,
  });
});

test("Should update user's password and attributes when provided with a password and attributes in the request body", async () => {
  const eventBody = JSON.stringify({
    password: validPassword,
    givenName: validGivenName,
  });
  const event = {
    pathParameters: {
      username: validUsername,
    },
    body: eventBody,
  };

  adminUpdateUserAttributesMock.mockReturnValue({
    promise: () => {},
  });

  adminSetUserPasswordMock.mockReturnValue({
    promise: () => {},
  });

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(200);
  expect(body).toBe(
    JSON.stringify({ message: `${validUsername} updated successfully` })
  );
  expect(adminUpdateUserAttributesMock).toBeCalledTimes(1);
  expect(adminUpdateUserAttributesMock).toBeCalledWith({
    UserPoolId: validUserPoolId,
    Username: validUsername,
    UserAttributes: [
      {
        Name: 'given_name',
        Value: validGivenName,
      },
    ],
  });
  expect(adminSetUserPasswordMock).toBeCalledTimes(1);
  expect(adminSetUserPasswordMock).toBeCalledWith({
    UserPoolId: validUserPoolId,
    Username: validUsername,
    Password: validPassword,
    Permanent: true,
  });
});

test('Should return 404 when user does not exist', async () => {
  const eventBody = JSON.stringify({
    role: validRole,
  });
  const event = {
    pathParameters: {
      username: validUsername,
    },
    body: eventBody,
  };

  adminUpdateUserAttributesMock.mockReturnValue({
    promise: () => {
      throw new MockAWSError('User does not exist.', 'UserNotFoundException');
    },
  });

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(404);
  expect(body).toBe(
    JSON.stringify({ message: `Cannot update user that does not exist` })
  );
  expect(adminUpdateUserAttributesMock).toBeCalledTimes(1);
  expect(adminUpdateUserAttributesMock).toBeCalledWith({
    UserPoolId: validUserPoolId,
    Username: validUsername,
    UserAttributes: [
      {
        Name: 'custom:jobRole',
        Value: validRole,
      },
    ],
  });
  expect(adminSetUserPasswordMock).toBeCalledTimes(0);
});

test('Should return 500 when another error is thrown', async () => {
  const eventBody = JSON.stringify({
    role: validRole,
  });
  const event = {
    pathParameters: {
      username: validUsername,
    },
    body: eventBody,
  };

  adminUpdateUserAttributesMock.mockReturnValue({
    promise: () => {
      throw new MockAWSError('An unknown error.', 'UnknownException');
    },
  });

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(500);
  expect(body).toBe(
    JSON.stringify({ message: `Error updating user - An unknown error.` })
  );
  expect(adminUpdateUserAttributesMock).toBeCalledTimes(1);
  expect(adminUpdateUserAttributesMock).toBeCalledWith({
    UserPoolId: validUserPoolId,
    Username: validUsername,
    UserAttributes: [
      {
        Name: 'custom:jobRole',
        Value: validRole,
      },
    ],
  });
  expect(adminSetUserPasswordMock).toBeCalledTimes(0);
});
