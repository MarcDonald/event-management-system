const { awsUtils, venueUtils } = require('../../../testUtils');
const { MockAWSError, dynamoQueryResponseBuilder } = awsUtils;
const { testValues } = venueUtils;
const {
  validTableName,
  validPositionName,
  validPositionId,
  validVenueId,
  validVenueName,
  invalidVenueId,
} = testValues;

let handler;
const updateMock = jest.fn();
const queryMock = jest.fn();

beforeEach(() => {
  const Dynamo = {
    update: updateMock,
    query: queryMock,
  };

  const dependencies = {
    Dynamo,
    tableName: validTableName,
  };

  handler = require('../../../../lambdas/venues/updateVenuePositions/handler')(
    dependencies
  );
});

afterEach(jest.resetAllMocks);

test('Should update positions when provided with a valid event', async () => {
  const newName = 'a new name';
  const eventBody = JSON.stringify([
    {
      positionId: validPositionId + '1',
      name: newName + '1',
    },
    {
      positionId: validPositionId + '3',
      name: newName + '3',
    },
  ]);
  const event = {
    body: eventBody,
    pathParameters: {
      venueId: validVenueId,
    },
  };

  queryMock.mockReturnValue({
    promise: () => {
      return dynamoQueryResponseBuilder([
        {
          venueId: validVenueId,
          name: validVenueName,
          positions: [
            {
              positionId: validPositionId,
              name: validPositionName,
            },
            {
              positionId: validPositionId + '1',
              name: validPositionName + '1',
            },
            {
              positionId: validPositionId + '2',
              name: validPositionName + '2',
            },
            {
              positionId: validPositionId + '3',
              name: validPositionName + '3',
            },
          ],
        },
      ]);
    },
  });

  updateMock.mockReturnValue({
    promise: () => {},
  });

  const { statusCode, body } = await handler(event);

  expect(queryMock).toBeCalledTimes(1);
  expect(queryMock).toBeCalledWith({
    TableName: validTableName,
    KeyConditionExpression: 'id = :id and metadata = :metadata',
    ExpressionAttributeValues: {
      ':id': validVenueId,
      ':metadata': 'venue',
    },
    Limit: 1,
  });
  expect(updateMock).toBeCalledWith({
    TableName: validTableName,
    Key: {
      id: validVenueId,
      metadata: 'venue',
    },
    UpdateExpression: 'set #positions = :newPositions',
    ExpressionAttributeNames: {
      '#positions': 'positions',
    },
    // Adding this condition prevents a new venue being made if the venue doesn't already exist
    ConditionExpression: 'id = :id and metadata = :metadata',
    ExpressionAttributeValues: {
      ':newPositions': [
        {
          positionId: validPositionId,
          name: validPositionName,
        },
        {
          positionId: validPositionId + '1',
          name: newName + '1',
        },
        {
          positionId: validPositionId + '2',
          name: validPositionName + '2',
        },
        {
          positionId: validPositionId + '3',
          name: newName + '3',
        },
      ],
      ':id': validVenueId,
      ':metadata': 'venue',
    },
  });
  expect(updateMock).toBeCalledTimes(1);

  expect(statusCode).toBe(201);
  expect(body).toBe(
    JSON.stringify({
      message: `Updated 2 positions of ${validVenueId} successfully`,
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
  const eventBody = JSON.stringify([{ positionId: validPositionId, name: '' }]);
  const event = {
    body: eventBody,
    pathParameters: {
      venueId: validVenueId,
    },
  };

  queryMock.mockReturnValue({
    promise: () => {
      return dynamoQueryResponseBuilder([
        {
          venueId: validVenueId,
          name: validVenueName,
          positions: [
            {
              positionId: validPositionId,
              name: validPositionName,
            },
          ],
        },
      ]);
    },
  });

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
    positions: [{ positionId: validPositionId, name: validPositionName }],
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

  queryMock.mockReturnValue({
    promise: () => {
      return dynamoQueryResponseBuilder([]);
    },
  });

  const { statusCode, body } = await handler(event);

  expect(queryMock).toBeCalledTimes(1);
  expect(queryMock).toBeCalledWith({
    TableName: validTableName,
    KeyConditionExpression: 'id = :id and metadata = :metadata',
    ExpressionAttributeValues: {
      ':id': validVenueId,
      ':metadata': 'venue',
    },
    Limit: 1,
  });
  expect(updateMock).toBeCalledTimes(0);

  expect(statusCode).toBe(404);
  expect(body).toBe(
    JSON.stringify({
      message: 'Could not find venue with that ID',
    })
  );
});

test('Should return 500 when a query error is thrown', async () => {
  const event = {
    pathParameters: {
      venueId: invalidVenueId,
    },
    body: JSON.stringify([
      { positionId: validPositionId, name: validPositionName },
    ]),
  };

  queryMock.mockReturnValue({
    promise: () => {
      throw new MockAWSError(
        'An unknown query error.',
        'UnknownQueryException'
      );
    },
  });

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(500);
  expect(body).toBe(
    JSON.stringify({
      message: `Error updating positions of venue - An unknown query error.`,
    })
  );
  expect(queryMock).toBeCalledTimes(1);
  expect(updateMock).toBeCalledTimes(0);
});

test('Should return 500 when an update error is thrown', async () => {
  const event = {
    pathParameters: {
      venueId: invalidVenueId,
    },
    body: JSON.stringify([
      { positionId: validPositionId, name: validPositionName },
    ]),
  };

  queryMock.mockReturnValue({
    promise: () => {
      return dynamoQueryResponseBuilder([
        {
          venueId: validVenueId,
          name: validVenueName,
          positions: [
            {
              positionId: validPositionId,
              name: validPositionName,
            },
          ],
        },
      ]);
    },
  });

  updateMock.mockReturnValue({
    promise: () => {
      throw new MockAWSError(
        'An unknown update error.',
        'UnknownUpdateException'
      );
    },
  });

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(500);
  expect(body).toBe(
    JSON.stringify({
      message: `Error updating positions of venue - An unknown update error.`,
    })
  );
  expect(queryMock).toBeCalledTimes(1);
  expect(updateMock).toBeCalledTimes(1);
});
