const { awsUtils, venueUtils } = require('../../../testUtils');
const { MockAWSError } = awsUtils;
const { testValues } = venueUtils;
const { validTableName, validPositionName, validVenueId } = testValues;

let handler;
const updateMock = jest.fn();
const generateUUIDMock = jest.fn();

beforeEach(() => {
  const Dynamo = {
    update: updateMock,
  };

  const dependencies = {
    Dynamo,
    tableName: validTableName,
    generateUUID: generateUUIDMock,
  };

  handler = require('../../../../lambdas/venues/addVenuePositions/handler')(
    dependencies
  );
});

afterEach(jest.resetAllMocks);

test('Should add new positions to venue when provided with a valid event', async () => {
  const eventBody = JSON.stringify([
    {
      name: validPositionName + '1',
    },
    {
      name: validPositionName + '2',
    },
  ]);
  const event = {
    body: eventBody,
    pathParameters: {
      venueId: validVenueId,
    },
  };

  generateUUIDMock
    // UUID generated for venue
    .mockReturnValueOnce('uuid1')
    // UUID generated for position 1
    .mockReturnValueOnce('uuid2')
    // Default
    .mockReturnValue('uuid');

  updateMock.mockReturnValue({
    promise: () => {},
  });

  const { statusCode, body } = await handler(event);

  expect(generateUUIDMock).toBeCalledTimes(2);
  expect(updateMock).toBeCalledWith({
    TableName: validTableName,
    Key: {
      venueId: validVenueId,
    },
    UpdateExpression: 'set #positions = list_append(#positions, :newPositions)',
    ExpressionAttributeNames: {
      '#positions': 'positions',
    },
    // Adding this condition prevents a new venue being made if the venue doesn't already exist
    ConditionExpression: 'venueId = :venueId',
    ExpressionAttributeValues: {
      ':newPositions': [
        {
          positionId: 'uuid1',
          name: validPositionName + '1',
        },
        {
          positionId: 'uuid2',
          name: validPositionName + '2',
        },
      ],
      ':venueId': validVenueId,
    },
  });
  expect(updateMock).toBeCalledTimes(1);

  expect(statusCode).toBe(201);
  expect(body).toBe(
    JSON.stringify({
      message: `Added 2 positions to ${validVenueId} successfully`,
    })
  );
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
      message: 'Request body must be an array of positions',
    })
  );
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
      message: 'Request body must be an array of positions',
    })
  );
});

test('Should return 400 when called with an event with a position with no name', async () => {
  const eventBody = JSON.stringify([{ name: '' }]);
  const event = {
    body: eventBody,
    pathParameters: {
      venueId: validVenueId,
    },
  };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message: 'All positions must have a name',
    })
  );
});

test('Should return 400 when called with an event does not have an array as a body', async () => {
  const eventBody = JSON.stringify({
    positions: [{ name: validPositionName }],
  });
  const event = {
    body: eventBody,
    pathParameters: {
      venueId: validVenueId,
    },
  };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message: 'Request body must be an array of positions',
    })
  );
});

test('Should return 404 when venue could not be found', async () => {
  const eventBody = JSON.stringify([
    {
      name: validPositionName,
    },
  ]);
  const event = {
    body: eventBody,
    pathParameters: {
      venueId: validVenueId,
    },
  };

  updateMock.mockImplementation(() => {
    throw new MockAWSError(
      'Conditional Update Failed',
      'ConditionalCheckFailedException'
    );
  });

  generateUUIDMock.mockReturnValue('uuid');

  const { statusCode, body } = await handler(event);

  expect(generateUUIDMock).toBeCalledTimes(1);
  expect(updateMock).toBeCalledWith({
    TableName: validTableName,
    Key: {
      venueId: validVenueId,
    },
    UpdateExpression: 'set #positions = list_append(#positions, :newPositions)',
    ExpressionAttributeNames: {
      '#positions': 'positions',
    },
    // Adding this condition prevents a new venue being made if the venue doesn't already exist
    ConditionExpression: 'venueId = :venueId',
    ExpressionAttributeValues: {
      ':newPositions': [
        {
          positionId: 'uuid',
          name: validPositionName,
        },
      ],
      ':venueId': validVenueId,
    },
  });
  expect(updateMock).toBeCalledTimes(1);

  expect(statusCode).toBe(404);
  expect(body).toBe(
    JSON.stringify({
      message: 'Could not find a venue with that ID',
    })
  );
});

test('Should return 500 when another error is thrown', async () => {
  const eventBody = JSON.stringify([
    {
      name: validPositionName,
    },
  ]);
  const event = {
    body: eventBody,
    pathParameters: {
      venueId: validVenueId,
    },
  };

  updateMock.mockImplementation(() => {
    throw new MockAWSError('Error message', 'UnknownException');
  });

  generateUUIDMock.mockReturnValue('uuid');

  const { statusCode, body } = await handler(event);

  expect(generateUUIDMock).toBeCalledTimes(1);
  expect(updateMock).toBeCalledWith({
    TableName: validTableName,
    Key: {
      venueId: validVenueId,
    },
    UpdateExpression: 'set #positions = list_append(#positions, :newPositions)',
    ExpressionAttributeNames: {
      '#positions': 'positions',
    },
    // Adding this condition prevents a new venue being made if the venue doesn't already exist
    ConditionExpression: 'venueId = :venueId',
    ExpressionAttributeValues: {
      ':newPositions': [
        {
          positionId: 'uuid',
          name: validPositionName,
        },
      ],
      ':venueId': validVenueId,
    },
  });
  expect(updateMock).toBeCalledTimes(1);

  expect(statusCode).toBe(500);
  expect(body).toBe(
    JSON.stringify({
      message: 'Error adding positions to venue - Error message',
    })
  );
});
