const {
  awsUtils,
  venueUtils,
  eventUtils,
  websocketUtils,
} = require('../../../testUtils');
const { validPositionId, validPositionName } = venueUtils.testValues;
const {
  validEventId,
  validAssistanceRequestMessage,
  validAssistanceRequestTime,
} = eventUtils.testValues;
const { MockAWSError } = awsUtils;
const { validTableName } = awsUtils.testValues;
const {
  validConnectionId,
  validConnectionTableName,
} = websocketUtils.testValues;

let handler;
const putMock = jest.fn();
const generateUUIDMock = jest.fn();
const getCurrentTimeMock = jest.fn();
const queryMock = jest.fn();
const postToConnectionMock = jest.fn();
const deleteMock = jest.fn();

beforeEach(() => {
  getCurrentTimeMock.mockReturnValue(validAssistanceRequestTime);

  const Dynamo = {
    put: putMock,
    query: queryMock,
    delete: deleteMock,
  };

  const ApiGatewayManagementApi = {
    postToConnection: postToConnectionMock,
  };

  const dependencies = {
    Dynamo,
    ApiGatewayManagementApi,
    generateUUID: generateUUIDMock,
    tableName: validTableName,
    connectionTableName: validConnectionTableName,
    getCurrentTime: getCurrentTimeMock,
  };

  handler = require('../../../../lambdas/events/addAssistanceRequest/handler')(
    dependencies
  );
});

afterEach(jest.resetAllMocks);

test('Should add assistance request and return information when provided with a valid event and no websocket connections', async () => {
  const eventBody = JSON.stringify({
    position: {
      positionId: validPositionId,
      name: validPositionName,
    },
    message: validAssistanceRequestMessage,
  });

  const event = {
    pathParameters: {
      eventId: validEventId,
    },
    body: eventBody,
  };

  putMock.mockReturnValue({
    promise: () => {},
  });

  queryMock.mockReturnValue({
    promise: () => {
      return { Items: [] };
    },
  });

  generateUUIDMock.mockReturnValue('uuid');

  const { statusCode, body } = await handler(event);

  expect(generateUUIDMock).toBeCalledTimes(1);
  expect(putMock).toBeCalledWith({
    TableName: validTableName,
    Item: {
      id: validEventId,
      metadata: `assistanceRequest_uuid`,
      position: {
        positionId: validPositionId,
        name: validPositionName,
      },
      time: validAssistanceRequestTime,
      message: validAssistanceRequestMessage,
    },
  });
  expect(putMock).toBeCalledTimes(1);

  expect(queryMock).toBeCalledWith({
    TableName: validConnectionTableName,
    KeyConditionExpression: 'websocket = :websocket',
    FilterExpression: 'eventId = :eventId',
    ExpressionAttributeValues: {
      ':websocket': 'assistanceRequest',
      ':eventId': validEventId,
    },
  });
  expect(queryMock).toBeCalledTimes(1);

  expect(postToConnectionMock).toBeCalledTimes(0);

  expect(statusCode).toBe(201);
  expect(body).toBe(
    JSON.stringify({
      assistanceRequestId: 'uuid',
      position: {
        positionId: validPositionId,
        name: validPositionName,
      },
      message: validAssistanceRequestMessage,
      time: validAssistanceRequestTime,
    })
  );
});

test('Should add assistance request, post to websocket, and return information when provided with a valid event and websocket connections', async () => {
  const eventBody = JSON.stringify({
    position: {
      positionId: validPositionId,
      name: validPositionName,
    },
    message: validAssistanceRequestMessage,
  });

  const event = {
    pathParameters: {
      eventId: validEventId,
    },
    body: eventBody,
  };

  putMock.mockReturnValue({
    promise: () => {},
  });

  queryMock.mockReturnValue({
    promise: () => {
      return {
        Items: [
          { connectionId: validConnectionId + 1 },
          { connectionId: validConnectionId + 2 },
        ],
      };
    },
  });

  postToConnectionMock.mockReturnValue({
    promise: () => {
      return {};
    },
  });

  generateUUIDMock.mockReturnValue('uuid');

  const { statusCode, body } = await handler(event);

  expect(generateUUIDMock).toBeCalledTimes(1);
  expect(putMock).toBeCalledWith({
    TableName: validTableName,
    Item: {
      id: validEventId,
      metadata: `assistanceRequest_uuid`,
      position: {
        positionId: validPositionId,
        name: validPositionName,
      },
      time: validAssistanceRequestTime,
      message: validAssistanceRequestMessage,
    },
  });
  expect(putMock).toBeCalledTimes(1);

  expect(queryMock).toBeCalledWith({
    TableName: validConnectionTableName,
    KeyConditionExpression: 'websocket = :websocket',
    FilterExpression: 'eventId = :eventId',
    ExpressionAttributeValues: {
      ':websocket': 'assistanceRequest',
      ':eventId': validEventId,
    },
  });
  expect(queryMock).toBeCalledTimes(1);

  expect(postToConnectionMock).toBeCalledWith({
    ConnectionId: validConnectionId + 1,
    Data: JSON.stringify({
      assistanceRequestId: 'uuid',
      time: validAssistanceRequestTime,
      position: {
        positionId: validPositionId,
        name: validPositionName,
      },
      message: validAssistanceRequestMessage,
    }),
  });
  expect(postToConnectionMock).toBeCalledWith({
    ConnectionId: validConnectionId + 2,
    Data: JSON.stringify({
      assistanceRequestId: 'uuid',
      time: validAssistanceRequestTime,
      position: {
        positionId: validPositionId,
        name: validPositionName,
      },
      message: validAssistanceRequestMessage,
    }),
  });
  expect(postToConnectionMock).toBeCalledTimes(2);

  expect(statusCode).toBe(201);
  expect(body).toBe(
    JSON.stringify({
      assistanceRequestId: 'uuid',
      position: {
        positionId: validPositionId,
        name: validPositionName,
      },
      message: validAssistanceRequestMessage,
      time: validAssistanceRequestTime,
    })
  );
});

test('Should add assistance request, post to websocket, delete stale connection, and return information when provided with a valid event and websocket connections with stale connection', async () => {
  const eventBody = JSON.stringify({
    position: {
      positionId: validPositionId,
      name: validPositionName,
    },
    message: validAssistanceRequestMessage,
  });

  const event = {
    pathParameters: {
      eventId: validEventId,
    },
    body: eventBody,
  };

  putMock.mockReturnValue({
    promise: () => {},
  });

  queryMock.mockReturnValue({
    promise: () => {
      return {
        Items: [
          { connectionId: validConnectionId + 1 },
          { connectionId: validConnectionId + 2 },
        ],
      };
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

  generateUUIDMock.mockReturnValue('uuid');

  const { statusCode, body } = await handler(event);

  expect(generateUUIDMock).toBeCalledTimes(1);
  expect(putMock).toBeCalledWith({
    TableName: validTableName,
    Item: {
      id: validEventId,
      metadata: `assistanceRequest_uuid`,
      position: {
        positionId: validPositionId,
        name: validPositionName,
      },
      time: validAssistanceRequestTime,
      message: validAssistanceRequestMessage,
    },
  });
  expect(putMock).toBeCalledTimes(1);

  expect(queryMock).toBeCalledWith({
    TableName: validConnectionTableName,
    KeyConditionExpression: 'websocket = :websocket',
    FilterExpression: 'eventId = :eventId',
    ExpressionAttributeValues: {
      ':websocket': 'assistanceRequest',
      ':eventId': validEventId,
    },
  });
  expect(queryMock).toBeCalledTimes(1);

  expect(postToConnectionMock).toBeCalledWith({
    ConnectionId: validConnectionId + 1,
    Data: JSON.stringify({
      assistanceRequestId: 'uuid',
      time: validAssistanceRequestTime,
      position: {
        positionId: validPositionId,
        name: validPositionName,
      },
      message: validAssistanceRequestMessage,
    }),
  });
  expect(postToConnectionMock).toBeCalledWith({
    ConnectionId: validConnectionId + 2,
    Data: JSON.stringify({
      assistanceRequestId: 'uuid',
      time: validAssistanceRequestTime,
      position: {
        positionId: validPositionId,
        name: validPositionName,
      },
      message: validAssistanceRequestMessage,
    }),
  });
  expect(postToConnectionMock).toBeCalledTimes(2);

  expect(deleteMock).toBeCalledWith({
    TableName: validConnectionTableName,
    Key: {
      connectionId: validConnectionId + 2,
      websocket: 'assistanceRequest',
    },
  });
  expect(deleteMock).toBeCalledTimes(1);

  expect(statusCode).toBe(201);
  expect(body).toBe(
    JSON.stringify({
      assistanceRequestId: 'uuid',
      position: {
        positionId: validPositionId,
        name: validPositionName,
      },
      message: validAssistanceRequestMessage,
      time: validAssistanceRequestTime,
    })
  );
});

test('Should add assistance request, post to websocket, and return error when a websocket post fails without a 410', async () => {
  const eventBody = JSON.stringify({
    position: {
      positionId: validPositionId,
      name: validPositionName,
    },
    message: validAssistanceRequestMessage,
  });

  const event = {
    pathParameters: {
      eventId: validEventId,
    },
    body: eventBody,
  };

  putMock.mockReturnValue({
    promise: () => {},
  });

  queryMock.mockReturnValue({
    promise: () => {
      return {
        Items: [
          { connectionId: validConnectionId + 1 },
          { connectionId: validConnectionId + 2 },
        ],
      };
    },
  });

  postToConnectionMock
    .mockReturnValueOnce({
      promise: () => {
        return {};
      },
    })
    .mockImplementationOnce(() => {
      throw new MockAWSError('Error message', 'UnknownException', 404);
    });

  generateUUIDMock.mockReturnValue('uuid');

  const { statusCode, body } = await handler(event);

  expect(generateUUIDMock).toBeCalledTimes(1);
  expect(putMock).toBeCalledWith({
    TableName: validTableName,
    Item: {
      id: validEventId,
      metadata: `assistanceRequest_uuid`,
      position: {
        positionId: validPositionId,
        name: validPositionName,
      },
      time: validAssistanceRequestTime,
      message: validAssistanceRequestMessage,
    },
  });
  expect(putMock).toBeCalledTimes(1);

  expect(queryMock).toBeCalledWith({
    TableName: validConnectionTableName,
    KeyConditionExpression: 'websocket = :websocket',
    FilterExpression: 'eventId = :eventId',
    ExpressionAttributeValues: {
      ':websocket': 'assistanceRequest',
      ':eventId': validEventId,
    },
  });
  expect(queryMock).toBeCalledTimes(1);

  expect(postToConnectionMock).toBeCalledWith({
    ConnectionId: validConnectionId + 1,
    Data: JSON.stringify({
      assistanceRequestId: 'uuid',
      time: validAssistanceRequestTime,
      position: {
        positionId: validPositionId,
        name: validPositionName,
      },
      message: validAssistanceRequestMessage,
    }),
  });
  expect(postToConnectionMock).toBeCalledWith({
    ConnectionId: validConnectionId + 2,
    Data: JSON.stringify({
      assistanceRequestId: 'uuid',
      time: validAssistanceRequestTime,
      position: {
        positionId: validPositionId,
        name: validPositionName,
      },
      message: validAssistanceRequestMessage,
    }),
  });
  expect(postToConnectionMock).toBeCalledTimes(2);

  expect(deleteMock).toBeCalledTimes(0);

  expect(statusCode).toBe(500);
  expect(body).toBe(
    JSON.stringify({
      message: 'Error creating assistance request - Error message',
    })
  );
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
      message:
        'Request must contain a body containing a position and a message',
    })
  );
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
      message:
        'Request must contain a body containing a position and a message',
    })
  );
});

test('Should return 400 when called with an event with no message', async () => {
  const eventBody = JSON.stringify({
    position: {
      positionId: validPositionId,
      name: validPositionName,
    },
  });

  const event = {
    pathParameters: {
      eventId: validEventId,
    },
    body: eventBody,
  };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message:
        'Request must contain a body containing a position and a message',
    })
  );
});

test('Should return 400 when called with an event with no position ID', async () => {
  const eventBody = JSON.stringify({
    position: {
      name: validPositionName,
    },
    message: validAssistanceRequestMessage,
  });

  const event = {
    pathParameters: {
      eventId: validEventId,
    },
    body: eventBody,
  };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message:
        'Request must contain a body containing a position and a message',
    })
  );
});

test('Should return 400 when called with an event with no position name', async () => {
  const eventBody = JSON.stringify({
    position: {
      positionId: validPositionId,
    },
    message: validAssistanceRequestMessage,
  });

  const event = {
    pathParameters: {
      eventId: validEventId,
    },
    body: eventBody,
  };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message:
        'Request must contain a body containing a position and a message',
    })
  );
});

test('Should return 500 when another error is thrown', async () => {
  const eventBody = JSON.stringify({
    position: {
      positionId: validPositionId,
      name: validPositionName,
    },
    message: validAssistanceRequestMessage,
  });

  const event = {
    pathParameters: {
      eventId: validEventId,
    },
    body: eventBody,
  };

  putMock.mockImplementation(() => {
    throw new MockAWSError('Error message', 'UnknownException');
  });

  generateUUIDMock.mockReturnValue('uuid');

  const { statusCode, body } = await handler(event);

  expect(generateUUIDMock).toBeCalledTimes(1);
  expect(putMock).toBeCalledWith({
    TableName: validTableName,
    Item: {
      id: validEventId,
      metadata: `assistanceRequest_uuid`,
      position: {
        positionId: validPositionId,
        name: validPositionName,
      },
      time: validAssistanceRequestTime,
      message: validAssistanceRequestMessage,
    },
  });
  expect(putMock).toBeCalledTimes(1);

  expect(statusCode).toBe(500);
  expect(body).toBe(
    JSON.stringify({
      message: 'Error creating assistance request - Error message',
    })
  );
});
