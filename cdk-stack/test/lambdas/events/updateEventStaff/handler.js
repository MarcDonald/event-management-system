const {
  awsUtils,
  eventUtils,
  staffUtils,
  venueUtils,
} = require('../../../testUtils');
const { validEventId, invalidEventId } = eventUtils.testValues;
const {
  validUsername,
  validSub,
  validFamilyName,
  validGivenName,
  validRole,
} = staffUtils.testValues;
const { validPositionId, validPositionName } = venueUtils.testValues;
const { validTableName } = awsUtils.testValues;
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

  handler = require('../../../../lambdas/events/updateEventStaff/handler')(
    dependencies
  );
});

afterEach(jest.resetAllMocks);

test('Should update event staff when provided with a valid event', async () => {
  const staff = [
    {
      staffMember: {
        username: validUsername,
        givenName: validGivenName,
        familyName: validFamilyName,
        sub: validSub,
        role: validRole,
      },
      position: {
        positionId: validPositionId,
        name: validPositionName,
      },
    },
  ];

  const eventBody = JSON.stringify(staff);

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
    UpdateExpression: 'set #staff = :staff',
    ConditionExpression: 'id = :id and metadata = :metadata',
    ExpressionAttributeNames: {
      '#staff': 'staff',
    },
    ExpressionAttributeValues: {
      ':staff': staff,
      ':id': validEventId,
      ':metadata': 'event',
    },
  });
  expect(statusCode).toBe(200);
  expect(body).toBe(
    JSON.stringify({
      message: `Successfully updated staff members of ${validEventId}`,
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
        'Request body must be an array of staff members and their assigned positions',
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
        'Request body must be an array of staff members and their assigned positions',
    })
  );
});

test('Should return 400 when called with an event does not have an array as a body', async () => {
  const eventBody = JSON.stringify({
    staffMembers: [{}],
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
        'Request body must be an array of staff members and their assigned positions',
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
    UpdateExpression: 'set #staff = :staff',
    ConditionExpression: 'id = :id and metadata = :metadata',
    ExpressionAttributeNames: {
      '#staff': 'staff',
    },
    ExpressionAttributeValues: {
      ':staff': [validBody],
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
    UpdateExpression: 'set #staff = :staff',
    ConditionExpression: 'id = :id and metadata = :metadata',
    ExpressionAttributeNames: {
      '#staff': 'staff',
    },
    ExpressionAttributeValues: {
      ':staff': [validBody],
      ':id': invalidEventId,
      ':metadata': 'event',
    },
  });
  expect(statusCode).toBe(500);
  expect(body).toBe(
    JSON.stringify({
      message: `Error updating staff members of event - An unknown update error.`,
    })
  );
  expect(updateMock).toBeCalledTimes(1);
});
