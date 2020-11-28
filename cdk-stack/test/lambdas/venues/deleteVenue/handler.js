const { awsUtils, venueUtils } = require('../../../testUtils');
const { MockAWSError } = awsUtils;
const { validTableName } = awsUtils.testValues;
const { validVenueId } = venueUtils.testValues;

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
  handler = require('../../../../lambdas/venues/deleteVenue/handler')(
    dependencies
  );
});

afterEach(jest.resetAllMocks);

test('Should return 204 when a user is deleted successfully', async () => {
  const event = {
    pathParameters: {
      venueId: validVenueId,
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
      id: validVenueId,
      metadata: 'venue',
    },
  });
});

test('Should return 400 when no username is supplied', async () => {
  const event = {
    pathParameters: {},
  };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(JSON.stringify({ message: 'Venue ID must be provided' }));
  expect(deleteMock).toBeCalledTimes(0);
});

test('Should return 500 when another error is thrown', async () => {
  const event = {
    pathParameters: {
      venueId: validVenueId,
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
      message: `Error deleting venue ${validVenueId} - An unknown error.`,
    })
  );
  expect(deleteMock).toBeCalledTimes(1);
  expect(deleteMock).toBeCalledWith({
    TableName: validTableName,
    Key: { id: validVenueId, metadata: 'venue' },
  });
});
