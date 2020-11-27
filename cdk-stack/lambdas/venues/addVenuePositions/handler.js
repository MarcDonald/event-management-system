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

const addIdToPositions = (positions, generateUUID) => {
  const processedPositions = [];
  positions.forEach((venuePosition) => {
    if (venuePosition.name) {
      processedPositions.push({
        positionId: generateUUID().toString(),
        name: venuePosition.name,
      });
    } else {
      throw Error('Position without a name');
    }
  });
  return processedPositions;
};

module.exports = (dependencies) => async (event) => {
  const { tableName, Dynamo, generateUUID } = dependencies;
  const { venueId } = event.pathParameters;

  if (!event.body) {
    return bodyErrorResponse;
  }

  const positions = JSON.parse(event.body);

  if (!Array.isArray(positions)) {
    return bodyErrorResponse;
  }

  try {
    const processedPositions = addIdToPositions(positions, generateUUID);

    const updateParams = {
      TableName: tableName,
      Key: {
        id: venueId,
        metadata: 'venue',
      },
      UpdateExpression:
        'set #positions = list_append(#positions, :newPositions)',
      ExpressionAttributeNames: {
        '#positions': 'positions',
      },
      // Adding this condition prevents a new venue being made if the venue doesn't already exist
      ConditionExpression: 'id = :id and metadata = :metadata',
      ExpressionAttributeValues: {
        ':newPositions': processedPositions,
        ':id': venueId,
        ':metadata': 'venue',
      },
    };

    await Dynamo.update(updateParams).promise();

    const addedCount = processedPositions.length;

    return {
      ...response,
      statusCode: 201,
      body: JSON.stringify({
        message: `Added ${addedCount} positions to ${venueId} successfully`,
      }),
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
        message: `Error adding positions to venue - ${err.message}`,
      }),
    };
  }
};
