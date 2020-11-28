const {
  awsUtils,
  eventUtils,
  venueUtils,
  staffUtils,
} = require('../../../testUtils');
const { MockAWSError, dynamoQueryResponseBuilder } = awsUtils;
const {
  validTableName,
  validAreaOfSupervision,
  validStart,
  validEnd,
  validEventId,
  invalidEventId,
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

let handler;
const queryMock = jest.fn();

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
    tableName: validTableName,
    Dynamo,
  };

  handler = require('../../../../lambdas/events/getEventInformation/handler')(
    dependencies
  );
});

afterEach(jest.resetAllMocks);

test('Should return formatted event object when provided with a valid event ID', async () => {
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

  const event = {
    pathParameters: {
      eventId: validEventId,
    },
  };

  const { statusCode, body } = await handler(event);

  expect(queryMock).toBeCalledWith({
    TableName: validTableName,
    KeyConditionExpression: 'id = :eventId and metadata = :metadata',
    ExpressionAttributeValues: {
      ':eventId': validEventId,
      ':metadata': 'event',
    },
    Limit: 1,
  });
  expect(queryMock).toBeCalledTimes(1);
  expect(statusCode).toBe(200);
  expect(body).toBe(
    JSON.stringify({
      eventId: 'uuid',
      venue: validVenue,
      start: validStart,
      end: validEnd,
      supervisors: validSupervisors,
      staff: validStaff,
    })
  );
});

test('Should return 404 if the event cannot be found', async () => {
  queryMock.mockReturnValue({
    promise: () => {
      return dynamoQueryResponseBuilder([]);
    },
  });

  const event = {
    pathParameters: {
      eventId: invalidEventId,
    },
  };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(404);
  expect(body).toBe(
    JSON.stringify({ message: 'Event with that ID could not be found' })
  );
  expect(queryMock).toBeCalledTimes(1);
});

test('Should return 400 if an event ID is not provided', async () => {
  const event = {
    pathParameters: {},
  };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(JSON.stringify({ message: 'Event ID must be provided' }));
  expect(queryMock).toBeCalledTimes(0);
});

test('Should return 500 if another error is thrown', async () => {
  queryMock.mockImplementation(() => {
    throw new MockAWSError('The error message.', 'AnotherError');
  });

  const event = {
    pathParameters: {
      eventId: invalidEventId,
    },
  };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(500);
  expect(body).toBe(
    JSON.stringify({
      message: `Error getting event information ${invalidEventId} - The error message.`,
    })
  );
});
