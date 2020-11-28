const {
  awsUtils,
  eventUtils,
  staffUtils,
  venueUtils,
} = require('../../../testUtils');
const {
  validEventId,
  invalidEventId,
  validTableName,
  validAreaOfSupervision,
} = eventUtils.testValues;
const {
  validUsername,
  validSub,
  validFamilyName,
  validGivenName,
  validRole,
} = staffUtils.testValues;
const { validPositionId, validPositionName } = venueUtils.testValues;
const { MockAWSError } = awsUtils;

let handler;
const updateMock = jest.fn();

const validBody = {
  staffMember: {
    username: validUsername,
    sub: validSub,
    role: validRole,
    givenName: validGivenName,
    familyName: validFamilyName,
  },
  position: {
    positionId: validPositionId,
    name: validPositionName,
  },
};

beforeEach(() => {
  const Dynamo = {
    update: updateMock,
  };

  const dependencies = {
    Dynamo,
    tableName: validTableName,
  };

  handler = require('../../../../lambdas/events/updateEventSupervisors/handler')(
    dependencies
  );
});

afterEach(jest.resetAllMocks);

test('Should update event supervisors when provided with a valid event', async () => {
  const supervisors = [
    {
      staffMember: {
        username: validUsername,
        givenName: validGivenName,
        familyName: validFamilyName,
        sub: validSub,
        role: validRole,
      },
      areaOfSupervision: validAreaOfSupervision,
    },
  ];

  const eventBody = JSON.stringify(supervisors);

  updateMock.mockReturnValue({
    promise: () => {},
  });

  const event = {
    pathParameters: {
      eventId: validEventId,
    },
    body: eventBody,
  };

  const { statusCode, body } = await handler(event);

  expect(updateMock).toBeCalledTimes(1);
  expect(updateMock).toBeCalledWith({
    TableName: validTableName,
    Key: {
      id: validEventId,
      metadata: 'event',
    },
    UpdateExpression: 'set #supervisors = :supervisors',
    ConditionExpression: 'id = :id and metadata = :metadata',
    ExpressionAttributeNames: {
      '#supervisors': 'supervisors',
    },
    ExpressionAttributeValues: {
      ':supervisors': supervisors,
      ':id': validEventId,
      ':metadata': 'event',
    },
  });
  expect(statusCode).toBe(200);
  expect(body).toBe(
    JSON.stringify({
      message: `Successfully updated supervisors of ${validEventId}`,
    })
  );
});

test('Should return 400 when called with an event with no event ID', async () => {
  const event = {
    pathParameters: {},
  };

  const { statusCode, body } = await handler(event);

  expect(updateMock).toBeCalledTimes(0);
  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message: 'Event ID must be provided',
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

  expect(updateMock).toBeCalledTimes(0);
  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message:
        'Request body must be an array of supervisors and their assigned positions',
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

  expect(updateMock).toBeCalledTimes(0);
  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message:
        'Request body must be an array of supervisors and their assigned positions',
    })
  );
});

test('Should return 400 when called with an event does not have an array as a body', async () => {
  const eventBody = JSON.stringify({
    supervisorsMembers: [{}],
  });
  const event = {
    body: eventBody,
    pathParameters: {
      eventId: validEventId,
    },
  };

  const { statusCode, body } = await handler(event);

  expect(updateMock).toBeCalledTimes(0);
  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message:
        'Request body must be an array of supervisors and their assigned positions',
    })
  );
});

test('Should return 404 when venue could not be found', async () => {
  const eventBody = JSON.stringify([validBody]);
  const event = {
    body: eventBody,
    pathParameters: {
      eventId: invalidEventId,
    },
  };

  updateMock.mockImplementation(() => {
    throw new MockAWSError(
      'The conditional request failed',
      'ConditionalCheckFailedException'
    );
  });

  const { statusCode, body } = await handler(event);

  expect(updateMock).toBeCalledTimes(1);
  expect(updateMock).toBeCalledWith({
    TableName: validTableName,
    Key: {
      id: invalidEventId,
      metadata: 'event',
    },
    UpdateExpression: 'set #supervisors = :supervisors',
    ConditionExpression: 'id = :id and metadata = :metadata',
    ExpressionAttributeNames: {
      '#supervisors': 'supervisors',
    },
    ExpressionAttributeValues: {
      ':supervisors': [validBody],
      ':id': invalidEventId,
      ':metadata': 'event',
    },
  });

  expect(statusCode).toBe(404);
  expect(body).toBe(
    JSON.stringify({
      message: 'Could not find an event with that ID',
    })
  );
});

test('Should return 500 when an update error is thrown', async () => {
  const event = {
    pathParameters: {
      eventId: invalidEventId,
    },
    body: JSON.stringify([validBody]),
  };

  updateMock.mockReturnValue({
    promise: () => {
      throw new MockAWSError(
        'An unknown update error.',
        'UnknownUpdateException'
      );
    },
  });

  const { statusCode, body } = await handler(event);

  expect(updateMock).toBeCalledTimes(1);
  expect(updateMock).toBeCalledWith({
    TableName: validTableName,
    Key: {
      id: invalidEventId,
      metadata: 'event',
    },
    UpdateExpression: 'set #supervisors = :supervisors',
    ConditionExpression: 'id = :id and metadata = :metadata',
    ExpressionAttributeNames: {
      '#supervisors': 'supervisors',
    },
    ExpressionAttributeValues: {
      ':supervisors': [validBody],
      ':id': invalidEventId,
      ':metadata': 'event',
    },
  });
  expect(statusCode).toBe(500);
  expect(body).toBe(
    JSON.stringify({
      message: `Error updating supervisors of event - An unknown update error.`,
    })
  );
  expect(updateMock).toBeCalledTimes(1);
});
