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
      KeyConditionExpression: 'id = :eventId and metadata = :metadata',
      ExpressionAttributeValues: {
        ':eventId': eventId,
        ':metadata': 'event',
      },
      Limit: 1,
    }).promise();

    if (result.Items.length === 0) {
      return {
        ...result,
        statusCode: 404,
        body: JSON.stringify({
          message: 'Event with that ID could not be found',
        }),
      };
    }

    const dbItem = result.Items[0];
    const formattedEventList = {
      eventId: dbItem.id,
      name: dbItem.name,
      venue: dbItem.venue,
      start: dbItem.start,
      end: dbItem.end,
      supervisors: dbItem.supervisors,
      staff: dbItem.staff,
    };

    return {
      ...response,
      statusCode: 200,
      body: JSON.stringify(formattedEventList),
    };
  } catch (e) {
    console.error(`${e.code} - ${e.message}`);

    return {
      ...response,
      body: JSON.stringify({
        message: `Error getting event information ${eventId} - ${e.message}`,
      }),
    };
  }
};
