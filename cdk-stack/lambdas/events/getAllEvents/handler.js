const response = {
  headers: { 'content-type': 'application/json' },
  statusCode: 500,
};

module.exports = (dependencies) => async (event) => {
  const { Dynamo, tableName, eventMetadataIndexName } = dependencies;

  try {
    const result = await Dynamo.query({
      TableName: tableName,
      IndexName: eventMetadataIndexName,
      KeyConditionExpression: '#metadata = :metadata',
      ExpressionAttributeNames: {
        '#metadata': 'metadata',
      },
      ExpressionAttributeValues: {
        ':metadata': 'event',
      },
    }).promise();

    const eventList = result.Items;

    return {
      ...response,
      statusCode: 200,
      body: JSON.stringify(eventList),
    };
  } catch (e) {
    console.error(`${e.code} - ${e.message}`);

    return {
      ...response,
      body: JSON.stringify({
        message: `Error getting all events - ${e.message}`,
      }),
    };
  }
};
