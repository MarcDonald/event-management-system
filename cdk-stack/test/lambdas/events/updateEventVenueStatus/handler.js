const { awsUtils, eventUtils, websocketUtils } = require('../../../testUtils');
const { MockAWSError, dynamoQueryResponseBuilder } = awsUtils;
const {
  validEventId,
  invalidEventId,
  validEventName,
  validStart,
  validEnd,
  invalidEnd,
  validStatusUpdateTime,
} = eventUtils.testValues;
const { validTableName } = awsUtils.testValues;
const {
  validConnectionId,
  validConnectionTableName,
  validConnectionTableIndexName,
} = websocketUtils.testValues;

let handler;
const putMock = jest.fn();
const getCurrentTimeMock = jest.fn();
const queryMock = jest.fn();
const postToConnectionMock = jest.fn();
const deleteMock = jest.fn();

beforeEach(() => {
  getCurrentTimeMock.mockReturnValue(validStatusUpdateTime);
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
    tableName: validTableName,
    connectionTableName: validConnectionTableName,
    connectionTableIndexName: validConnectionTableIndexName,
    getCurrentTime: getCurrentTimeMock,
  };

  handler = require('../../../../lambdas/events/updateEventVenueStatus/handler')(
    dependencies
  );
});

afterEach(jest.resetAllMocks);

test('Should insert statusUpdate to table and return the new status when provided with a valid event and no websocket connections', async () => {
  const eventBody = JSON.stringify({
    venueStatus: 'High',
  });
  const event = {
    pathParameters: {
      eventId: validEventId,
    },
    body: eventBody,
  };

  putMock.mockReturnValue({
    promise: () => {
      return {};
    },
  });
  queryMock.mockReturnValue({
    promise: () => {
      return { Items: [] };
    },
  });

  const { statusCode, body } = await handler(event);

  expect(putMock).toBeCalledWith({
    TableName: validTableName,
    Item: {
      id: validEventId,
      metadata: `statusUpdate_${validStatusUpdateTime}`,
      venueStatus: 'High',
    },
  });
  expect(putMock).toBeCalledTimes(1);

  expect(queryMock).toBeCalledWith({
    TableName: validConnectionTableName,
    IndexName: validConnectionTableIndexName,
    KeyConditionExpression: 'websocket = :websocket',
    ExpressionAttributeValues: {
      ':websocket': 'venueStatus',
    },
  });
  expect(queryMock).toBeCalledTimes(1);

  expect(postToConnectionMock).toBeCalledTimes(0);

  expect(statusCode).toBe(200);
  expect(body).toBe(JSON.stringify({ venueStatus: 'High' }));
});

test('Should insert statusUpdate to table, post to websocket, and return the new status when provided with a valid event and websocket connections', async () => {
  const eventBody = JSON.stringify({
    venueStatus: 'High',
  });
  const event = {
    pathParameters: {
      eventId: validEventId,
    },
    body: eventBody,
  };

  putMock.mockReturnValue({
    promise: () => {
      return {};
    },
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

  const { statusCode, body } = await handler(event);

  expect(putMock).toBeCalledWith({
    TableName: validTableName,
    Item: {
      id: validEventId,
      metadata: `statusUpdate_${validStatusUpdateTime}`,
      venueStatus: 'High',
    },
  });
  expect(putMock).toBeCalledTimes(1);

  expect(queryMock).toBeCalledWith({
    TableName: validConnectionTableName,
    IndexName: validConnectionTableIndexName,
    KeyConditionExpression: 'websocket = :websocket',
    ExpressionAttributeValues: {
      ':websocket': 'venueStatus',
    },
  });
  expect(queryMock).toBeCalledTimes(1);

  expect(postToConnectionMock).toBeCalledWith({
    ConnectionId: validConnectionId + 1,
    Data: JSON.stringify({
      id: validEventId,
      time: validStatusUpdateTime,
      venueStatus: 'High',
    }),
  });
  expect(postToConnectionMock).toBeCalledWith({
    ConnectionId: validConnectionId + 2,
    Data: JSON.stringify({
      id: validEventId,
      time: validStatusUpdateTime,
      venueStatus: 'High',
    }),
  });
  expect(postToConnectionMock).toBeCalledTimes(2);

  expect(statusCode).toBe(200);
  expect(body).toBe(JSON.stringify({ venueStatus: 'High' }));
});

test('Should insert statusUpdate to table, post to websocket, delete stale connection, and return the new status when provided with a valid event and websocket connections including a stale connection', async () => {
  const eventBody = JSON.stringify({
    venueStatus: 'High',
  });
  const event = {
    pathParameters: {
      eventId: validEventId,
    },
    body: eventBody,
  };

  putMock.mockReturnValue({
    promise: () => {
      return {};
    },
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

  const { statusCode, body } = await handler(event);

  expect(putMock).toBeCalledWith({
    TableName: validTableName,
    Item: {
      id: validEventId,
      metadata: `statusUpdate_${validStatusUpdateTime}`,
      venueStatus: 'High',
    },
  });
  expect(putMock).toBeCalledTimes(1);

  expect(queryMock).toBeCalledWith({
    TableName: validConnectionTableName,
    IndexName: validConnectionTableIndexName,
    KeyConditionExpression: 'websocket = :websocket',
    ExpressionAttributeValues: {
      ':websocket': 'venueStatus',
    },
  });
  expect(queryMock).toBeCalledTimes(1);

  expect(postToConnectionMock).toBeCalledWith({
    ConnectionId: validConnectionId + 1,
    Data: JSON.stringify({
      id: validEventId,
      time: validStatusUpdateTime,
      venueStatus: 'High',
    }),
  });

  expect(postToConnectionMock).toBeCalledWith({
    ConnectionId: validConnectionId + 2,
    Data: JSON.stringify({
      id: validEventId,
      time: validStatusUpdateTime,
      venueStatus: 'High',
    }),
  });
  expect(postToConnectionMock).toBeCalledTimes(2);

  expect(deleteMock).toBeCalledWith({
    TableName: validConnectionTableName,
    Key: {
      connectionId: validConnectionId + 2,
      websocket: 'venueStatus',
    },
  });
  expect(deleteMock).toBeCalledTimes(1);

  expect(statusCode).toBe(200);
  expect(body).toBe(JSON.stringify({ venueStatus: 'High' }));
});

test('Should insert statusUpdate to table, post to websocket, and return error when a websocket post fails without a 410', async () => {
  const eventBody = JSON.stringify({
    venueStatus: 'High',
  });
  const event = {
    pathParameters: {
      eventId: validEventId,
    },
    body: eventBody,
  };

  putMock.mockReturnValue({
    promise: () => {
      return {};
    },
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

  const { statusCode, body } = await handler(event);

  expect(putMock).toBeCalledWith({
    TableName: validTableName,
    Item: {
      id: validEventId,
      metadata: `statusUpdate_${validStatusUpdateTime}`,
      venueStatus: 'High',
    },
  });
  expect(putMock).toBeCalledTimes(1);

  expect(queryMock).toBeCalledWith({
    TableName: validConnectionTableName,
    IndexName: validConnectionTableIndexName,
    KeyConditionExpression: 'websocket = :websocket',
    ExpressionAttributeValues: {
      ':websocket': 'venueStatus',
    },
  });
  expect(queryMock).toBeCalledTimes(1);

  expect(postToConnectionMock).toBeCalledWith({
    ConnectionId: validConnectionId + 1,
    Data: JSON.stringify({
      id: validEventId,
      time: validStatusUpdateTime,
      venueStatus: 'High',
    }),
  });

  expect(postToConnectionMock).toBeCalledWith({
    ConnectionId: validConnectionId + 2,
    Data: JSON.stringify({
      id: validEventId,
      time: validStatusUpdateTime,
      venueStatus: 'High',
    }),
  });
  expect(postToConnectionMock).toBeCalledTimes(2);

  expect(deleteMock).toBeCalledTimes(0);

  expect(statusCode).toBe(500);
  expect(body).toBe(
    JSON.stringify({
      message: 'Error updating venue status - Error message',
    })
  );
});

test('Should return 400 if event ID is not provided', async () => {
  const event = {
    pathParameters: {},
  };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(JSON.stringify({ message: 'Event ID must be provided' }));
  expect(putMock).toBeCalledTimes(0);
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
      message: 'Request must contain a body containing a venue status',
    })
  );
  expect(putMock).toBeCalledTimes(0);
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
      message: 'Request must contain a body containing a venue status',
    })
  );
  expect(putMock).toBeCalledTimes(0);
});

test('Should return 400 when called with an empty venueStatus is provided in the body', async () => {
  const event = {
    pathParameters: {
      eventId: validEventId,
    },
    body: JSON.stringify({ venueStatus: '' }),
  };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message: 'Request must contain a body containing a venue status',
    })
  );
  expect(putMock).toBeCalledTimes(0);
});

test('Should return 400 when called with an invalid venueStatus is provided in the body', async () => {
  const event = {
    pathParameters: {
      eventId: validEventId,
    },
    body: JSON.stringify({ venueStatus: 'INVALID' }),
  };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message: 'venueStatus must be Low, High, or Evacuate',
    })
  );
  expect(putMock).toBeCalledTimes(0);
});

test('Should return 500 when another error is thrown', async () => {
  const eventBody = JSON.stringify({
    venueStatus: 'High',
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

  const { statusCode, body } = await handler(event);

  expect(putMock).toBeCalledWith({
    TableName: validTableName,
    Item: {
      id: validEventId,
      metadata: `statusUpdate_${validStatusUpdateTime}`,
      venueStatus: 'High',
    },
  });

  expect(putMock).toBeCalledTimes(1);
  expect(statusCode).toBe(500);
  expect(body).toBe(
    JSON.stringify({
      message: 'Error updating venue status - Error message',
    })
  );
});
