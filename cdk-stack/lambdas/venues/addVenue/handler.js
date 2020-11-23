const response = {
  headers: { 'content-type': 'application/json' },
  statusCode: 500,
};

const addIdToPositions = (positions, generateUUID) => {
  const processedPositions = [];
  positions.forEach((eventPosition) => {
    processedPositions.push({
      positionId: generateUUID().toString(),
      name: eventPosition.name,
    });
  });
  return processedPositions;
};

module.exports = (dependencies) => async (event) => {
  const { tableName, Dynamo, generateUUID } = dependencies;

  if (!event.body) {
    return {
      ...response,
      statusCode: 400,
      body: JSON.stringify({
        message: `Request must contain a body containing a name, status, and positions`,
      }),
    };
  }

  const { name, status, positions } = JSON.parse(event.body);

  if (!name || !status || !positions) {
    return {
      ...response,
      statusCode: 400,
      body: JSON.stringify({
        message: `Request must contain a body containing a name, status, and positions`,
      }),
    };
  }

  if (positions.length === 0) {
    return {
      ...response,
      statusCode: 400,
      body: JSON.stringify({
        message: `Venue must have at least one position`,
      }),
    };
  }

  try {
    const venueId = generateUUID().toString();

    const processedPositions = addIdToPositions(positions, generateUUID);

    const itemToAdd = {
      venueId,
      name,
      status,
      positions: processedPositions,
    };

    const putParams = {
      TableName: tableName,
      Item: itemToAdd,
    };

    await Dynamo.put(putParams).promise();

    return { ...response, statusCode: 201, body: JSON.stringify(itemToAdd) };
  } catch (err) {
    console.error(`${err.code} - ${err.message}`);
    return {
      ...response,
      statusCode: 500,
      body: JSON.stringify({
        message: `Error creating venue - ${err.message}`,
      }),
    };
  }
};
