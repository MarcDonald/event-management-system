const response = {
  headers: { 'content-type': 'application/json' },
  statusCode: 500,
};

const badBodyResponse = {
  ...response,
  statusCode: 400,
  body: JSON.stringify({
    message: `Request must contain a body containing a name, a venue, a start time, an end time, a list of supervisors, and a list of staff`,
  }),
};

module.exports = (dependencies) => async (event) => {
  const { tableName, generateUUID, Dynamo } = dependencies;

  if (!event.body) {
    return badBodyResponse;
  }

  const parsedBody = JSON.parse(event.body);
  const { name, venue, supervisors, staff } = parsedBody;

  if (
    !name ||
    !venue ||
    !parsedBody.start ||
    !parsedBody.end ||
    !supervisors ||
    !staff
  ) {
    return badBodyResponse;
  }

  // Rounding the time down in case there's a decimal point
  const start = Math.floor(parsedBody.start);
  const end = Math.floor(parsedBody.end);

  if (supervisors.length === 0) {
    return {
      ...response,
      statusCode: 400,
      body: JSON.stringify({
        message: `Event must have at least one supervisor`,
      }),
    };
  }

  if (staff.length === 0) {
    return {
      ...response,
      statusCode: 400,
      body: JSON.stringify({
        message: `Event must have at least one staff member`,
      }),
    };
  }

  if (start > end) {
    return {
      ...response,
      statusCode: 400,
      body: JSON.stringify({ message: 'Event cannot start before it ends' }),
    };
  }

  try {
    const eventId = generateUUID().toString();
    const putParams = {
      TableName: tableName,
      Item: {
        id: eventId,
        name: name.trim(),
        metadata: 'event',
        venue,
        start,
        end,
        supervisors,
        staff,
      },
    };

    await Dynamo.put(putParams).promise();

    return {
      ...response,
      statusCode: 201,
      body: JSON.stringify({
        eventId,
        name,
        venue,
        start,
        end,
        supervisors,
        staff,
      }),
    };
  } catch (err) {
    console.error(`${err.code} - ${err.message}`);
    return {
      ...response,
      statusCode: 500,
      body: JSON.stringify({
        message: `Error creating event - ${err.message}`,
      }),
    };
  }
};
