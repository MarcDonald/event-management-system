const response = {
  headers: { 'content-type': 'application/json' },
  statusCode: 500,
};

const badBodyResponse = {
  ...response,
  statusCode: 400,
  body: JSON.stringify({
    message: `Request body must be an array of supervisors and their assigned positions`,
  }),
};

const notFoundResponse = {
  ...response,
  statusCode: 404,
  body: JSON.stringify({
    message: 'Could not find an event with that ID',
  }),
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

  const supervisors = JSON.parse(event.body);

  if (!Array.isArray(supervisors)) {
    return badBodyResponse;
  }

  try {
    const updateParams = {
      TableName: tableName,
      Key: {
        id: eventId,
        metadata: 'event',
      },
      UpdateExpression: 'set #supervisors = :supervisors',
      ConditionExpression: 'id = :id and metadata = :metadata',
      ExpressionAttributeNames: {
        '#supervisors': 'supervisors',
      },
      ExpressionAttributeValues: {
        ':supervisors': supervisors,
        ':id': eventId,
        ':metadata': 'event',
      },
    };

    await Dynamo.update(updateParams).promise();

    return {
      ...response,
      statusCode: 200,
      body: JSON.stringify({
        message: `Successfully updated supervisors of ${eventId}`,
      }),
    };
  } catch (err) {
    console.error(`${err.code} - ${err.message}`);

    if (
      err.code === 'ConditionalCheckFailedException' ||
      err.message === 'Event not found'
    ) {
      return notFoundResponse;
    }

    return {
      ...response,
      statusCode: 500,
      body: JSON.stringify({
        message: `Error updating supervisors of event - ${err.message}`,
      }),
    };
  }
};
