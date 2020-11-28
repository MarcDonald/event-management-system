const {
  awsUtils,
  eventUtils,
  venueUtils,
  staffUtils,
} = require('../../../testUtils');
const {
  validTableName,
  validAreaOfSupervision,
  validStart,
  validEnd,
} = eventUtils.testValues;
const {
  validVenueName,
  validVenueId,
  validPositionId,
  validPositionName,
} = venueUtils;
const {
  validUsername,
  validSub,
  validRole,
  validGivenName,
  validFamilyName,
} = staffUtils;
const { validMetadataIndexName } = awsUtils.testValues;
const { MockAWSError, dynamoQueryResponseBuilder } = awsUtils;

let handler;
const queryMock = jest.fn();
const getCurrentDayMidnightMock = jest.fn();

const mockCurrentTime = 100;

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
  getCurrentDayMidnightMock.mockReturnValue(mockCurrentTime);

  const Dynamo = {
    query: queryMock,
  };

  const dependencies = {
    Dynamo,
    tableName: validTableName,
    metadataIndexName: validMetadataIndexName,
    getCurrentDayMidnight: getCurrentDayMidnightMock,
  };

  handler = require('../../../../lambdas/events/getUpcomingEvents/handler')(
    dependencies
  );
});

afterEach(jest.resetAllMocks);

test('Should return a formatted list of upcoming events with default count', async () => {
  const event = {};

  queryMock.mockReturnValue({
    promise: () => {
      return dynamoQueryResponseBuilder([
        {
          id: 'uuid',
          metadata: 'event',
          venue: validVenue,
          start: validStart,
          end: validEnd,
          supervisors: validSupervisors,
          staff: validStaff,
        },
      ]);
    },
  });

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(200);
  expect(body).toBe(
    JSON.stringify([
      {
        eventId: 'uuid',
        venue: validVenue,
        start: validStart,
        end: validEnd,
        supervisors: validSupervisors,
        staff: validStaff,
      },
    ])
  );
  expect(queryMock).toBeCalledWith({
    TableName: validTableName,
    IndexName: validMetadataIndexName,
    KeyConditionExpression: 'metadata = :metadata',
    FilterExpression: '#start >= :now or :now between #start and #end',
    ExpressionAttributeNames: {
      '#start': 'start',
      '#end': 'end',
    },
    ExpressionAttributeValues: {
      ':metadata': 'event',
      ':now': mockCurrentTime,
    },
    Limit: 5,
  });
  expect(queryMock).toBeCalledTimes(1);
});

test('Should return a formatted list of upcoming events with valid custom count', async () => {
  const event = {
    query: {
      count: 7,
    },
  };

  queryMock.mockReturnValue({
    promise: () => {
      return dynamoQueryResponseBuilder([
        {
          id: 'uuid',
          metadata: 'event',
          venue: validVenue,
          start: validStart,
          end: validEnd,
          supervisors: validSupervisors,
          staff: validStaff,
        },
      ]);
    },
  });

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(200);
  expect(body).toBe(
    JSON.stringify([
      {
        eventId: 'uuid',
        venue: validVenue,
        start: validStart,
        end: validEnd,
        supervisors: validSupervisors,
        staff: validStaff,
      },
    ])
  );
  expect(queryMock).toBeCalledWith({
    TableName: validTableName,
    IndexName: validMetadataIndexName,
    KeyConditionExpression: 'metadata = :metadata',
    FilterExpression: '#start >= :now or :now between #start and #end',
    ExpressionAttributeNames: {
      '#start': 'start',
      '#end': 'end',
    },
    ExpressionAttributeValues: {
      ':metadata': 'event',
      ':now': mockCurrentTime,
    },
    Limit: 7,
  });
  expect(queryMock).toBeCalledTimes(1);
});

test('Should return a formatted list of upcoming events with invalid custom count - string', async () => {
  const event = {
    query: {
      count: 'something',
    },
  };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message:
        'Count query parameter must be a number greater than 0 and less than 10',
    })
  );
  expect(queryMock).toBeCalledTimes(0);
});

test('Should return a formatted list of upcoming events with invalid custom count - greater than 10', async () => {
  const event = {
    query: {
      count: 11,
    },
  };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message:
        'Count query parameter must be a number greater than 0 and less than 10',
    })
  );
  expect(queryMock).toBeCalledTimes(0);
});

test('Should return a formatted list of upcoming events with invalid custom count - less than 0', async () => {
  const event = {
    query: {
      count: -1,
    },
  };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message:
        'Count query parameter must be a number greater than 0 and less than 10',
    })
  );
  expect(queryMock).toBeCalledTimes(0);
});

test('Should return an empty list if no events', async () => {
  const event = {
    query: {},
  };

  queryMock.mockReturnValue({
    promise: () => {
      return dynamoQueryResponseBuilder([]);
    },
  });
  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(200);
  expect(queryMock).toBeCalledWith({
    TableName: validTableName,
    IndexName: validMetadataIndexName,
    KeyConditionExpression: 'metadata = :metadata',
    FilterExpression: '#start >= :now or :now between #start and #end',
    ExpressionAttributeNames: {
      '#start': 'start',
      '#end': 'end',
    },
    ExpressionAttributeValues: {
      ':metadata': 'event',
      ':now': mockCurrentTime,
    },
    Limit: 5,
  });
  expect(queryMock).toBeCalledTimes(1);
  expect(body).toBe(JSON.stringify([]));
});

test('Should return 500 if an error is thrown', async () => {
  const event = {
    query: {},
  };

  queryMock.mockReturnValue({
    promise: () => {
      throw new MockAWSError('An unknown error.', 'UnknownException');
    },
  });

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(500);
  expect(body).toBe(
    JSON.stringify({
      message: `Error getting upcoming events - An unknown error.`,
    })
  );
  expect(queryMock).toBeCalledWith({
    TableName: validTableName,
    IndexName: validMetadataIndexName,
    KeyConditionExpression: 'metadata = :metadata',
    FilterExpression: '#start >= :now or :now between #start and #end',
    ExpressionAttributeNames: {
      '#start': 'start',
      '#end': 'end',
    },
    ExpressionAttributeValues: {
      ':metadata': 'event',
      ':now': mockCurrentTime,
    },
    Limit: 5,
  });
  expect(queryMock).toBeCalledTimes(1);
});
