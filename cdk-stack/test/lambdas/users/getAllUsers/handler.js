const { awsUtils, userUtils } = require('../../../testUtils');
const { MockAWSError, cognitoUserBuilder } = awsUtils;
const { testValues } = userUtils;

let handler;

const listUsersMock = jest.fn();

beforeEach(() => {
  const Cognito = {
    listUsers: listUsersMock,
  };

  const dependencies = {
    userPoolId: testValues.validUserPoolId,
    Cognito,
  };

  handler = require('../../../../lambdas/users/getAllUsers/handler')(
    dependencies
  );
});

afterEach(jest.resetAllMocks);

test('Should return a formatted list of users', async () => {
  listUsersMock.mockReturnValue({
    promise: () => {
      return {
        Users: [
          cognitoUserBuilder(
            'user1',
            'sub1',
            'Steward',
            'given1',
            'family1',
            'Attributes'
          ),
          cognitoUserBuilder(
            'user2',
            'sub2',
            'Administrator',
            'given2',
            'family2',
            'Attributes'
          ),
        ],
      };
    },
  });

  const { statusCode, body } = await handler({});

  expect(statusCode).toBe(200);
  expect(body).toBe(
    JSON.stringify([
      {
        username: 'user1',
        sub: 'sub1',
        role: 'Steward',
        givenName: 'given1',
        familyName: 'family1',
      },
      {
        username: 'user2',
        sub: 'sub2',
        role: 'Administrator',
        givenName: 'given2',
        familyName: 'family2',
      },
    ])
  );
  expect(listUsersMock).toBeCalledWith({
    UserPoolId: testValues.validUserPoolId,
  });
  expect(listUsersMock).toBeCalledTimes(1);
});

test('Should return an empty list if no users', async () => {
  listUsersMock.mockReturnValue({
    promise: () => {
      return {
        Users: [],
      };
    },
  });
  const { statusCode, body } = await handler({});

  expect(statusCode).toBe(200);
  expect(body).toBe(JSON.stringify([]));
});

test('Should return 500 if an error is thrown', async () => {
  listUsersMock.mockReturnValue({
    promise: () => {
      throw new MockAWSError('An unknown error.', 'UnknownException');
    },
  });

  const { statusCode, body } = await handler({});

  expect(statusCode).toBe(500);
  expect(body).toBe(
    JSON.stringify({
      message: `Error getting all users - An unknown error.`,
    })
  );
});
