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
  validStatusUpdateTime,
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

beforeEach(() => {
  const Dynamo = {
    query: queryMock,
  };

  const dependencies = {
    tableName: validTableName,
    Dynamo,
  };

  handler = require('../../../../lambdas/events/getEventVenueStatus/handler')(
    dependencies
  );
});

afterEach(jest.resetAllMocks);

test('Should return most recent venue status when provided with a valid event ID', async () => {
  queryMock.mockReturnValue({
    promise: () => {
      return dynamoQueryResponseBuilder([
        {
          id: validEventId,
          metadata: `statusUpdate_${validStatusUpdateTime}`,
          venueStatus: 'High',
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
    KeyConditionExpression:
      'id = :eventId and begins_with(metadata, :metadata)',
    ExpressionAttributeValues: {
      ':eventId': validEventId,
      ':metadata': 'statusUpdate',
    },
    ScanIndexForward: false,
    Limit: 1,
  });
  expect(queryMock).toBeCalledTimes(1);
  expect(statusCode).toBe(200);
  expect(body).toBe(
    JSON.stringify({
      venueStatus: 'High',
    })
  );
});

test('Should return default venue status when provided with a valid event ID and there are no status updates', async () => {
  queryMock.mockReturnValue({
    promise: () => {
      return dynamoQueryResponseBuilder([]);
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
    KeyConditionExpression:
      'id = :eventId and begins_with(metadata, :metadata)',
    ExpressionAttributeValues: {
      ':eventId': validEventId,
      ':metadata': 'statusUpdate',
    },
    ScanIndexForward: false,
    Limit: 1,
  });
  expect(queryMock).toBeCalledTimes(1);
  expect(statusCode).toBe(200);
  expect(body).toBe(
    JSON.stringify({
      venueStatus: 'Low',
    })
  );
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
      message: `Error getting event venue status of ${invalidEventId} - The error message.`,
    })
  );
});
