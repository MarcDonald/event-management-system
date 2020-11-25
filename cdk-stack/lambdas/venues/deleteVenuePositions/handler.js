const response = {
  headers: { 'content-type': 'application/json' },
  statusCode: 500,
};

const bodyErrorResponse = {
  ...response,
  statusCode: 400,
  body: JSON.stringify({
    message: `Request body must be an array of position IDs`,
  }),
};

module.exports = (dependencies) => async (event) => {
  const { Dynamo, tableName } = dependencies;
  const { venueId } = event.pathParameters;

  if (!event.body) {
    return bodyErrorResponse;
  }

  const positionsToDelete = JSON.parse(event.body);

  if (!Array.isArray(positionsToDelete)) {
    return bodyErrorResponse;
  }

  try {
    const dbQueryResult = await Dynamo.query({
      TableName: tableName,
      KeyConditionExpression: '#venueId = :id',
      ExpressionAttributeNames: {
        '#venueId': 'venueId',
      },
      ExpressionAttributeValues: {
        ':id': venueId,
      },
      Limit: 1,
    }).promise();

    if (dbQueryResult.Items.length === 0) {
      return {
        ...response,
        statusCode: 404,
        body: JSON.stringify({ message: 'Could not find venue with that ID' }),
      };
    }

    const dbVenue = dbQueryResult.Items[0];

    const processedPositions = dbVenue.positions.filter((dbPosition) => {
      return !positionsToDelete.includes(dbPosition.positionId);
    });

    await Dynamo.update({
      TableName: tableName,
      Key: {
        venueId: venueId,
      },
      UpdateExpression: 'set #positions = :newPositions',
      ExpressionAttributeNames: {
        '#positions': 'positions',
      },
      // Adding this condition prevents a new venue being made if the venue doesn't already exist
      ConditionExpression: 'venueId = :venueId',
      ExpressionAttributeValues: {
        ':newPositions': processedPositions,
        ':venueId': venueId,
      },
    }).promise();

    const deletedCount = dbVenue.positions.length - processedPositions.length;

    return {
      ...response,
      statusCode: 200,
      body: JSON.stringify({
        message: `Deleted ${deletedCount} positions from ${venueId} successfully`,
      }),
    };
  } catch (err) {
    console.error(`${err.code} - ${err.message}`);

    return {
      ...response,
      statusCode: 500,
      body: JSON.stringify({
        message: `Error deleting positions from venue - ${err.message}`,
      }),
    };
  }
};
