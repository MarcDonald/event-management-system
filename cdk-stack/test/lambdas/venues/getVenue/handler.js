const { testValues } = require('../../../testUtils/venueUtils');
const {
  dynamoQueryResponseBuilder,
  MockAWSError,
} = require('../../../testUtils/awsUtils');
const {
  validVenueId,
  invalidVenueId,
  validTableName,
  validVenueName,
  validPositionName,
  validPositionId,
} = testValues;

let handler;
let queryMock = jest.fn();

beforeEach(() => {
  const Dynamo = {
    query: queryMock,
  };

  const dependencies = {
    tableName: validTableName,
    Dynamo,
  };

  handler = require('../../../../lambdas/venues/getVenue/handler')(
    dependencies
  );
});

afterEach(jest.resetAllMocks);

test('Should return formatted venue object when provided with a valid venue ID', async () => {
  queryMock.mockReturnValue({
    promise: () => {
      return dynamoQueryResponseBuilder([
        {
          venueId: validVenueId,
          name: validVenueName,
          positions: [
            {
              positionId: validPositionId + '1',
              name: validPositionName + '1',
            },
            {
              positionId: validPositionId + '2',
              name: validPositionName + '2',
            },
          ],
        },
      ]);
    },
  });

  const event = {
    pathParameters: {
      venueId: validVenueId,
    },
  };

  const { statusCode, body } = await handler(event);

  expect(queryMock).toBeCalledWith({
    TableName: validTableName,
    KeyConditionExpression: '#venueId = :id',
    ExpressionAttributeNames: {
      '#venueId': 'venueId',
    },
    ExpressionAttributeValues: {
      ':id': validVenueId,
    },
  });
  expect(queryMock).toBeCalledTimes(1);
  expect(statusCode).toBe(200);
  expect(body).toBe(
    JSON.stringify({
      venueId: validVenueId,
      name: validVenueName,
      positions: [
        { positionId: validPositionId + '1', name: validPositionName + '1' },
        { positionId: validPositionId + '2', name: validPositionName + '2' },
      ],
    })
  );
});

test('Should return 404 if the venue cannot be found', async () => {
  queryMock.mockReturnValue({
    promise: () => {
      return dynamoQueryResponseBuilder([]);
    },
  });

  const event = {
    pathParameters: {
      venueId: invalidVenueId,
    },
  };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(404);
  expect(body).toBe(JSON.stringify({ message: 'Venue could not be found' }));
  expect(queryMock).toBeCalledTimes(1);
});

test('Should return 400 if a venue ID is not provided', async () => {
  const event = {
    pathParameters: {},
  };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(JSON.stringify({ message: 'Venue ID must be provided' }));
  expect(queryMock).toBeCalledTimes(0);
});

test('Should return 500 if another error is thrown', async () => {
  queryMock.mockImplementation(() => {
    throw new MockAWSError('The error message.', 'AnotherError');
  });

  const event = {
    pathParameters: {
      venueId: invalidVenueId,
    },
  };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(500);
  expect(body).toBe(
    JSON.stringify({
      message: `Error getting venue '${invalidVenueId}' - The error message.`,
    })
  );
});
