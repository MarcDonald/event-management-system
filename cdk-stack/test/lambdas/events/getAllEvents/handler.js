const {
  awsUtils,
  eventUtils,
  venueUtils,
  staffUtils,
} = require('../../../testUtils');
const { MockAWSError, dynamoQueryResponseBuilder } = awsUtils;
const { validTableName, validAreaOfSupervision } = eventUtils.testValues;
const {
  validVenueName,
  validVenueId,
  validPositionId,
  validPositionName,
} = venueUtils;
const {
  validUsername,
  validSub,
  validRole,
  validGivenName,
  validFamilyName,
} = staffUtils;
const { validMetadataIndexName } = awsUtils.testValues;

let handler;
const queryMock = jest.fn();

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

const validStart = 1606340678;
const validEnd = 1606340800;

beforeEach(() => {
  const Dynamo = {
    query: queryMock,
  };

  const dependencies = {
    Dynamo,
    tableName: validTableName,
    metadataIndexName: validMetadataIndexName,
  };

  handler = require('../../../../lambdas/events/getAllEvents/handler')(
    dependencies
  );
});

afterEach(jest.resetAllMocks);

test('Should return a formatted list of events', async () => {
  queryMock.mockReturnValue({
    promise: () => {
      return dynamoQueryResponseBuilder([
        {
          id: 'uuid',
          metadata: 'event',
          venue: validVenue,
          start: validStart,
          end: validEnd,
          supervisors: validSupervisors,
          staff: validStaff,
        },
      ]);
    },
  });

  const { statusCode, body } = await handler({});

  expect(statusCode).toBe(200);
  expect(body).toBe(
    JSON.stringify([
      {
        eventId: 'uuid',
        venue: validVenue,
        start: validStart,
        end: validEnd,
        supervisors: validSupervisors,
        staff: validStaff,
      },
    ])
  );
  expect(queryMock).toBeCalledWith({
    TableName: validTableName,
    IndexName: validMetadataIndexName,
    KeyConditionExpression: 'metadata = :metadata',
    ExpressionAttributeValues: {
      ':metadata': 'event',
    },
  });
  expect(queryMock).toBeCalledTimes(1);
});

test('Should return an empty list if no events', async () => {
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
      message: `Error getting all events - An unknown error.`,
    })
  );
});
