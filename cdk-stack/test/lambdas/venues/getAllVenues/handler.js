const { awsUtils, venueUtils } = require('../../../testUtils');
const { MockAWSError, dynamoQueryResponseBuilder } = awsUtils;
const {
  validTableName,
  validVenueId,
  validVenueName,
  validPositionName,
  validPositionId,
} = venueUtils.testValues;
const { validMetadataIndexName } = awsUtils.testValues;

let handler;

const queryMock = jest.fn();

beforeEach(() => {
  const Dynamo = {
    query: queryMock,
  };

  const dependencies = {
    tableName: validTableName,
    Dynamo,
    metadataIndexName: validMetadataIndexName,
  };

  handler = require('../../../../lambdas/venues/getAllVenues/handler')(
    dependencies
  );
});

afterEach(jest.resetAllMocks);

test('Should return a formatted list of venues', async () => {
  queryMock.mockReturnValue({
    promise: () => {
      return dynamoQueryResponseBuilder([
        {
          id: validVenueId + '1',
          name: validVenueName + '1',
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
        {
          id: validVenueId + '2',
          name: validVenueName + '2',
          positions: [
            {
              positionId: validPositionId + '3',
              name: validPositionName + '3',
            },
            {
              positionId: validPositionId + '4',
              name: validPositionName + '4',
            },
          ],
        },
      ]);
    },
  });

  const { statusCode, body } = await handler({});

  expect(statusCode).toBe(200);
  expect(body).toBe(
    JSON.stringify([
      {
        venueId: validVenueId + '1',
        name: validVenueName + '1',
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
      {
        venueId: validVenueId + '2',
        name: validVenueName + '2',
        positions: [
          {
            positionId: validPositionId + '3',
            name: validPositionName + '3',
          },
          {
            positionId: validPositionId + '4',
            name: validPositionName + '4',
          },
        ],
      },
    ])
  );
  expect(queryMock).toBeCalledWith({
    TableName: validTableName,
    IndexName: validMetadataIndexName,
    KeyConditionExpression: 'metadata = :metadata',
    ExpressionAttributeValues: {
      ':metadata': 'venue',
    },
  });
  expect(queryMock).toBeCalledTimes(1);
});

test('Should return an empty list if no venues', async () => {
  queryMock.mockReturnValue({
    promise: () => {
      return dynamoQueryResponseBuilder([]);
    },
  });
  const { statusCode, body } = await handler({});

  expect(statusCode).toBe(200);
  expect(body).toBe(JSON.stringify([]));
});

test('Should return 500 if an error is thrown', async () => {
  queryMock.mockReturnValue({
    promise: () => {
      throw new MockAWSError('An unknown error.', 'UnknownException');
    },
  });

  const { statusCode, body } = await handler({});

  expect(statusCode).toBe(500);
  expect(body).toBe(
    JSON.stringify({
      message: `Error getting all venues - An unknown error.`,
    })
  );
});
