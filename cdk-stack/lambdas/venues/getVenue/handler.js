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
      KeyConditionExpression: '#venueId = :id',
      ExpressionAttributeNames: {
        '#venueId': 'venueId',
      },
      ExpressionAttributeValues: {
        ':id': venueId,
      },
    }).promise();

    if (result.Items.length === 0) {
      return {
        ...response,
        statusCode: 404,
        body: JSON.stringify({ message: 'Venue could not be found' }),
      };
    }

    const formattedVenue = result.Items[0];

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
