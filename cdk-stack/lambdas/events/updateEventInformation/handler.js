const response = {
  headers: { 'content-type': 'application/json' },
  statusCode: 500,
};

const badBodyResponse = {
  ...response,
  statusCode: 400,
  body: JSON.stringify({
    message: `Request must contain a body containing a name, start, or end`,
  }),
};

const notFoundResponse = {
  ...response,
  statusCode: 404,
  body: JSON.stringify({
    message: 'Could not find an event with that ID',
  }),
};

const verifyStartAndEndAgainstDb = async (
  Dynamo,
  tableName,
  eventId,
  start,
  end
) => {
  const result = await Dynamo.query({
    TableName: tableName,
    KeyConditionExpression: '#eventId = :eventId and #metadata = :metadata',
    ExpressionAttributeNames: {
      '#metadata': 'metadata',
      '#eventId': 'eventId',
    },
    ExpressionAttributeValues: {
      ':metadata': 'event',
      ':eventId': eventId,
    },
  }).promise();

  if (result.Items.length === 0) {
    throw new Error('Event not found');
  }

  const dbEvent = result.Items[0];

  if (start && !end) {
    if (dbEvent.end < start) {
      throw new Error('Bad Start');
    }
  }

  if (!start && end) {
    if (end < dbEvent.start) {
      throw new Error('Bad End');
    }
  }
};

module.exports = (dependencies) => async (event) => {
  const { tableName, Dynamo } = dependencies;

  const { eventId } = event.pathParameters;

  if (!eventId) {
    return {
      ...response,
      statusCode: 400,
      body: JSON.stringify({
        message: `Event ID must be provided`,
      }),
    };
  }

  if (!event.body) {
    return badBodyResponse;
  }

  const { name, start, end } = JSON.parse(event.body);

  if (!name && !start && !end) {
    return badBodyResponse;
  }

  // TODO trim name
  try {
    if (start && end) {
      if (start > end) {
        return {
          ...response,
          statusCode: 400,
          body: JSON.stringify({
            message: 'Event cannot start before it ends',
          }),
        };
      }
    } else if (start || end) {
      await verifyStartAndEndAgainstDb(Dynamo, tableName, eventId, start, end);
    }

    let setActions = [];
    let expressionAttributeValues = {
      ':eventId': eventId,
    };
    let expressionAttributeNames = {
      '#eventId': 'eventId',
    };

    if (name) {
      setActions.push('#name = :name');
      expressionAttributeValues[':name'] = name;
      expressionAttributeNames['#name'] = 'name';
    }
    if (start) {
      setActions.push('#start = :start');
      expressionAttributeValues[':start'] = start;
      expressionAttributeNames['#start'] = 'start';
    }
    if (end) {
      setActions.push('#end = :end');
      expressionAttributeValues[':end'] = end;
      expressionAttributeNames['#end'] = 'end';
    }

    const updateExpression = `set ${setActions.join(', ')}`;

    const updateParams = {
      TableName: tableName,
      Key: {
        eventId: eventId,
        metadata: 'event',
      },
      UpdateExpression: updateExpression,
      // Adding this condition prevents a new event being made if the event doesn't already exist
      ConditionExpression: '#eventId = :eventId',
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    };

    await Dynamo.update(updateParams).promise();

    return {
      ...response,
      statusCode: 200,
      body: JSON.stringify({ message: `Successfully updated ${eventId}` }),
    };
  } catch (err) {
    console.error(`${err.code} - ${err.message}`);

    if (
      err.code === 'ConditionalCheckFailedException' ||
      err.message === 'Event not found'
    ) {
      return notFoundResponse;
    }

    if (err.message === 'Bad Start' || err.message === 'Bad End') {
      return {
        ...response,
        statusCode: 400,
        body: JSON.stringify({
          message: `Event cannot end before it starts`,
        }),
      };
    }

    return {
      ...response,
      statusCode: 500,
      body: JSON.stringify({
        message: `Error updating event information - ${err.message}`,
      }),
    };
  }
};
