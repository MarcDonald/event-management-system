const response = {
  headers: { 'content-type': 'application/json' },
  statusCode: 500,
};

module.exports = (dependencies) => async (event) => {
  const { Dynamo, connectionTableName } = dependencies;
  const putParams = {
    TableName: connectionTableName,
    Item: {
      connectionId: event.requestContext.connectionId,
      websocket: 'venueStatus',
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
