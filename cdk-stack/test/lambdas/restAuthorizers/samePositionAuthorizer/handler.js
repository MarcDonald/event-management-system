const {
  staffUtils,
  eventUtils,
  awsUtils,
  venueUtils,
} = require('../../../testUtils');
const {
  validEventId,
  validStart,
  validEnd,
  validAreaOfSupervision,
} = eventUtils.testValues;
const {
  validPositionId,
  validPositionName,
  validVenueId,
  validVenueName,
} = venueUtils.testValues;
const {
  validSub,
  validRole,
  validGivenName,
  validFamilyName,
} = staffUtils.testValues;
const { dynamoQueryResponseBuilder } = awsUtils;
const { validTableName } = awsUtils.testValues;

let handler;

const verifyMock = jest.fn();
const getPublicKeysMock = jest.fn();
const queryMock = jest.fn();

const validJwt =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImFraWQifQ.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.ZU4lgDuP5fNWV-HrRMu58wffnJLzeJ65TcjJmrm51HI';
const validUsername = 'iamauser';

const validVenue = {
  name: validVenueName,
  venueId: validVenueId,
  positions: [
    {
      positionId: validPositionId + '1',
      name: validPositionName + '1',
    },
    {
      positionId: validPositionId + '2',
      name: validPositionName + '2',
    },
  ],
};

const validSupervisors = [
  {
    staffMember: {
      username: validUsername + '1',
      sub: validSub + '1',
      role: validRole + '1',
      givenName: validGivenName + '1',
      familyName: validFamilyName + '1',
    },
    areaOfSupervision: validAreaOfSupervision,
  },
];

const validStaff = [
  {
    staffMember: {
      username: validUsername + '2',
      sub: validSub + '2',
      role: validRole + '2',
      givenName: validGivenName + '2',
      familyName: validFamilyName + '2',
    },
    position: {
      positionId: validPositionId + '1',
      name: validPositionName + '1',
    },
  },
];

beforeEach(() => {
  const Dynamo = {
    query: queryMock,
  };

  const dependencies = {
    verify: verifyMock,
    getPublicKeys: getPublicKeysMock,
    Dynamo,
    tableName: validTableName,
  };
  handler = require('../../../../lambdas/restAuthorizers/samePositionAuthorizer/handler')(
    dependencies
  );
});

afterEach(jest.resetAllMocks);

test('Should return 401 when no eventId provided', async () => {
  const event = {
    pathParameters: {
      positionId: validPositionId,
    },
    identitySource: [],
  };

  const { statusCode, isAuthorized } = await handler(event);

  expect(statusCode).toBe(401);
  expect(isAuthorized).toBe(false);
  expect(getPublicKeysMock).toBeCalledTimes(0);
  expect(verifyMock).toBeCalledTimes(0);
  expect(queryMock).toBeCalledTimes(0);
});

test('Should return 401 when no positionId provided', async () => {
  const event = {
    pathParameters: {
      eventId: validEventId,
    },
    identitySource: [],
  };

  const { statusCode, isAuthorized } = await handler(event);

  expect(statusCode).toBe(401);
  expect(isAuthorized).toBe(false);
  expect(getPublicKeysMock).toBeCalledTimes(0);
  expect(verifyMock).toBeCalledTimes(0);
  expect(queryMock).toBeCalledTimes(0);
});

test('Should return 401 when no token provided', async () => {
  const event = {
    pathParameters: {
      eventId: validEventId,
      positionId: validPositionId,
    },
    identitySource: [],
  };

  const { statusCode, isAuthorized } = await handler(event);

  expect(statusCode).toBe(401);
  expect(isAuthorized).toBe(false);
  expect(getPublicKeysMock).toBeCalledTimes(0);
  expect(verifyMock).toBeCalledTimes(0);
  expect(queryMock).toBeCalledTimes(0);
});

test('Should return 401 when token has 1 section', async () => {
  const event = {
    pathParameters: {
      eventId: validEventId,
      positionId: validPositionId,
    },
    identitySource: ['abc'],
  };

  const { statusCode, isAuthorized } = await handler(event);

  expect(statusCode).toBe(401);
  expect(isAuthorized).toBe(false);
  expect(getPublicKeysMock).toBeCalledTimes(0);
  expect(verifyMock).toBeCalledTimes(0);
  expect(queryMock).toBeCalledTimes(0);
});

test('Should return 401 if the kid is undefined', async () => {
  const event = {
    pathParameters: {
      eventId: validEventId,
      positionId: validPositionId,
    },
    // This JWT has no KID
    identitySource: [
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    ],
  };

  const { statusCode, isAuthorized } = await handler(event);

  expect(statusCode).toBe(401);
  expect(isAuthorized).toBe(false);
  expect(getPublicKeysMock).toBeCalledTimes(0);
  expect(verifyMock).toBeCalledTimes(0);
  expect(queryMock).toBeCalledTimes(0);
});

test('Should return 401 when the KID is not included in the keys', async () => {
  const event = {
    pathParameters: {
      eventId: validEventId,
      positionId: validPositionId,
    },
    identitySource: [validJwt],
  };

  getPublicKeysMock.mockReturnValue({
    anotherkid: 'validkid',
  });

  const { statusCode, isAuthorized } = await handler(event);

  expect(statusCode).toBe(401);
  expect(isAuthorized).toBe(false);
  expect(getPublicKeysMock).toBeCalledTimes(1);
  expect(verifyMock).toBeCalledTimes(0);
  expect(queryMock).toBeCalledTimes(0);
});

test('Should return 401 when an error occurs getting keys', async () => {
  const event = {
    pathParameters: {
      eventId: validEventId,
      positionId: validPositionId,
    },
    identitySource: [validJwt],
  };

  getPublicKeysMock.mockImplementation(() => {
    throw new Error('Error getting keys');
  });

  const { statusCode, isAuthorized } = await handler(event);

  expect(statusCode).toBe(401);
  expect(isAuthorized).toBe(false);
  expect(getPublicKeysMock).toBeCalledTimes(1);
  expect(verifyMock).toBeCalledTimes(0);
  expect(queryMock).toBeCalledTimes(0);
});

test('Should return 401 when an error occurs verifying token', async () => {
  const event = {
    pathParameters: {
      eventId: validEventId,
      positionId: validPositionId,
    },
    identitySource: [validJwt],
  };

  getPublicKeysMock.mockReturnValue({
    akid: 'validkid',
  });

  verifyMock.mockImplementation(() => {
    throw new Error('Token is invalid');
  });

  const { statusCode, isAuthorized } = await handler(event);

  expect(statusCode).toBe(401);
  expect(isAuthorized).toBe(false);
  expect(getPublicKeysMock).toBeCalledTimes(1);
  expect(verifyMock).toBeCalledTimes(1);
  expect(queryMock).toBeCalledTimes(0);
});

test('Should return 401 when token does not contain a cognito:username', async () => {
  const event = {
    pathParameters: {
      eventId: validEventId,
      positionId: validPositionId,
    },
    identitySource: [validJwt],
  };

  getPublicKeysMock.mockReturnValue({
    akid: 'validkid',
  });

  verifyMock.mockReturnValue({
    notthethingwewant: 'something',
  });

  const { statusCode, isAuthorized } = await handler(event);

  expect(statusCode).toBe(401);
  expect(isAuthorized).toBe(false);
  expect(getPublicKeysMock).toBeCalledTimes(1);
  expect(verifyMock).toBeCalledTimes(1);
  expect(queryMock).toBeCalledTimes(0);
});

test('Should return 401 when the event cannot be found in the table', async () => {
  const event = {
    pathParameters: {
      eventId: validEventId,
      positionId: validPositionId,
    },
    identitySource: [validJwt],
  };

  getPublicKeysMock.mockReturnValue({
    akid: 'validkid',
  });

  verifyMock.mockReturnValue({
    'cognito:username': validUsername,
  });

  queryMock.mockReturnValue({
    promise: () => {
      return dynamoQueryResponseBuilder([]);
    },
  });

  const { statusCode, isAuthorized } = await handler(event);

  expect(statusCode).toBe(401);
  expect(isAuthorized).toBe(false);
  expect(getPublicKeysMock).toBeCalledTimes(1);
  expect(verifyMock).toBeCalledTimes(1);
  expect(queryMock).toBeCalledTimes(1);
  expect(queryMock).toBeCalledWith({
    TableName: validTableName,
    KeyConditionExpression: 'id = :eventId and metadata = :metadata',
    ExpressionAttributeValues: {
      ':eventId': validEventId,
      ':metadata': 'event',
    },
    Limit: 1,
  });
});

test('Should return 401 when position cannot be found', async () => {
  const event = {
    pathParameters: {
      eventId: validEventId,
      positionId: validPositionId,
    },
    identitySource: [validJwt],
  };

  getPublicKeysMock.mockReturnValue({
    akid: 'validkid',
  });

  verifyMock.mockReturnValue({
    'cognito:username': validUsername,
  });

  queryMock.mockReturnValue({
    promise: () => {
      return dynamoQueryResponseBuilder([
        {
          id: validEventId,
          metadata: 'event',
          venue: validVenue,
          start: validStart,
          end: validEnd,
          supervisors: validSupervisors,
          staff: [
            {
              staffMember: {
                username: validUsername,
                sub: validSub + '2',
                role: validRole + '2',
                givenName: validGivenName + '2',
                familyName: validFamilyName + '2',
              },
              position: {
                positionId: validPositionId + '2',
                name: validPositionName + '1',
              },
            },
            {
              staffMember: {
                username: validUsername + '2',
                sub: validSub + '2',
                role: validRole + '2',
                givenName: validGivenName + '2',
                familyName: validFamilyName + '2',
              },
              position: {
                positionId: validPositionId + '1',
                name: validPositionName + '1',
              },
            },
          ],
        },
      ]);
    },
  });

  const { statusCode, isAuthorized } = await handler(event);

  expect(statusCode).toBe(401);
  expect(isAuthorized).toBe(false);
  expect(getPublicKeysMock).toBeCalledTimes(1);
  expect(verifyMock).toBeCalledTimes(1);
  expect(queryMock).toBeCalledTimes(1);
  expect(queryMock).toBeCalledWith({
    TableName: validTableName,
    KeyConditionExpression: 'id = :eventId and metadata = :metadata',
    ExpressionAttributeValues: {
      ':eventId': validEventId,
      ':metadata': 'event',
    },
    Limit: 1,
  });
});

test('Should return 401 when user is not assigned to the requested position', async () => {
  const event = {
    pathParameters: {
      eventId: validEventId,
      positionId: validPositionId,
    },
    identitySource: [validJwt],
  };

  getPublicKeysMock.mockReturnValue({
    akid: 'validkid',
  });

  verifyMock.mockReturnValue({
    'cognito:username': validUsername,
  });

  queryMock.mockReturnValue({
    promise: () => {
      return dynamoQueryResponseBuilder([
        {
          id: validEventId,
          metadata: 'event',
          venue: validVenue,
          start: validStart,
          end: validEnd,
          supervisors: validSupervisors,
          staff: [
            {
              staffMember: {
                username: validUsername + '1',
                sub: validSub + '1',
                role: validRole + '1',
                givenName: validGivenName + '1',
                familyName: validFamilyName + '1',
              },
              position: {
                positionId: validPositionId,
                name: validPositionName,
              },
            },
            {
              staffMember: {
                username: validUsername + '2',
                sub: validSub + '2',
                role: validRole + '2',
                givenName: validGivenName + '2',
                familyName: validFamilyName + '2',
              },
              position: {
                positionId: validPositionId + '1',
                name: validPositionName + '1',
              },
            },
          ],
        },
      ]);
    },
  });

  const { statusCode, isAuthorized } = await handler(event);

  expect(statusCode).toBe(401);
  expect(isAuthorized).toBe(false);
  expect(getPublicKeysMock).toBeCalledTimes(1);
  expect(verifyMock).toBeCalledTimes(1);
  expect(queryMock).toBeCalledTimes(1);
  expect(queryMock).toBeCalledWith({
    TableName: validTableName,
    KeyConditionExpression: 'id = :eventId and metadata = :metadata',
    ExpressionAttributeValues: {
      ':eventId': validEventId,
      ':metadata': 'event',
    },
    Limit: 1,
  });
});

test('Should return 200 when user is only user to be assigned to the requested position', async () => {
  const event = {
    pathParameters: {
      eventId: validEventId,
      positionId: validPositionId,
    },
    identitySource: [validJwt],
  };

  getPublicKeysMock.mockReturnValue({
    akid: 'validkid',
  });

  verifyMock.mockReturnValue({
    'cognito:username': validUsername,
  });

  queryMock.mockReturnValue({
    promise: () => {
      return dynamoQueryResponseBuilder([
        {
          id: validEventId,
          metadata: 'event',
          venue: validVenue,
          start: validStart,
          end: validEnd,
          supervisors: validSupervisors,
          staff: [
            {
              staffMember: {
                username: validUsername,
                sub: validSub + '2',
                role: validRole + '2',
                givenName: validGivenName + '2',
                familyName: validFamilyName + '2',
              },
              position: {
                positionId: validPositionId,
                name: validPositionName + '1',
              },
            },
            {
              staffMember: {
                username: validUsername + '2',
                sub: validSub + '2',
                role: validRole + '2',
                givenName: validGivenName + '2',
                familyName: validFamilyName + '2',
              },
              position: {
                positionId: validPositionId + '1',
                name: validPositionName + '1',
              },
            },
          ],
        },
      ]);
    },
  });

  const { statusCode, isAuthorized } = await handler(event);

  expect(statusCode).toBe(200);
  expect(isAuthorized).toBe(true);
  expect(getPublicKeysMock).toBeCalledTimes(1);
  expect(verifyMock).toBeCalledTimes(1);
  expect(queryMock).toBeCalledTimes(1);
  expect(queryMock).toBeCalledWith({
    TableName: validTableName,
    KeyConditionExpression: 'id = :eventId and metadata = :metadata',
    ExpressionAttributeValues: {
      ':eventId': validEventId,
      ':metadata': 'event',
    },
    Limit: 1,
  });
});

test('Should return 200 when user is one of multiple assigned to the requested position', async () => {
  const event = {
    pathParameters: {
      eventId: validEventId,
      positionId: validPositionId,
    },
    identitySource: [validJwt],
  };

  getPublicKeysMock.mockReturnValue({
    akid: 'validkid',
  });

  verifyMock.mockReturnValue({
    'cognito:username': validUsername,
  });

  queryMock.mockReturnValue({
    promise: () => {
      return dynamoQueryResponseBuilder([
        {
          id: validEventId,
          metadata: 'event',
          venue: validVenue,
          start: validStart,
          end: validEnd,
          supervisors: validSupervisors,
          staff: [
            {
              staffMember: {
                username: validUsername,
                sub: validSub + '2',
                role: validRole + '2',
                givenName: validGivenName + '2',
                familyName: validFamilyName + '2',
              },
              position: {
                positionId: validPositionId,
                name: validPositionName + '1',
              },
            },
            {
              staffMember: {
                username: validUsername + '1',
                sub: validSub + '1',
                role: validRole + '1',
                givenName: validGivenName + '1',
                familyName: validFamilyName + '1',
              },
              position: {
                positionId: validPositionId,
                name: validPositionName + '1',
              },
            },
            {
              staffMember: {
                username: validUsername + '2',
                sub: validSub + '2',
                role: validRole + '2',
                givenName: validGivenName + '2',
                familyName: validFamilyName + '2',
              },
              position: {
                positionId: validPositionId + '1',
                name: validPositionName + '1',
              },
            },
          ],
        },
      ]);
    },
  });

  const { statusCode, isAuthorized } = await handler(event);

  expect(statusCode).toBe(200);
  expect(isAuthorized).toBe(true);
  expect(getPublicKeysMock).toBeCalledTimes(1);
  expect(verifyMock).toBeCalledTimes(1);
  expect(queryMock).toBeCalledTimes(1);
  expect(queryMock).toBeCalledWith({
    TableName: validTableName,
    KeyConditionExpression: 'id = :eventId and metadata = :metadata',
    ExpressionAttributeValues: {
      ':eventId': validEventId,
      ':metadata': 'event',
    },
    Limit: 1,
  });
});
