const { websocketUtils, awsUtils } = require('../../../testUtils');
const {
  validConnectionId,
  validConnectionTableName,
} = websocketUtils.testValues;
const { MockAWSError } = awsUtils;

let handler;
const deleteMock = jest.fn();

beforeEach(() => {
  const Dynamo = {
    delete: deleteMock,
  };

  const dependencies = {
    Dynamo,
    connectionTableName: validConnectionTableName,
  };

  handler = require('../../../../lambdas/venueStatusWebsocket/onDisconnect/handler')(
    dependencies
  );
});

afterEach(jest.resetAllMocks);

test('Should remove the connection ID from the table', async () => {
  const event = {
    requestContext: {
      connectionId: validConnectionId,
    },
  };

  deleteMock.mockReturnValue({
    promise: () => {},
  });

  const { statusCode, body } = await handler(event);

  expect(deleteMock).toBeCalledWith({
    TableName: validConnectionTableName,
    Key: {
      connectionId: validConnectionId,
      websocket: 'venueStatus',
    },
  });
  expect(statusCode).toBe(200);
  expect(body).toBe('Disconnected');
});

test('Should return an error when the table delete fails', async () => {
  const event = {
    requestContext: {
      connectionId: validConnectionId,
    },
  };

  deleteMock.mockImplementation(() => {
    throw new MockAWSError('Error message', 'UnknownException');
  });

  const { statusCode, body } = await handler(event);

  expect(deleteMock).toBeCalledWith({
    TableName: validConnectionTableName,
    Key: {
      connectionId: validConnectionId,
      websocket: 'venueStatus',
    },
  });
  expect(statusCode).toBe(500);
  expect(body).toBe('Failed to disconnect: Error message');
});
