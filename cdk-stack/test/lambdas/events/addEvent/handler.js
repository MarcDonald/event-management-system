const {
  awsUtils,
  eventUtils,
  venueUtils,
  staffUtils,
} = require('../../../testUtils');
const { MockAWSError } = awsUtils;

const {
  validEventName,
  validAreaOfSupervision,
  validTableName,
  validStart,
  validEnd,
  invalidEnd,
} = eventUtils.testValues;
const {
  validVenueName,
  validVenueId,
  validPositionName,
  validPositionId,
} = venueUtils.testValues;
const {
  validUsername,
  validSub,
  validRole,
  validGivenName,
  validFamilyName,
} = staffUtils.testValues;

const validVenue = {
  name: validVenueName,
  venueId: validVenueId,
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
};

const validSupervisors = [
  {
    staffMember: {
      username: validUsername + '1',
      sub: validSub + '1',
      role: validRole + '1',
      givenName: validGivenName + '1',
      familyName: validFamilyName + '1',
    },
    areaOfSupervision: validAreaOfSupervision,
  },
];

const validStaff = [
  {
    staffMember: {
      username: validUsername + '2',
      sub: validSub + '2',
      role: validRole + '2',
      givenName: validGivenName + '2',
      familyName: validFamilyName + '2',
    },
    position: {
      positionId: validPositionId + '1',
      name: validPositionName + '1',
    },
  },
];

let handler;
const putMock = jest.fn();
const generateUUIDMock = jest.fn();

beforeEach(() => {
  const Dynamo = {
    put: putMock,
  };

  const dependencies = {
    generateUUID: generateUUIDMock,
    tableName: validTableName,
    Dynamo,
  };
  handler = require('../../../../lambdas/events/addEvent/handler')(
    dependencies
  );
});

afterEach(jest.resetAllMocks);

test('Should add event when provided with a valid event', async () => {
  const eventBody = JSON.stringify({
    name: validEventName,
    venue: validVenue,
    start: validStart,
    end: validEnd,
    supervisors: validSupervisors,
    staff: validStaff,
  });
  const event = { body: eventBody };

  generateUUIDMock.mockReturnValue('uuid');

  putMock.mockReturnValue({
    promise: () => {},
  });

  const { statusCode, body } = await handler(event);

  expect(generateUUIDMock).toBeCalledTimes(1);
  expect(putMock).toBeCalledWith({
    TableName: validTableName,
    Item: {
      id: 'uuid',
      metadata: 'event',
      name: validEventName,
      venue: validVenue,
      start: validStart,
      end: validEnd,
      supervisors: validSupervisors,
      staff: validStaff,
    },
  });
  expect(putMock).toBeCalledTimes(1);

  expect(statusCode).toBe(201);
  expect(body).toBe(
    JSON.stringify({
      eventId: 'uuid',
      name: validEventName,
      venue: validVenue,
      start: validStart,
      end: validEnd,
      supervisors: validSupervisors,
      staff: validStaff,
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
        'Request must contain a body containing a name, a venue, a start time, an end time, a list of supervisors, and a list of staff',
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
        'Request must contain a body containing a name, a venue, a start time, an end time, a list of supervisors, and a list of staff',
    })
  );
});

test('Should return 400 when called with an event with no name', async () => {
  const eventBody = JSON.stringify({
    venue: validVenue,
    start: validStart,
    end: validEnd,
    supervisors: validSupervisors,
    staff: validStaff,
  });
  const event = { body: eventBody };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message:
        'Request must contain a body containing a name, a venue, a start time, an end time, a list of supervisors, and a list of staff',
    })
  );
});

test('Should return 400 when called with an event with no venue', async () => {
  const eventBody = JSON.stringify({
    name: validEventName,
    start: validStart,
    end: validEnd,
    supervisors: validSupervisors,
    staff: validStaff,
  });
  const event = { body: eventBody };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message:
        'Request must contain a body containing a name, a venue, a start time, an end time, a list of supervisors, and a list of staff',
    })
  );
});

test('Should return 400 when called with an event with no start', async () => {
  const eventBody = JSON.stringify({
    name: validEventName,
    venue: validVenue,
    end: validEnd,
    supervisors: validSupervisors,
    staff: validStaff,
  });
  const event = { body: eventBody };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message:
        'Request must contain a body containing a name, a venue, a start time, an end time, a list of supervisors, and a list of staff',
    })
  );
});

test('Should return 400 when called with an event with no end', async () => {
  const eventBody = JSON.stringify({
    name: validEventName,
    venue: validVenue,
    start: validStart,
    supervisors: validSupervisors,
    staff: validStaff,
  });
  const event = { body: eventBody };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message:
        'Request must contain a body containing a name, a venue, a start time, an end time, a list of supervisors, and a list of staff',
    })
  );
});

test('Should return 400 when called with an event with no supervisors array', async () => {
  const eventBody = JSON.stringify({
    name: validEventName,
    venue: validVenue,
    start: validStart,
    end: validEnd,
    staff: validStaff,
  });
  const event = { body: eventBody };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message:
        'Request must contain a body containing a name, a venue, a start time, an end time, a list of supervisors, and a list of staff',
    })
  );
});

test('Should return 400 when called with an event with no staff array', async () => {
  const eventBody = JSON.stringify({
    name: validEventName,
    venue: validVenue,
    start: validStart,
    end: validEnd,
    supervisors: validSupervisors,
  });
  const event = { body: eventBody };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message:
        'Request must contain a body containing a name, a venue, a start time, an end time, a list of supervisors, and a list of staff',
    })
  );
});

test('Should return 400 when called with an event with no supervisors', async () => {
  const eventBody = JSON.stringify({
    name: validEventName,
    venue: validVenue,
    start: validStart,
    end: validEnd,
    supervisors: [],
    staff: validStaff,
  });
  const event = { body: eventBody };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message: 'Event must have at least one supervisor',
    })
  );
});

test('Should return 400 when called with an event with no staff', async () => {
  const eventBody = JSON.stringify({
    name: validEventName,
    venue: validVenue,
    start: validStart,
    end: validEnd,
    supervisors: validSupervisors,
    staff: [],
  });
  const event = { body: eventBody };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message: 'Event must have at least one staff member',
    })
  );
});

test('Should return 400 when end date is before start date', async () => {
  const eventBody = JSON.stringify({
    name: validEventName,
    venue: validVenue,
    start: validStart,
    end: invalidEnd,
    supervisors: validSupervisors,
    staff: validStaff,
  });
  const event = { body: eventBody };

  const { statusCode, body } = await handler(event);

  expect(statusCode).toBe(400);
  expect(body).toBe(
    JSON.stringify({
      message: 'Event cannot start before it ends',
    })
  );
});

test('Should return 500 when another error is thrown', async () => {
  const eventBody = JSON.stringify({
    name: validEventName,
    venue: validVenue,
    start: validStart,
    end: validEnd,
    supervisors: validSupervisors,
    staff: validStaff,
  });
  const event = { body: eventBody };

  generateUUIDMock.mockReturnValue('uuid');

  putMock.mockImplementation(() => {
    throw new MockAWSError('Error message', 'UnknownException');
  });

  const { statusCode, body } = await handler(event);

  expect(generateUUIDMock).toBeCalledTimes(1);
  expect(putMock).toBeCalledWith({
    TableName: validTableName,
    Item: {
      id: 'uuid',
      name: validEventName,
      metadata: 'event',
      venue: validVenue,
      start: validStart,
      end: validEnd,
      supervisors: validSupervisors,
      staff: validStaff,
    },
  });
  expect(putMock).toBeCalledTimes(1);

  expect(statusCode).toBe(500);
  expect(body).toBe(
    JSON.stringify({ message: 'Error creating event - Error message' })
  );
});
