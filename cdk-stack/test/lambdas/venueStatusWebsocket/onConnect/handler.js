const { websocketUtils, awsUtils, eventUtils } = require('../../../testUtils');
const {
  validConnectionId,
  validConnectionTableName,
} = websocketUtils.testValues;
const { MockAWSError } = awsUtils;

const { validEventId } = eventUtils.testValues;

let handler;
const putMock = jest.fn();

beforeEach(() => {
  const Dynamo = {
    put: putMock,
  };

  const dependencies = {
    Dynamo,
    connectionTableName: validConnectionTableName,
  };

  handler = require('../../../../lambdas/venueStatusWebsocket/onConnect/handler')(
    dependencies
  );
});

afterEach(jest.resetAllMocks);

test('Should add the connection ID to the table', async () => {
  const event = {
    requestContext: {
      connectionId: validConnectionId,
    },
    queryStringParameters: {
      eventId: validEventId,
    },
  };

  putMock.mockReturnValue({
    promise: () => {},
  });

  const { statusCode, body } = await handler(event);

  expect(putMock).toBeCalledWith({
    TableName: validConnectionTableName,
    Item: {
      websocket: 'venueStatus',
      eventId: validEventId,
      connectionId: validConnectionId,
    },
  });
  expect(statusCode).toBe(200);
  expect(body).toBe('Connected');
});

test('Should return an error when the table insert fails', async () => {
  const event = {
    requestContext: {
      connectionId: validConnectionId,
    },
    queryStringParameters: {
      eventId: validEventId,
    },
  };

  putMock.mockImplementation(() => {
    throw new MockAWSError('Error message', 'UnknownException');
  });

  const { statusCode, body } = await handler(event);

  expect(putMock).toBeCalledWith({
    TableName: validConnectionTableName,
    Item: {
      websocket: 'venueStatus',
      eventId: validEventId,
      connectionId: validConnectionId,
    },
  });
  expect(statusCode).toBe(500);
  expect(body).toBe('Failed to connect: Error message');
});

test('Should return an error when an eventId is not provided', async () => {
  const event = {
    requestContext: {
      connectionId: validConnectionId,
    },
  };

  const { statusCode, body } = await handler(event);

  expect(putMock).toBeCalledTimes(0);
  expect(statusCode).toBe(400);
  expect(body).toBe('Failed to connect: Must include an eventId parameter');
});
