const MockAWSError = require('../../../testUtils/MockAWSError');
const { testValues } = require('../../../testUtils/userUtils');
const { validUsername, invalidUsername } = testValues;

let handler;

const adminDeleteUserMock = jest.fn();

beforeEach(() => {
  const Cognito = {
    adminDeleteUser: adminDeleteUserMock,
  };

  const dependencies = {
    Cognito,
  };
  handler = require('../../../../lambdas/users/deleteUser/handler')(
    dependencies
  );
});

afterEach(jest.resetAllMocks);

test('Should return 204 when a user is deleted successfully', async () => {
  const event = {
    pathParameters: {
      username: validUsername,
    },
  };

  adminDeleteUserMock.mockReturnValue({
    promise: () => {},
  });

  const { statusCode } = await handler(event);

  expect(statusCode).toBe(204);
  expect(adminDeleteUserMock).toBeCalledTimes(1);
});

test('Should return 400 when no username is supplied', async () => {
  const event = {
    pathParameters: {},
  };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(JSON.stringify('Username must be provided'));
  expect(adminDeleteUserMock).toBeCalledTimes(0);
});

test('Should return 404 when user does not exist', async () => {
  const event = {
    pathParameters: {
      username: invalidUsername,
    },
  };

  adminDeleteUserMock.mockReturnValue({
    promise: () => {
      throw new MockAWSError('User does not exist.', 'UserNotFoundException');
    },
  });

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(404);
  expect(body).toBe(
    JSON.stringify({ message: 'Cannot delete user that does not exist' })
  );
  expect(adminDeleteUserMock).toBeCalledTimes(1);
});

test('Should return 500 when another error is thrown', async () => {
  const event = {
    pathParameters: {
      username: validUsername,
    },
  };

  adminDeleteUserMock.mockReturnValue({
    promise: () => {
      throw new MockAWSError('An unknown error.', 'UnknownException');
    },
  });

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(500);
  expect(body).toBe(
    JSON.stringify({
      message: `Error deleting user ${validUsername} - An unknown error.`,
    })
  );
  expect(adminDeleteUserMock).toBeCalledTimes(1);
});
