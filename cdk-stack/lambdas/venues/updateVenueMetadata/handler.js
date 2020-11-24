const response = {
  headers: { 'content-type': 'application/json' },
  statusCode: 500,
};

module.exports = (dependencies) => async (event) => {
  const { tableName, Dynamo } = dependencies;

  const { venueId } = event.pathParameters;

  if (!venueId) {
    return {
      ...response,
      statusCode: 400,
      body: JSON.stringify({
        message: `Venue ID must be provided`,
      }),
    };
  }

  if (!event.body) {
    return {
      ...response,
      statusCode: 400,
      body: JSON.stringify({
        message: `Request must contain a body containing a name`,
      }),
    };
  }

  const { name } = JSON.parse(event.body);

  if (!name) {
    return {
      ...response,
      statusCode: 400,
      body: JSON.stringify({
        message: `Request must contain a body containing a name`,
      }),
    };
  }

  // TODO trim name
  try {
    const updateParams = {
      TableName: tableName,
      Key: {
        venueId: venueId,
      },
      UpdateExpression: 'set #name = :name',
      ExpressionAttributeNames: {
        '#name': 'name',
      },
      // Adding this condition prevents a new venue being made if the venue doesn't already exist
      ConditionExpression: 'venueId = :venueId',
      ExpressionAttributeValues: {
        ':name': name,
        ':venueId': venueId,
      },
    };

    await Dynamo.update(updateParams).promise();

    return {
      ...response,
      statusCode: 200,
      body: JSON.stringify({ message: `Successfully updated ${venueId}` }),
    };
  } catch (err) {
    console.error(`${err.code} - ${err.message}`);

    if (err.code === 'ConditionalCheckFailedException') {
      return {
        ...response,
        statusCode: 404,
        body: JSON.stringify({
          message: 'Could not find a venue with that ID',
        }),
      };
    }

    return {
      ...response,
      statusCode: 500,
      body: JSON.stringify({
        message: `Error creating venue - ${err.message}`,
      }),
    };
  }
};
