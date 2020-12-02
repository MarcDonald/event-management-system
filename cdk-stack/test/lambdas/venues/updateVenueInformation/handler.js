const { awsUtils, venueUtils } = require('../../../testUtils');
const { MockAWSError } = awsUtils;
const { validTableName } = awsUtils.testValues;
const { validVenueId, validVenueName } = venueUtils.testValues;

const updateMock = jest.fn();
let handler;

beforeEach(() => {
  const Dynamo = {
    update: updateMock,
  };
  const dependencies = {
    Dynamo,
    tableName: validTableName,
  };

  handler = require('../../../../lambdas/venues/updateVenueInformation/handler')(
    dependencies
  );
});

afterEach(jest.resetAllMocks);

test('Should return 400 if venue ID is not provided', async () => {
  const event = {
    pathParameters: {},
  };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(JSON.stringify({ message: 'Venue ID must be provided' }));
  expect(updateMock).toBeCalledTimes(0);
});

test('Should return 400 when called with an event with no body', async () => {
  const event = {
    pathParameters: {
      venueId: validVenueId,
    },
  };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message: 'Request must contain a body containing a name',
    })
  );
  expect(updateMock).toBeCalledTimes(0);
});

test('Should return 400 when called with an event with an empty body', async () => {
  const event = {
    pathParameters: {
      venueId: validVenueId,
    },
    body: '',
  };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message: 'Request must contain a body containing a name',
    })
  );
  expect(updateMock).toBeCalledTimes(0);
});

test('Should return 400 when called with an empty name in the body', async () => {
  const event = {
    pathParameters: {
      venueId: validVenueId,
    },
    body: JSON.stringify({ name: '' }),
  };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message: 'Request must contain a body containing a name',
    })
  );
  expect(updateMock).toBeCalledTimes(0);
});

test("Should update venue's name when provided with a name in the request body", async () => {
  const eventBody = JSON.stringify({
    name: validVenueName,
  });
  const event = {
    pathParameters: {
      venueId: validVenueId,
    },
    body: eventBody,
  };

  updateMock.mockReturnValue({
    promise: () => {},
  });

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(200);
  expect(body).toBe(
    JSON.stringify({ message: `Successfully updated ${validVenueId}` })
  );
  expect(updateMock).toBeCalledTimes(1);
  expect(updateMock).toBeCalledWith({
    TableName: validTableName,
    Key: {
      id: validVenueId,
      metadata: 'venue',
    },
    UpdateExpression: 'set #name = :name',
    ExpressionAttributeNames: {
      '#name': 'name',
    },
    ConditionExpression: 'id = :id and metadata = :metadata',
    ExpressionAttributeValues: {
      ':name': validVenueName,
      ':id': validVenueId,
      ':metadata': 'venue',
    },
  });
});

test('Should return 404 when venue does not exist', async () => {
  const eventBody = JSON.stringify({
    name: validVenueName,
  });
  const event = {
    pathParameters: {
      venueId: validVenueId,
    },
    body: eventBody,
  };

  updateMock.mockImplementation(() => {
    throw new MockAWSError(
      'The conditional request failed',
      'ConditionalCheckFailedException'
    );
  });

  const { statusCode, body } = await handler(event);

  expect(updateMock).toBeCalledWith({
    TableName: validTableName,
    Key: {
      id: validVenueId,
      metadata: 'venue',
    },
    UpdateExpression: 'set #name = :name',
    ExpressionAttributeNames: {
      '#name': 'name',
    },
    ConditionExpression: 'id = :id and metadata = :metadata',
    ExpressionAttributeValues: {
      ':name': validVenueName,
      ':id': validVenueId,
      ':metadata': 'venue',
    },
  });
  expect(updateMock).toBeCalledTimes(1);

  expect(statusCode).toBe(404);
  expect(body).toBe(
    JSON.stringify({ message: 'Could not find a venue with that ID' })
  );
});

test('Should return 500 when another error is thrown', async () => {
  const eventBody = JSON.stringify({
    name: validVenueName,
  });
  const event = {
    pathParameters: {
      venueId: validVenueId,
    },
    body: eventBody,
  };

  updateMock.mockImplementation(() => {
    throw new MockAWSError('Error message', 'UnknownException');
  });

  const { statusCode, body } = await handler(event);

  expect(updateMock).toBeCalledWith({
    TableName: validTableName,
    Key: {
      id: validVenueId,
      metadata: 'venue',
    },
    UpdateExpression: 'set #name = :name',
    ExpressionAttributeNames: {
      '#name': 'name',
    },
    ConditionExpression: 'id = :id and metadata = :metadata',
    ExpressionAttributeValues: {
      ':name': validVenueName,
      ':id': validVenueId,
      ':metadata': 'venue',
    },
  });
  expect(updateMock).toBeCalledTimes(1);

  expect(statusCode).toBe(500);
  expect(body).toBe(
    JSON.stringify({ message: 'Error editing venue information - Error message' })
  );
});
