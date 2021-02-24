const { awsUtils, eventUtils, websocketUtils } = require('../../../testUtils');
const { validTableName } = awsUtils.testValues;
const {
  validEventId,
  invalidEventId,
  validAssistanceRequestId,
  invalidAssistanceRequestId,
} = eventUtils.testValues;
const {
  validConnectionTableName,
  assistanceRequestHandledMessageType: websocketMessageType,
  validConnectionId,
} = websocketUtils.testValues;
const { MockAWSError, dynamoQueryResponseBuilder } = awsUtils;

let handler;

const updateMock = jest.fn();
const queryMock = jest.fn();
const deleteMock = jest.fn();
const postToConnectionMock = jest.fn();

beforeEach(() => {
  const Dynamo = {
    update: updateMock,
    query: queryMock,
    delete: deleteMock,
  };

  const ApiGatewayManagementApi = {
    postToConnection: postToConnectionMock,
  };

  const dependencies = {
    Dynamo,
    ApiGatewayManagementApi,
    tableName: validTableName,
    connectionTableName: validConnectionTableName,
  };

  handler = require('../../../../lambdas/events/handleAssistanceRequest/handler')(
    dependencies
  );
});

afterEach(jest.resetAllMocks);

test('Should update handled field when provided with a valid event and no websocket connections', async () => {
  const event = {
    pathParameters: {
      eventId: validEventId,
      assistanceRequestId: validAssistanceRequestId,
    },
  };

  updateMock.mockReturnValue({
    promise: () => {},
  });

  queryMock.mockReturnValue({
    promise: () => {
      return dynamoQueryResponseBuilder([]);
    },
  });

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(200);
  expect(body).toBe(JSON.stringify({ message: 'Assistance Request Handled' }));
  expect(updateMock).toBeCalledTimes(1);
  expect(updateMock).toBeCalledWith({
    TableName: validTableName,
    Key: {
      id: validEventId,
      metadata: `assistanceRequest_${validAssistanceRequestId}`,
    },
    UpdateExpression: 'SET handled = :handled',
    ConditionExpression: 'id = :id and metadata = :metadata',
    ExpressionAttributeValues: {
      ':id': validEventId,
      ':metadata': `assistanceRequest_${validAssistanceRequestId}`,
      ':handled': true,
    },
  });
  expect(queryMock).toBeCalledTimes(1);
  expect(queryMock).toBeCalledWith({
    TableName: validConnectionTableName,
    KeyConditionExpression: 'websocket = :websocket',
    FilterExpression: 'eventId = :eventId',
    ExpressionAttributeValues: {
      ':websocket': 'assistanceRequest',
      ':eventId': validEventId,
    },
  });
  expect(postToConnectionMock).toBeCalledTimes(0);
});

test('Should update handled field when provided with a valid event and post to websocket connections', async () => {
  const event = {
    pathParameters: {
      eventId: validEventId,
      assistanceRequestId: validAssistanceRequestId,
    },
  };

  updateMock.mockReturnValue({
    promise: () => {},
  });

  queryMock.mockReturnValue({
    promise: () => {
      return dynamoQueryResponseBuilder([
        { connectionId: validConnectionId + 1 },
        { connectionId: validConnectionId + 2 },
      ]);
    },
  });

  postToConnectionMock.mockReturnValue({
    promise: () => {
      return {};
    },
  });

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(200);
  expect(body).toBe(JSON.stringify({ message: 'Assistance Request Handled' }));
  expect(updateMock).toBeCalledTimes(1);
  expect(updateMock).toBeCalledWith({
    TableName: validTableName,
    Key: {
      id: validEventId,
      metadata: `assistanceRequest_${validAssistanceRequestId}`,
    },
    UpdateExpression: 'SET handled = :handled',
    ConditionExpression: 'id = :id and metadata = :metadata',
    ExpressionAttributeValues: {
      ':id': validEventId,
      ':metadata': `assistanceRequest_${validAssistanceRequestId}`,
      ':handled': true,
    },
  });
  expect(queryMock).toBeCalledTimes(1);
  expect(queryMock).toBeCalledWith({
    TableName: validConnectionTableName,
    KeyConditionExpression: 'websocket = :websocket',
    FilterExpression: 'eventId = :eventId',
    ExpressionAttributeValues: {
      ':websocket': 'assistanceRequest',
      ':eventId': validEventId,
    },
  });
  expect(postToConnectionMock).toBeCalledWith({
    ConnectionId: validConnectionId + 1,
    Data: JSON.stringify({
      type: websocketMessageType,
      assistanceRequestId: validAssistanceRequestId,
    }),
  });
  expect(postToConnectionMock).toBeCalledWith({
    ConnectionId: validConnectionId + 2,
    Data: JSON.stringify({
      type: websocketMessageType,
      assistanceRequestId: validAssistanceRequestId,
    }),
  });
  expect(postToConnectionMock).toBeCalledTimes(2);
});

test('Should update handled field when provided with a valid event and post to websocket connections and delete stale connection', async () => {
  const event = {
    pathParameters: {
      eventId: validEventId,
      assistanceRequestId: validAssistanceRequestId,
    },
  };

  updateMock.mockReturnValue({
    promise: () => {},
  });

  queryMock.mockReturnValue({
    promise: () => {
      return dynamoQueryResponseBuilder([
        { connectionId: validConnectionId + 1 },
        { connectionId: validConnectionId + 2 },
      ]);
    },
  });

  postToConnectionMock
    .mockReturnValueOnce({
      promise: () => {
        return {};
      },
    })
    .mockImplementationOnce(() => {
      throw new MockAWSError('Error message', 'UnknownException', 410);
    });

  deleteMock.mockReturnValue({
    promise: () => {},
  });

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(200);
  expect(body).toBe(JSON.stringify({ message: 'Assistance Request Handled' }));
  expect(updateMock).toBeCalledTimes(1);
  expect(updateMock).toBeCalledWith({
    TableName: validTableName,
    Key: {
      id: validEventId,
      metadata: `assistanceRequest_${validAssistanceRequestId}`,
    },
    UpdateExpression: 'SET handled = :handled',
    ConditionExpression: 'id = :id and metadata = :metadata',
    ExpressionAttributeValues: {
      ':id': validEventId,
      ':metadata': `assistanceRequest_${validAssistanceRequestId}`,
      ':handled': true,
    },
  });
  expect(queryMock).toBeCalledTimes(1);
  expect(queryMock).toBeCalledWith({
    TableName: validConnectionTableName,
    KeyConditionExpression: 'websocket = :websocket',
    FilterExpression: 'eventId = :eventId',
    ExpressionAttributeValues: {
      ':websocket': 'assistanceRequest',
      ':eventId': validEventId,
    },
  });
  expect(postToConnectionMock).toBeCalledWith({
    ConnectionId: validConnectionId + 1,
    Data: JSON.stringify({
      type: websocketMessageType,
      assistanceRequestId: validAssistanceRequestId,
    }),
  });
  expect(postToConnectionMock).toBeCalledWith({
    ConnectionId: validConnectionId + 2,
    Data: JSON.stringify({
      type: websocketMessageType,
      assistanceRequestId: validAssistanceRequestId,
    }),
  });
  expect(postToConnectionMock).toBeCalledTimes(2);
  expect(deleteMock).toBeCalledTimes(1);
  expect(deleteMock).toBeCalledWith({
    TableName: validConnectionTableName,
    Key: {
      connectionId: validConnectionId + '2',
      websocket: 'assistanceRequest',
    },
  });
});

test('Should return 500 when an unknown error occurs posting to the websocket', async () => {
  const event = {
    pathParameters: {
      eventId: validEventId,
      assistanceRequestId: validAssistanceRequestId,
    },
  };

  updateMock.mockReturnValue({
    promise: () => {},
  });

  queryMock.mockReturnValue({
    promise: () => {
      return dynamoQueryResponseBuilder([
        { connectionId: validConnectionId + 1 },
        { connectionId: validConnectionId + 2 },
      ]);
    },
  });

  postToConnectionMock
    .mockReturnValueOnce({
      promise: () => {
        return {};
      },
    })
    .mockImplementationOnce(() => {
      throw new MockAWSError('Error message', 'UnknownException', 401);
    });

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(500);
  expect(body).toBe(
    JSON.stringify({
      message: 'Error handling assistance request - Error message',
    })
  );
  expect(updateMock).toBeCalledTimes(1);
  expect(updateMock).toBeCalledWith({
    TableName: validTableName,
    Key: {
      id: validEventId,
      metadata: `assistanceRequest_${validAssistanceRequestId}`,
    },
    UpdateExpression: 'SET handled = :handled',
    ConditionExpression: 'id = :id and metadata = :metadata',
    ExpressionAttributeValues: {
      ':id': validEventId,
      ':metadata': `assistanceRequest_${validAssistanceRequestId}`,
      ':handled': true,
    },
  });
  expect(queryMock).toBeCalledTimes(1);
  expect(queryMock).toBeCalledWith({
    TableName: validConnectionTableName,
    KeyConditionExpression: 'websocket = :websocket',
    FilterExpression: 'eventId = :eventId',
    ExpressionAttributeValues: {
      ':websocket': 'assistanceRequest',
      ':eventId': validEventId,
    },
  });
  expect(postToConnectionMock).toBeCalledWith({
    ConnectionId: validConnectionId + 1,
    Data: JSON.stringify({
      type: websocketMessageType,
      assistanceRequestId: validAssistanceRequestId,
    }),
  });
  expect(postToConnectionMock).toBeCalledWith({
    ConnectionId: validConnectionId + 2,
    Data: JSON.stringify({
      type: websocketMessageType,
      assistanceRequestId: validAssistanceRequestId,
    }),
  });
  expect(postToConnectionMock).toBeCalledTimes(2);
  expect(deleteMock).toBeCalledTimes(0);
});

test('Should return 400 when no eventId is provided', async () => {
  const event = {
    pathParameters: {
      assistanceRequestId: validAssistanceRequestId,
    },
  };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(JSON.stringify({ message: 'Event ID must be provided' }));
  expect(updateMock).toBeCalledTimes(0);
});

test('Should return 400 when no assistanceRequestId is provided', async () => {
  const event = {
    pathParameters: {
      eventId: validEventId,
    },
  };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({ message: 'Assistance Request ID must be provided' })
  );
  expect(updateMock).toBeCalledTimes(0);
});

test('Should return 404 when the assistance request cannot be found', async () => {
  const event = {
    pathParameters: {
      eventId: invalidEventId,
      assistanceRequestId: invalidAssistanceRequestId,
    },
  };

  updateMock.mockImplementation(() => {
    throw new MockAWSError(
      'The conditional request failed',
      'ConditionalCheckFailedException'
    );
  });

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(404);
  expect(body).toBe(
    JSON.stringify({ message: 'Assistance Request could not be found' })
  );
  expect(updateMock).toBeCalledTimes(1);
  expect(updateMock).toBeCalledWith({
    TableName: validTableName,
    Key: {
      id: invalidEventId,
      metadata: `assistanceRequest_${invalidAssistanceRequestId}`,
    },
    UpdateExpression: 'SET handled = :handled',
    ConditionExpression: 'id = :id and metadata = :metadata',
    ExpressionAttributeValues: {
      ':id': invalidEventId,
      ':metadata': `assistanceRequest_${invalidAssistanceRequestId}`,
      ':handled': true,
    },
  });
});

test('Should return 500 when another error occurs', async () => {
  const event = {
    pathParameters: {
      eventId: validEventId,
      assistanceRequestId: validAssistanceRequestId,
    },
  };

  updateMock.mockImplementation(() => {
    throw new MockAWSError('Unknown Error', 'UnknownError');
  });

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(500);
  expect(body).toBe(
    JSON.stringify({
      message: 'Error handling assistance request - Unknown Error',
    })
  );
  expect(updateMock).toBeCalledTimes(1);
  expect(updateMock).toBeCalledWith({
    TableName: validTableName,
    Key: {
      id: validEventId,
      metadata: `assistanceRequest_${validAssistanceRequestId}`,
    },
    UpdateExpression: 'SET handled = :handled',
    ConditionExpression: 'id = :id and metadata = :metadata',
    ExpressionAttributeValues: {
      ':id': validEventId,
      ':metadata': `assistanceRequest_${validAssistanceRequestId}`,
      ':handled': true,
    },
  });
});
