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

  const { name, venue, start, end, supervisors, staff } = JSON.parse(
    event.body
  );

  // TODO trim name and position names
  // TODO verify all positions and staff have IDs
  if (!name || !venue || !start || !end || !supervisors || !staff) {
    return badBodyResponse;
  }

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
    const itemToAdd = {
      eventId,
      name,
      metadata: 'event',
      venue,
      start,
      end,
      supervisors,
      staff,
    };

    const putParams = {
      TableName: tableName,
      Item: itemToAdd,
    };

    await Dynamo.put(putParams).promise();

    return {
      ...response,
      statusCode: 201,
      body: JSON.stringify(itemToAdd),
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
