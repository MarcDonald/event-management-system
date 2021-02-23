const { awsUtils, eventUtils } = require('../../../testUtils');
const { validTableName } = awsUtils.testValues;
const {
  validEventId,
  invalidEventId,
  validAssistanceRequestId,
  invalidAssistanceRequestId,
} = eventUtils.testValues;
const { MockAWSError } = awsUtils;

let handler;

const updateMock = jest.fn();

beforeEach(() => {
  const Dynamo = {
    update: updateMock,
  };

  const dependencies = {
    Dynamo,
    tableName: validTableName,
  };

  handler = require('../../../../lambdas/events/handleAssistanceRequest/handler')(
    dependencies
  );
});

afterEach(jest.resetAllMocks);

test('Should update handled field when provided with a valid event', async () => {
  const event = {
    pathParameters: {
      eventId: validEventId,
      assistanceRequestId: validAssistanceRequestId,
    },
  };

  updateMock.mockReturnValue({
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
