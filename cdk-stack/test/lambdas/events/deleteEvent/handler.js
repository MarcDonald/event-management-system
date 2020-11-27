const { awsUtils, eventUtils } = require('../../../testUtils');
const { MockAWSError } = awsUtils;
const { testValues } = eventUtils;
const { validEventId, validTableName } = testValues;

let handler;

const deleteMock = jest.fn();

beforeEach(() => {
  const Dynamo = {
    delete: deleteMock,
  };

  const dependencies = {
    Dynamo,
    tableName: validTableName,
  };
  handler = require('../../../../lambdas/events/deleteEvent/handler')(
    dependencies
  );
});

afterEach(jest.resetAllMocks);

test('Should return 204 when an event is deleted successfully', async () => {
  const event = {
    pathParameters: {
      eventId: validEventId,
    },
  };

  deleteMock.mockReturnValue({
    promise: () => {},
  });

  const { statusCode } = await handler(event);

  expect(statusCode).toBe(204);
  expect(deleteMock).toBeCalledTimes(1);
  expect(deleteMock).toBeCalledWith({
    TableName: validTableName,
    Key: {
      id: validEventId,
      metadata: 'event',
    },
  });
});

test('Should return 400 when no event ID is supplied', async () => {
  const event = {
    pathParameters: {},
  };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(JSON.stringify({ message: 'Event ID must be provided' }));
  expect(deleteMock).toBeCalledTimes(0);
});

test('Should return 500 when another error is thrown', async () => {
  const event = {
    pathParameters: {
      eventId: validEventId,
    },
  };

  deleteMock.mockReturnValue({
    promise: () => {
      throw new MockAWSError('An unknown error.', 'UnknownException');
    },
  });

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(500);
  expect(body).toBe(
    JSON.stringify({
      message: `Error deleting event ${validEventId} - An unknown error.`,
    })
  );
  expect(deleteMock).toBeCalledTimes(1);
  expect(deleteMock).toBeCalledWith({
    TableName: validTableName,
    Key: {
      id: validEventId,
      metadata: 'event',
    },
  });
});
