const { testValues } = require('../../testUtils/userUtils');
const MockAWSError = require('../../testUtils/MockAWSError');
const {
  validUsername,
  invalidUsername,
  validPassword,
  validRole,
  validGivenName,
  validFamilyName,
  validUserPoolId,
  validApiClientId,
} = testValues;

let adminCreateUserMock = jest.fn();
let adminInitiateAuthMock = jest.fn();
let adminRespondToAuthChallengeMock = jest.fn();

beforeEach(() => {
  const Cognito = {
    adminCreateUser: adminCreateUserMock,
    adminInitiateAuth: adminInitiateAuthMock,
    adminRespondToAuthChallenge: adminRespondToAuthChallengeMock,
  };

  const dependencies = {
    userPoolId: validUserPoolId,
    apiClientId: validApiClientId,
    Cognito,
  };

  handler = require('../../../lambdas/addUser/handler')(dependencies);
});

afterEach(() => {
  jest.resetAllMocks();
});

let handler;

test('Should create user and return formatted user object when provided with a valid event', async () => {
  const eventBody = JSON.stringify({
    username: validUsername,
    password: validPassword,
    givenName: validGivenName,
    familyName: validFamilyName,
    role: validRole,
  });
  const event = { body: eventBody };

  adminCreateUserMock.mockReturnValue({
    promise: () => {},
  });

  adminInitiateAuthMock.mockReturnValue({
    promise: () => {
      return {
        Session: 'session',
      };
    },
  });

  adminRespondToAuthChallengeMock.mockReturnValue({
    promise: () => {},
  });

  const { statusCode, body } = await handler(event);

  expect(adminCreateUserMock).toBeCalledWith({
    UserPoolId: validUserPoolId,
    Username: validUsername,
    TemporaryPassword: expect.any(String),
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
  expect(adminCreateUserMock).toBeCalledTimes(1);

  expect(adminInitiateAuthMock).toBeCalledWith({
    AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
    ClientId: validApiClientId,
    UserPoolId: validUserPoolId,
    AuthParameters: {
      USERNAME: validUsername,
      PASSWORD: expect.any(String),
    },
  });
  expect(adminInitiateAuthMock).toBeCalledTimes(1);

  expect(adminRespondToAuthChallengeMock).toBeCalledWith({
    ClientId: validApiClientId,
    UserPoolId: validUserPoolId,
    ChallengeName: 'NEW_PASSWORD_REQUIRED',
    ChallengeResponses: {
      USERNAME: validUsername,
      NEW_PASSWORD: validPassword,
    },
    Session: 'session',
  });
  expect(adminRespondToAuthChallengeMock).toBeCalledTimes(1);

  expect(statusCode).toBe(201);
  expect(body).toBe(
    JSON.stringify({
      username: validUsername,
      givenName: validGivenName,
      familyName: validFamilyName,
      role: validRole,
    })
  );
});

test('Should return 400 when called with an event with no body', async () => {
  const event = {};

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message:
        'Request must contain a body containing a username, password, givenName, familyName, and role',
    })
  );
});

test('Should return 400 when called with an event with an empty body', async () => {
  const event = { body: '' };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message:
        'Request must contain a body containing a username, password, givenName, familyName, and role',
    })
  );
});

test('Should return 400 when called with an event with no username', async () => {
  const eventBody = JSON.stringify({
    password: validPassword,
    givenName: validGivenName,
    familyName: validFamilyName,
    role: validRole,
  });
  const event = { body: eventBody };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message:
        'Request must contain a username, password, givenName, familyName, and role',
    })
  );
});

test('Should return 400 when called with an event with no password', async () => {
  const eventBody = JSON.stringify({
    username: validUsername,
    givenName: validGivenName,
    familyName: validFamilyName,
    role: validRole,
  });
  const event = { body: eventBody };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message:
        'Request must contain a username, password, givenName, familyName, and role',
    })
  );
});
test('Should return 400 when called with an event with no givenName', async () => {
  const eventBody = JSON.stringify({
    username: validUsername,
    password: validPassword,
    familyName: validFamilyName,
    role: validRole,
  });
  const event = { body: eventBody };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message:
        'Request must contain a username, password, givenName, familyName, and role',
    })
  );
});

test('Should return 400 when called with an event with no familyName', async () => {
  const eventBody = JSON.stringify({
    username: validUsername,
    password: validPassword,
    givenName: validGivenName,
    role: validRole,
  });
  const event = { body: eventBody };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message:
        'Request must contain a username, password, givenName, familyName, and role',
    })
  );
});

test('Should return 400 when called with an event with no role', async () => {
  const eventBody = JSON.stringify({
    username: validUsername,
    password: validPassword,
    givenName: validGivenName,
    familyName: validFamilyName,
  });
  const event = { body: eventBody };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message:
        'Request must contain a username, password, givenName, familyName, and role',
    })
  );
});

test('Should return 400 when username is already taken', async () => {
  const eventBody = JSON.stringify({
    username: invalidUsername,
    password: validPassword,
    givenName: validGivenName,
    familyName: validFamilyName,
    role: validRole,
  });
  const event = { body: eventBody };

  adminCreateUserMock.mockImplementation(() => {
    throw new MockAWSError(
      'User account already exists',
      'UsernameExistsException'
    );
  });

  const { statusCode, body } = await handler(event);

  expect(adminCreateUserMock).toBeCalledWith({
    UserPoolId: validUserPoolId,
    Username: invalidUsername,
    TemporaryPassword: expect.any(String),
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
  expect(adminCreateUserMock).toBeCalledTimes(1);
  expect(adminInitiateAuthMock).toBeCalledTimes(0);
  expect(adminRespondToAuthChallengeMock).toBeCalledTimes(0);

  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({ message: 'Username has already been taken' })
  );
});

test('Should return 500 when another error is thrown', async () => {
  const eventBody = JSON.stringify({
    username: validUsername,
    password: validPassword,
    givenName: validGivenName,
    familyName: validFamilyName,
    role: validRole,
  });
  const event = { body: eventBody };

  adminCreateUserMock.mockImplementation(() => {
    throw new MockAWSError('Error message', 'UnknownException');
  });

  const { statusCode, body } = await handler(event);

  expect(adminCreateUserMock).toBeCalledWith({
    UserPoolId: validUserPoolId,
    Username: validUsername,
    TemporaryPassword: expect.any(String),
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
  expect(adminCreateUserMock).toBeCalledTimes(1);
  expect(adminInitiateAuthMock).toBeCalledTimes(0);
  expect(adminRespondToAuthChallengeMock).toBeCalledTimes(0);

  expect(statusCode).toBe(500);
  expect(body).toBe(
    JSON.stringify({ message: 'Error creating user - Error message' })
  );
});
