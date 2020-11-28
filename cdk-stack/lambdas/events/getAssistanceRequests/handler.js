const response = {
  headers: { 'content-type': 'application/json' },
  statusCode: 500,
};

module.exports = (dependencies) => async (event) => {
  const { Dynamo, tableName, metadataIndexName } = dependencies;
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
      IndexName: metadataIndexName,
      KeyConditionExpression: 'metadata = :metadata',
      ExpressionAttributeValues: {
        ':metadata': `assistanceRequest_${eventId}`,
      },
    }).promise();

    const formattedAssistanceRequests = result.Items.map((dbItem) => {
      return {
        assistanceRequestId: dbItem.id,
        position: dbItem.position,
        message: dbItem.message,
        time: dbItem.time,
      };
    });

    return {
      ...response,
      statusCode: 200,
      body: JSON.stringify(formattedAssistanceRequests),
    };
  } catch (e) {
    console.error(`${e.code} - ${e.message}`);

    return {
      ...response,
      body: JSON.stringify({
        message: `Error getting assistance requests for event '${eventId}' - ${e.message}`,
      }),
    };
  }
};
