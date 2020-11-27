const response = {
  headers: { 'content-type': 'application/json' },
  statusCode: 500,
};

module.exports = (dependencies) => async (event) => {
  const {
    Dynamo,
    tableName,
    metadataIndexName,
  } = dependencies;

  try {
    const result = await Dynamo.query({
      TableName: tableName,
      IndexName: metadataIndexName,
      KeyConditionExpression: 'metadata = :metadata',
      ExpressionAttributeValues: {
        ':metadata': 'event',
      },
    }).promise();

    const formattedEventList = result.Items.map((dbEvent) => {
      const { name, venue, start, end, supervisors, staff } = dbEvent;
      return {
        eventId: dbEvent.id,
        name,
        venue,
        start,
        end,
        supervisors,
        staff,
      };
    });

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
        message: `Error getting all events - ${e.message}`,
      }),
    };
  }
};
