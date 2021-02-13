const response = {
  headers: { 'content-type': 'application/json' },
  statusCode: 500,
};

module.exports = (dependencies) => async (event) => {
  const { Dynamo, connectionTableName } = dependencies;
  const deleteParams = {
    TableName: connectionTableName,
    Key: {
      connectionId: event.requestContext.connectionId,
      websocket: 'venueStatus',
    },
  };

  try {
    await Dynamo.delete(deleteParams).promise();
    return { ...response, statusCode: 200, body: 'Disconnected' };
  } catch (err) {
    return {
      ...response,
      statusCode: 500,
      body: `Failed to disconnect: ${err.message}`,
    };
  }
};
