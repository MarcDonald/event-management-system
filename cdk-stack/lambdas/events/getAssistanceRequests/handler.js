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
        ':metadata': `assistanceRequest`,
      },
    }).promise();

    const formattedAssistanceRequests = result.Items.map((dbItem) => {
      const assistanceRequestId = dbItem.metadata.substring(
        dbItem.metadata.indexOf('_') + 1
      );
      return {
        assistanceRequestId,
        position: dbItem.position,
        message: dbItem.message,
        time: dbItem.time,
        handled: dbItem.handled,
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
