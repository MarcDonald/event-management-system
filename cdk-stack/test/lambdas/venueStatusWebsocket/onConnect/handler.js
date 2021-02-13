const { websocketUtils, awsUtils } = require('../../../testUtils');
const {
  validConnectionId,
  validConnectionTableName,
} = websocketUtils.testValues;
const { MockAWSError } = awsUtils;

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
  };

  putMock.mockReturnValue({
    promise: () => {},
  });

  const { statusCode, body } = await handler(event);

  expect(putMock).toBeCalledWith({
    TableName: validConnectionTableName,
    Item: {
      connectionId: validConnectionId,
      websocket: 'venueStatus',
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
  };

  putMock.mockImplementation(() => {
    throw new MockAWSError('Error message', 'UnknownException');
  });

  const { statusCode, body } = await handler(event);

  expect(putMock).toBeCalledWith({
    TableName: validConnectionTableName,
    Item: {
      connectionId: validConnectionId,
      websocket: 'venueStatus',
    },
  });
  expect(statusCode).toBe(500);
  expect(body).toBe('Failed to connect: Error message');
});
