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
    const result = await Dynamo.delete({
      TableName: tableName,
      Key: {
        id: venueId,
        metadata: 'venue',
      },
    }).promise();
    console.log(JSON.stringify(result));
  } catch (e) {
    console.error(`${e.code} - ${e.message}`);

    return {
      ...response,
      body: JSON.stringify({
        message: `Error deleting venue ${venueId} - ${e.message}`,
      }),
    };
  }

  return {
    ...response,
    statusCode: 204,
  };
};
