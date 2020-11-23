const MockAWSError = require('../../../testUtils/MockAWSError');
const { testValues, validStatuses } = require('../../../testUtils/venueUtils');
const {
  validTableName,
  validVenueName,
  invalidVenueName,
  validPositionName,
} = testValues;
const { ALL_OK, YELLOW_ALERT, RED_ALERT } = validStatuses;

let generateUUIDMock = jest.fn();
let putMock = jest.fn();

let handler;

beforeEach(() => {
  const Dynamo = {
    put: putMock,
  };

  const dependencies = {
    generateUUID: generateUUIDMock,
    tableName: validTableName,
    Dynamo,
  };

  handler = require('../../../../lambdas/venues/addVenue/handler')(
    dependencies
  );
});

afterEach(jest.resetAllMocks);

test('Should create venue and return formatted venue object when provided with a valid event', async () => {
  const eventBody = JSON.stringify({
    name: validVenueName,
    status: ALL_OK,
    positions: [
      {
        name: validPositionName + '1',
      },
      {
        name: validPositionName + '2',
      },
    ],
  });
  const event = { body: eventBody };

  generateUUIDMock
    // UUID generated for venue
    .mockReturnValueOnce('uuid1')
    // UUID generated for position 1
    .mockReturnValueOnce('uuid2')
    // UUID generated for position 2
    .mockReturnValueOnce('uuid3')
    // Default
    .mockReturnValue('uuid');

  putMock.mockReturnValue({
    promise: () => {},
  });

  const { statusCode, body } = await handler(event);

  expect(generateUUIDMock).toBeCalledTimes(3);
  expect(putMock).toBeCalledWith({
    TableName: testValues.validTableName,
    Item: {
      venueId: 'uuid1',
      name: validVenueName,
      status: ALL_OK,
      positions: [
        {
          positionId: 'uuid2',
          name: validPositionName + '1',
        },
        {
          positionId: 'uuid3',
          name: validPositionName + '2',
        },
      ],
    },
  });
  expect(putMock).toBeCalledTimes(1);

  expect(statusCode).toBe(201);
  expect(body).toBe(
    JSON.stringify({
      venueId: 'uuid1',
      name: validVenueName,
      status: ALL_OK,
      positions: [
        {
          positionId: 'uuid2',
          name: validPositionName + '1',
        },
        {
          positionId: 'uuid3',
          name: validPositionName + '2',
        },
      ],
    })
  );
});

test('Should return 400 when called with an event with no body', async () => {
  const event = {};

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message:
        'Request must contain a body containing a name, status, and positions',
    })
  );
});

test('Should return 400 when called with an event with an empty body', async () => {
  const event = { body: '' };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message:
        'Request must contain a body containing a name, status, and positions',
    })
  );
});

test('Should return 400 when called with an event with no name', async () => {
  const eventBody = JSON.stringify({
    status: ALL_OK,
    positions: [{ name: validPositionName }],
  });
  const event = { body: eventBody };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message:
        'Request must contain a body containing a name, status, and positions',
    })
  );
});

test('Should return 400 when called with an event with no status', async () => {
  const eventBody = JSON.stringify({
    name: validVenueName,
    positions: [{ name: validPositionName }],
  });
  const event = { body: eventBody };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message:
        'Request must contain a body containing a name, status, and positions',
    })
  );
});

test('Should return 400 when called with an event with no position array', async () => {
  const eventBody = JSON.stringify({
    name: validVenueName,
    status: ALL_OK,
  });
  const event = { body: eventBody };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message:
        'Request must contain a body containing a name, status, and positions',
    })
  );
});

test('Should return 400 when called with an event with empty position array', async () => {
  const eventBody = JSON.stringify({
    name: validVenueName,
    status: ALL_OK,
    positions: [],
  });
  const event = { body: eventBody };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message: 'Venue must have at least one position',
    })
  );
});

test('Should return 500 when another error is thrown', async () => {
  const eventBody = JSON.stringify({
    name: validVenueName,
    status: ALL_OK,
    positions: [{ name: validPositionName }],
  });
  const event = { body: eventBody };

  putMock.mockImplementation(() => {
    throw new MockAWSError('Error message', 'UnknownException');
  });

  generateUUIDMock.mockReturnValue('uuid');

  const { statusCode, body } = await handler(event);

  expect(generateUUIDMock).toBeCalledTimes(2);
  expect(putMock).toBeCalledWith({
    TableName: testValues.validTableName,
    Item: {
      venueId: 'uuid',
      name: validVenueName,
      status: ALL_OK,
      positions: [
        {
          positionId: 'uuid',
          name: validPositionName,
        },
      ],
    },
  });
  expect(putMock).toBeCalledTimes(1);

  expect(statusCode).toBe(500);
  expect(body).toBe(
    JSON.stringify({ message: 'Error creating venue - Error message' })
  );
});