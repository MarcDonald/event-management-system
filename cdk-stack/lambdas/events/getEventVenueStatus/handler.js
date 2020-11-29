const response = {
  headers: { 'content-type': 'application/json' },
  statusCode: 500,
};

module.exports = (dependencies) => async (event) => {
  const { Dynamo, tableName } = dependencies;
  const { eventId } = event.pathParameters;

  if (!eventId) {
    return {
      ...response,
      statusCode: 400,
      body: JSON.stringify({ message: 'Event ID must be provided' }),
    };
  }

  try {
    const result = await Dynamo.query({
      TableName: tableName,
      KeyConditionExpression:
        'id = :eventId and begins_with(metadata, :metadata)',
      ExpressionAttributeValues: {
        ':eventId': eventId,
        ':metadata': 'statusUpdate',
      },
      ScanIndexForward: false,
      Limit: 1,
    }).promise();

    if (result.Items.length === 0) {
      return {
        ...response,
        statusCode: 200,
        body: JSON.stringify({
          venueStatus: 'Low',
        }),
      };
    }

    const dbItem = result.Items[0];

    return {
      ...response,
      statusCode: 200,
      body: JSON.stringify({ venueStatus: dbItem.venueStatus }),
    };
  } catch (e) {
    console.error(`${e.code} - ${e.message}`);

    return {
      ...response,
      body: JSON.stringify({
        message: `Error getting event venue status of ${eventId} - ${e.message}`,
      }),
    };
  }
};
