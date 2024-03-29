const response = {
  headers: { 'content-type': 'application/json' },
  statusCode: 500,
};

const bodyErrorResponse = {
  ...response,
  statusCode: 400,
  body: JSON.stringify({
    message: `Request body must be an array of positions`,
  }),
};

module.exports = (dependencies) => async (event) => {
  const { Dynamo, tableName } = dependencies;
  const { venueId } = event.pathParameters;

  if (!event.body) {
    return bodyErrorResponse;
  }

  const positionsToUpdate = JSON.parse(event.body);

  if (!Array.isArray(positionsToUpdate)) {
    return bodyErrorResponse;
  }

  try {
    const dbQueryResult = await Dynamo.query({
      TableName: tableName,
      KeyConditionExpression: 'id = :id and metadata = :metadata',
      ExpressionAttributeValues: {
        ':id': venueId,
        ':metadata': 'venue',
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

    const { positions } = dbVenue;

    // Loop through positions that have been sent to be updated
    // Find the position in the query result and update the name
    positionsToUpdate.forEach((positionToUpdate) => {
      if (positionToUpdate.name) {
        const dbPosition = positions.find((dbPosition) => {
          return dbPosition.positionId === positionToUpdate.positionId;
        });
        // If a position has been sent by the user that does not exist in the database, it is ignored
        if (dbPosition) {
          dbPosition.name = positionToUpdate.name;
        }
      } else {
        throw Error('Position without a name');
      }
    });

    await Dynamo.update({
      TableName: tableName,
      Key: {
        id: venueId,
        metadata: 'venue',
      },
      UpdateExpression: 'set #positions = :newPositions',
      ExpressionAttributeNames: {
        '#positions': 'positions',
      },
      // Adding this condition prevents a new venue being made if the venue doesn't already exist
      ConditionExpression: 'id = :id and metadata = :metadata',
      ExpressionAttributeValues: {
        ':newPositions': positions,
        ':id': venueId,
        ':metadata': 'venue',
      },
    }).promise();

    return {
      ...response,
      statusCode: 201,
      body: JSON.stringify({
        message: `Updated ${positionsToUpdate.length} positions of ${venueId} successfully`,
      }),
    };
  } catch (err) {
    console.error(`${err.code} - ${err.message}`);

    if (err.message === 'Position without a name') {
      return {
        ...response,
        statusCode: 400,
        body: JSON.stringify({ message: 'All positions must have a name' }),
      };
    }

    return {
      ...response,
      statusCode: 500,
      body: JSON.stringify({
        message: `Error updating positions of venue - ${err.message}`,
      }),
    };
  }
};
