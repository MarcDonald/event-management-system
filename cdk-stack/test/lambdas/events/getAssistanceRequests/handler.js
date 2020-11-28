const { awsUtils, eventUtils, venueUtils } = require('../../../testUtils');
const { MockAWSError, dynamoQueryResponseBuilder } = awsUtils;
const {
  validEventId,
  invalidEventId,
  validAssistanceRequestTime,
  validAssistanceRequestMessage,
  validAssistanceRequestId,
} = eventUtils.testValues;
const { validPositionId, validPositionName } = venueUtils.testValues;
const { validTableName, validMetadataIndexName } = awsUtils.testValues;

let handler;
const queryMock = jest.fn();

beforeEach(() => {
  const Dynamo = {
    query: queryMock,
  };

  const dependencies = {
    tableName: validTableName,
    Dynamo,
    metadataIndexName: validMetadataIndexName,
  };

  handler = require('../../../../lambdas/events/getAssistanceRequests/handler')(
    dependencies
  );
});

afterEach(jest.resetAllMocks);

test('Should return formatted assistance requests for event when provided with a valid event ID', async () => {
  queryMock.mockReturnValue({
    promise: () => {
      return dynamoQueryResponseBuilder([
        {
          id: validAssistanceRequestId + '1',
          metadata: `assistanceRequest_${validEventId}`,
          position: {
            positionId: validPositionId,
            name: validPositionName,
          },
          time: validAssistanceRequestTime + 1,
          message: validAssistanceRequestMessage + '1',
        },
        {
          id: validAssistanceRequestId,
          metadata: `assistanceRequest_${validEventId}`,
          position: {
            positionId: validPositionId,
            name: validPositionName,
          },
          time: validAssistanceRequestTime,
          message: validAssistanceRequestMessage,
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
    IndexName: validMetadataIndexName,
    KeyConditionExpression: 'metadata = :metadata',
    ExpressionAttributeValues: {
      ':metadata': `assistanceRequest_${validEventId}`,
    },
  });
  expect(queryMock).toBeCalledTimes(1);
  expect(statusCode).toBe(200);
  expect(body).toBe(
    JSON.stringify([
      {
        assistanceRequestId: validAssistanceRequestId + '1',
        position: {
          positionId: validPositionId,
          name: validPositionName,
        },
        message: validAssistanceRequestMessage + '1',
        time: validAssistanceRequestTime + 1,
      },
      {
        assistanceRequestId: validAssistanceRequestId,
        position: {
          positionId: validPositionId,
          name: validPositionName,
        },
        message: validAssistanceRequestMessage,
        time: validAssistanceRequestTime,
      },
    ])
  );
});

test('Should return 400 if a event ID is not provided', async () => {
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
      message: `Error getting assistance requests for event '${invalidEventId}' - The error message.`,
    })
  );
});
