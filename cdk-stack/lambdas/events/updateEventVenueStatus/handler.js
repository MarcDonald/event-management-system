const response = {
  headers: { 'content-type': 'application/json' },
  statusCode: 500,
};

const badBodyResponse = {
  ...response,
  statusCode: 400,
  body: JSON.stringify({
    message: 'Request must contain a body containing a venue status',
  }),
};

const postToWebsocket = async ({
  ApiGatewayManagementApi,
  Dynamo,
  connectionTableName,
  eventId,
  time,
  venueStatus,
}) => {
  const connections = await Dynamo.query({
    TableName: connectionTableName,
    KeyConditionExpression: 'websocket = :websocket',
    FilterExpression: 'eventId = :eventId',
    ExpressionAttributeValues: {
      ':websocket': 'venueStatus',
      ':eventId': eventId,
    },
  }).promise();

  const postCalls = connections.Items.map(async ({ connectionId }) => {
    try {
      await ApiGatewayManagementApi.postToConnection({
        ConnectionId: connectionId,
        Data: JSON.stringify({ venueStatus, time }),
      }).promise();
    } catch (e) {
      if (e.statusCode === 410) {
        console.log(`Found stale connection, deleting ${connectionId}`);
        await Dynamo.delete({
          TableName: connectionTableName,
          Key: {
            connectionId: connectionId,
            websocket: 'venueStatus',
          },
        }).promise();
      } else {
        throw e;
      }
    }
  });

  await Promise.all(postCalls);
};

module.exports = (dependencies) => async (event) => {
  const {
    tableName,
    Dynamo,
    getCurrentTime,
    ApiGatewayManagementApi,
    connectionTableName,
  } = dependencies;

  const { eventId } = event.pathParameters;

  if (!eventId) {
    return {
      ...response,
      statusCode: 400,
      body: JSON.stringify({ message: 'Event ID must be provided' }),
    };
  }

  if (!event.body) {
    return badBodyResponse;
  }

  const { venueStatus } = JSON.parse(event.body);

  if (!venueStatus) {
    return badBodyResponse;
  }

  if (!['Low', 'High', 'Evacuate'].includes(venueStatus)) {
    return {
      ...response,
      statusCode: 400,
      body: JSON.stringify({
        message: 'venueStatus must be Low, High, or Evacuate',
      }),
    };
  }

  try {
    const time = getCurrentTime();

    const putParams = {
      TableName: tableName,
      Item: {
        id: eventId,
        metadata: `statusUpdate_${time}`,
        venueStatus,
      },
    };

    await Dynamo.put(putParams).promise();

    await postToWebsocket({
      ApiGatewayManagementApi,
      Dynamo,
      connectionTableName,
      eventId,
      time,
      venueStatus,
    });

    return {
      ...response,
      statusCode: 200,
      body: JSON.stringify({
        venueStatus,
      }),
    };
  } catch (err) {
    console.error(`${err.code} - ${err.message}`);
    return {
      ...response,
      statusCode: 500,
      body: JSON.stringify({
        message: `Error updating venue status - ${err.message}`,
      }),
    };
  }
};
