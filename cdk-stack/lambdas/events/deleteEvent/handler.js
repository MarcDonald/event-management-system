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
    const result = await Dynamo.delete({
      TableName: tableName,
      Key: {
        eventId: eventId,
        // TODO in the future we probably want to remove all references to the event no matter what the metadata is
        metadata: 'event',
      },
    }).promise();
    console.log(JSON.stringify(result));
  } catch (e) {
    console.error(`${e.code} - ${e.message}`);

    return {
      ...response,
      body: JSON.stringify({
        message: `Error deleting event ${eventId} - ${e.message}`,
      }),
    };
  }

  return {
    ...response,
    statusCode: 204,
  };
};
