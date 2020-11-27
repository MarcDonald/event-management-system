const { awsUtils, eventUtils } = require('../../../testUtils');
const { MockAWSError, dynamoQueryResponseBuilder } = awsUtils;
const { testValues } = eventUtils;
const {
  validTableName,
  validEventId,
  invalidEventId,
  validEventName,
  validStart,
  validEnd,
  invalidEnd,
} = testValues;

let handler;
const updateMock = jest.fn();
const queryMock = jest.fn();

beforeEach(() => {
  const Dynamo = {
    update: updateMock,
    query: queryMock,
  };
  const dependencies = {
    Dynamo,
    tableName: validTableName,
  };

  handler = require('../../../../lambdas/events/updateEventInformation/handler')(
    dependencies
  );
});

afterEach(jest.resetAllMocks);

test('Should update event name, start, and end when all are given', async () => {
  const eventBody = JSON.stringify({
    name: validEventName,
    start: validStart,
    end: validEnd,
  });
  const event = {
    pathParameters: {
      eventId: validEventId,
    },
    body: eventBody,
  };

  updateMock.mockReturnValue({
    promise: () => {
      return {};
    },
  });

  const { statusCode, body } = await handler(event);

  expect(queryMock).toBeCalledTimes(0);
  expect(updateMock).toBeCalledWith({
    TableName: validTableName,
    Key: {
      eventId: validEventId,
      metadata: 'event',
    },
    UpdateExpression: 'set #name = :name, #start = :start, #end = :end',
    ConditionExpression: '#eventId = :eventId',
    ExpressionAttributeNames: {
      '#end': 'end',
      '#eventId': 'eventId',
      '#name': 'name',
      '#start': 'start',
    },
    ExpressionAttributeValues: {
      ':end': validEnd,
      ':eventId': validEventId,
      ':name': validEventName,
      ':start': validStart,
    },
  });
  expect(updateMock).toBeCalledTimes(1);

  expect(statusCode).toBe(200);
  expect(body).toBe(
    JSON.stringify({ message: `Successfully updated ${validEventId}` })
  );
});

test('Should only update event name when only it is given', async () => {
  const eventBody = JSON.stringify({
    name: validEventName,
  });
  const event = {
    pathParameters: {
      eventId: validEventId,
    },
    body: eventBody,
  };

  updateMock.mockReturnValue({
    promise: () => {
      return {};
    },
  });

  const { statusCode, body } = await handler(event);

  expect(updateMock).toBeCalledWith({
    TableName: validTableName,
    Key: {
      eventId: validEventId,
      metadata: 'event',
    },
    UpdateExpression: 'set #name = :name',
    ConditionExpression: '#eventId = :eventId',
    ExpressionAttributeNames: {
      '#eventId': 'eventId',
      '#name': 'name',
    },
    ExpressionAttributeValues: {
      ':eventId': validEventId,
      ':name': validEventName,
    },
  });
  expect(updateMock).toBeCalledTimes(1);
  expect(queryMock).toBeCalledTimes(0);

  expect(statusCode).toBe(200);
  expect(body).toBe(
    JSON.stringify({ message: `Successfully updated ${validEventId}` })
  );
});

test('Should only update event start when only it is given', async () => {
  const eventBody = JSON.stringify({
    start: validStart,
  });
  const event = {
    pathParameters: {
      eventId: validEventId,
    },
    body: eventBody,
  };

  queryMock.mockReturnValue({
    promise: () => {
      return dynamoQueryResponseBuilder([
        {
          eventId: validEventId,
          end: validEnd,
        },
      ]);
    },
  });

  updateMock.mockReturnValue({
    promise: () => {
      return {};
    },
  });

  const { statusCode, body } = await handler(event);

  expect(queryMock).toBeCalledTimes(1);
  expect(updateMock).toBeCalledTimes(1);
  expect(updateMock).toBeCalledWith({
    TableName: validTableName,
    Key: {
      eventId: validEventId,
      metadata: 'event',
    },
    UpdateExpression: 'set #start = :start',
    ConditionExpression: '#eventId = :eventId',
    ExpressionAttributeNames: {
      '#eventId': 'eventId',
      '#start': 'start',
    },
    ExpressionAttributeValues: {
      ':eventId': validEventId,
      ':start': validStart,
    },
  });

  expect(statusCode).toBe(200);
  expect(body).toBe(
    JSON.stringify({ message: `Successfully updated ${validEventId}` })
  );
});

test('Should only update event end when only it is given', async () => {
  const eventBody = JSON.stringify({
    end: validEnd,
  });
  const event = {
    pathParameters: {
      eventId: validEventId,
    },
    body: eventBody,
  };

  queryMock.mockReturnValue({
    promise: () => {
      return dynamoQueryResponseBuilder([
        {
          eventId: validEventId,
          start: validStart,
        },
      ]);
    },
  });

  updateMock.mockReturnValue({
    promise: () => {
      return {};
    },
  });

  const { statusCode, body } = await handler(event);

  expect(queryMock).toBeCalledTimes(1);
  expect(updateMock).toBeCalledTimes(1);
  expect(updateMock).toBeCalledWith({
    TableName: validTableName,
    Key: {
      eventId: validEventId,
      metadata: 'event',
    },
    UpdateExpression: 'set #end = :end',
    ConditionExpression: '#eventId = :eventId',
    ExpressionAttributeNames: {
      '#end': 'end',
      '#eventId': 'eventId',
    },
    ExpressionAttributeValues: {
      ':eventId': validEventId,
      ':end': validEnd,
    },
  });

  expect(statusCode).toBe(200);
  expect(body).toBe(
    JSON.stringify({ message: `Successfully updated ${validEventId}` })
  );
});

test('Should return 400 if event ID is not provided', async () => {
  const event = {
    pathParameters: {},
  };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(JSON.stringify({ message: 'Event ID must be provided' }));
  expect(updateMock).toBeCalledTimes(0);
  expect(queryMock).toBeCalledTimes(0);
});

test('Should return 400 when called with an event with no body', async () => {
  const event = {
    pathParameters: {
      eventId: validEventId,
    },
  };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message: 'Request must contain a body containing a name, start, or end',
    })
  );
  expect(updateMock).toBeCalledTimes(0);
  expect(queryMock).toBeCalledTimes(0);
});

test('Should return 400 when called with an event with an empty body', async () => {
  const event = {
    pathParameters: {
      eventId: validEventId,
    },
    body: '',
  };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message: 'Request must contain a body containing a name, start, or end',
    })
  );
  expect(updateMock).toBeCalledTimes(0);
  expect(queryMock).toBeCalledTimes(0);
});

test('Should return 400 when called with an empty name in the body', async () => {
  const event = {
    pathParameters: {
      eventId: validEventId,
    },
    body: JSON.stringify({ name: '' }),
  };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message: 'Request must contain a body containing a name, start, or end',
    })
  );
  expect(updateMock).toBeCalledTimes(0);
  expect(queryMock).toBeCalledTimes(0);
});

test('Should return 400 when called with a start and an end where the end is before the start', async () => {
  const event = {
    pathParameters: {
      eventId: validEventId,
    },
    body: JSON.stringify({ start: validStart, end: invalidEnd }),
  };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message: 'Event cannot start before it ends',
    })
  );
  expect(updateMock).toBeCalledTimes(0);
  expect(queryMock).toBeCalledTimes(0);
});

test('Should return 400 when called with a start where the end in the DB is after the new start', async () => {
  const event = {
    pathParameters: {
      eventId: validEventId,
    },
    body: JSON.stringify({ start: validStart }),
  };

  queryMock.mockReturnValue({
    promise: () => {
      return dynamoQueryResponseBuilder([
        {
          eventId: validEventId,
          start: 300,
          end: invalidEnd,
        },
      ]);
    },
  });

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message: 'Event cannot end before it starts',
    })
  );
  expect(updateMock).toBeCalledTimes(0);
  expect(queryMock).toBeCalledTimes(1);
  expect(queryMock).toBeCalledWith({
    TableName: validTableName,
    KeyConditionExpression: '#eventId = :eventId and #metadata = :metadata',
    ExpressionAttributeNames: {
      '#metadata': 'metadata',
      '#eventId': 'eventId',
    },
    ExpressionAttributeValues: {
      ':metadata': 'event',
      ':eventId': validEventId,
    },
  });
});

test('Should return 400 when called with an end where start in the DB is before the new end', async () => {
  const event = {
    pathParameters: {
      eventId: validEventId,
    },
    body: JSON.stringify({ end: invalidEnd }),
  };

  queryMock.mockReturnValue({
    promise: () => {
      return dynamoQueryResponseBuilder([
        {
          eventId: validEventId,
          start: validStart,
          end: validEnd,
        },
      ]);
    },
  });

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message: 'Event cannot end before it starts',
    })
  );
  expect(updateMock).toBeCalledTimes(0);
  expect(queryMock).toBeCalledTimes(1);
  expect(queryMock).toBeCalledWith({
    TableName: validTableName,
    KeyConditionExpression: '#eventId = :eventId and #metadata = :metadata',
    ExpressionAttributeNames: {
      '#metadata': 'metadata',
      '#eventId': 'eventId',
    },
    ExpressionAttributeValues: {
      ':metadata': 'event',
      ':eventId': validEventId,
    },
  });
});

test('Should return 404 when event does not exist on query', async () => {
  const event = {
    pathParameters: {
      eventId: invalidEventId,
    },
    body: JSON.stringify({ end: invalidEnd }),
  };

  queryMock.mockReturnValue({
    promise: () => {
      return dynamoQueryResponseBuilder([]);
    },
  });

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(404);
  expect(body).toBe(
    JSON.stringify({
      message: 'Could not find an event with that ID',
    })
  );
  expect(updateMock).toBeCalledTimes(0);
  expect(queryMock).toBeCalledTimes(1);
  expect(queryMock).toBeCalledWith({
    TableName: validTableName,
    KeyConditionExpression: '#eventId = :eventId and #metadata = :metadata',
    ExpressionAttributeNames: {
      '#metadata': 'metadata',
      '#eventId': 'eventId',
    },
    ExpressionAttributeValues: {
      ':metadata': 'event',
      ':eventId': invalidEventId,
    },
  });
});

test('Should return 404 when event does not exist on update', async () => {
  const eventBody = JSON.stringify({
    name: validEventName,
    start: validStart,
    end: validEnd,
  });
  const event = {
    pathParameters: {
      eventId: invalidEventId,
    },
    body: eventBody,
  };

  updateMock.mockImplementation(() => {
    throw new MockAWSError(
      'The conditional request failed',
      'ConditionalCheckFailedException'
    );
  });

  const { statusCode, body } = await handler(event);

  expect(updateMock).toBeCalledWith({
    TableName: validTableName,
    Key: {
      eventId: invalidEventId,
      metadata: 'event',
    },
    UpdateExpression: 'set #name = :name, #start = :start, #end = :end',
    ConditionExpression: '#eventId = :eventId',
    ExpressionAttributeNames: {
      '#end': 'end',
      '#eventId': 'eventId',
      '#name': 'name',
      '#start': 'start',
    },
    ExpressionAttributeValues: {
      ':end': validEnd,
      ':eventId': invalidEventId,
      ':name': validEventName,
      ':start': validStart,
    },
  });
  expect(updateMock).toBeCalledTimes(1);

  expect(statusCode).toBe(404);
  expect(body).toBe(
    JSON.stringify({ message: 'Could not find an event with that ID' })
  );
});

test('Should return 500 when another error is thrown', async () => {
  const eventBody = JSON.stringify({
    name: validEventName,
    start: validStart,
    end: validEnd,
  });
  const event = {
    pathParameters: {
      eventId: validEventId,
    },
    body: eventBody,
  };

  updateMock.mockImplementation(() => {
    throw new MockAWSError('Error message', 'UnknownException');
  });

  const { statusCode, body } = await handler(event);

  expect(updateMock).toBeCalledWith({
    TableName: validTableName,
    Key: {
      eventId: validEventId,
      metadata: 'event',
    },
    UpdateExpression: 'set #name = :name, #start = :start, #end = :end',
    ConditionExpression: '#eventId = :eventId',
    ExpressionAttributeNames: {
      '#end': 'end',
      '#eventId': 'eventId',
      '#name': 'name',
      '#start': 'start',
    },
    ExpressionAttributeValues: {
      ':end': validEnd,
      ':eventId': validEventId,
      ':name': validEventName,
      ':start': validStart,
    },
  });
  expect(updateMock).toBeCalledTimes(1);

  expect(statusCode).toBe(500);
  expect(body).toBe(
    JSON.stringify({
      message: 'Error updating event information - Error message',
    })
  );
});
