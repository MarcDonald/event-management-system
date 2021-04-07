const response = {
  headers: { 'content-type': 'application/json' },
  statusCode: 500,
};

const badBodyResponse = {
  ...response,
  statusCode: 400,
  body: JSON.stringify({
    message: `Request must contain a body containing a name and positions`,
  }),
};

// TODO maybe invoke the addVenuePositions lambda instead of doing the same code twice
const addIdToPositions = (positions, generateUUID) => {
  const processedPositions = [];
  positions.forEach((venuePosition) => {
    processedPositions.push({
      positionId: generateUUID().toString(),
      name: venuePosition.name.trim(),
    });
  });
  return processedPositions;
};

module.exports = (dependencies) => async (event) => {
  const { tableName, Dynamo, generateUUID } = dependencies;

  if (!event.body) {
    return badBodyResponse;
  }

  const { name, positions } = JSON.parse(event.body);

  if (!name || !positions) {
    return badBodyResponse;
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
      id: venueId,
      metadata: 'venue',
      name: name.trim(),
      positions: processedPositions,
    };

    const putParams = {
      TableName: tableName,
      Item: itemToAdd,
    };

    await Dynamo.put(putParams).promise();

    return {
      ...response,
      statusCode: 201,
      body: JSON.stringify({
        venueId,
        name,
        positions: processedPositions,
      }),
    };
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
