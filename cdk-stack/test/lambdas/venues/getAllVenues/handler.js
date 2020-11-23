const { testValues } = require('../../../testUtils/venueUtils');
const {
  dynamoQueryResponseBuilder,
  MockAWSError,
} = require('../../../testUtils/awsUtils');
const {
  validTableName,
  validVenueId,
  invalidVenueId,
  validVenueName,
  validPositionName,
  validPositionId,
  invalidPositionId,
  invalidVenueName,
} = testValues;

let handler;

const scanMock = jest.fn();

beforeEach(() => {
  const Dynamo = {
    scan: scanMock,
  };

  const dependencies = {
    tableName: validTableName,
    Dynamo,
  };

  handler = require('../../../../lambdas/venues/getAllVenues/handler')(
    dependencies
  );
});

afterEach(jest.resetAllMocks);

test('Should return a formatted list of venues', async () => {
  scanMock.mockReturnValue({
    promise: () => {
      return dynamoQueryResponseBuilder([
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
  expect(scanMock).toBeCalledWith({
    TableName: validTableName,
  });
  expect(scanMock).toBeCalledTimes(1);
});

test('Should return an empty list if no venues', async () => {
  scanMock.mockReturnValue({
    promise: () => {
      return dynamoQueryResponseBuilder([]);
    },
  });
  const { statusCode, body } = await handler({});

  expect(statusCode).toBe(200);
  expect(body).toBe(JSON.stringify([]));
});

test('Should return 500 if an error is thrown', async () => {
  scanMock.mockReturnValue({
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
