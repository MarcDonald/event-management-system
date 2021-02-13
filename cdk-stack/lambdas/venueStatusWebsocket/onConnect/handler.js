const response = {
  headers: { 'content-type': 'application/json' },
  statusCode: 500,
};

module.exports = (dependencies) => async (event) => {
  const { Dynamo, connectionTableName } = dependencies;

  if (!event.queryStringParameters || !event.queryStringParameters.eventId) {
    return {
      ...response,
      statusCode: 400,
      body: 'Failed to connect: Must include an eventId parameter',
    };
  }

  const putParams = {
    TableName: connectionTableName,
    Item: {
      websocket: 'venueStatus',
      connectionId: event.requestContext.connectionId,
      eventId: event.queryStringParameters.eventId,
    },
  };

  try {
    await Dynamo.put(putParams).promise();
    return { ...response, statusCode: 200, body: 'Connected' };
  } catch (err) {
    return {
      ...response,
      statusCode: 500,
      body: 'Failed to connect: ' + err.message,
    };
  }
};
