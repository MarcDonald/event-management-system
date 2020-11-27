const response = {
  headers: { 'content-type': 'application/json' },
  statusCode: 500,
};

module.exports = (dependencies) => async (event) => {
  const { Dynamo, tableName } = dependencies;
  const { venueId } = event.pathParameters;

  if (!venueId) {
    return {
      ...response,
      statusCode: 400,
      body: JSON.stringify({ message: 'Venue ID must be provided' }),
    };
  }

  try {
    const result = await Dynamo.query({
      TableName: tableName,
      KeyConditionExpression: 'id = :id and metadata = :metadata',
      ExpressionAttributeValues: {
        ':id': venueId,
        ':metadata': 'venue',
      },
      Limit: 1,
    }).promise();

    if (result.Items.length === 0) {
      return {
        ...response,
        statusCode: 404,
        body: JSON.stringify({ message: 'Venue could not be found' }),
      };
    }

    const dbItem = result.Items[0];
    const formattedVenue = {
      venueId: dbItem.id,
      name: dbItem.name,
      positions: dbItem.positions,
    };

    return {
      ...response,
      statusCode: 200,
      body: JSON.stringify(formattedVenue),
    };
  } catch (e) {
    console.error(`${e.code} - ${e.message}`);

    return {
      ...response,
      body: JSON.stringify({
        message: `Error getting venue '${venueId}' - ${e.message}`,
      }),
    };
  }
};
