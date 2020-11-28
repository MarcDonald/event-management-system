const { awsUtils, venueUtils, eventUtils } = require('../../../testUtils');
const { validPositionId, validPositionName } = venueUtils.testValues;
const {
  validEventId,
  validAssistanceRequestMessage,
  validAssistanceRequestTime,
} = eventUtils.testValues;
const { MockAWSError } = awsUtils;
const { validTableName } = awsUtils.testValues;

let handler;
const putMock = jest.fn();
const generateUUIDMock = jest.fn();
const getCurrentTimeMock = jest.fn();

beforeEach(() => {
  getCurrentTimeMock.mockReturnValue(validAssistanceRequestTime);

  const Dynamo = {
    put: putMock,
  };

  const dependencies = {
    generateUUID: generateUUIDMock,
    tableName: validTableName,
    Dynamo,
    getCurrentTime: getCurrentTimeMock,
  };

  handler = require('../../../../lambdas/events/addAssistanceRequest/handler')(
    dependencies
  );
});

afterEach(jest.resetAllMocks);

test('Should add assistance request and return information when provided with a valid event', async () => {
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
