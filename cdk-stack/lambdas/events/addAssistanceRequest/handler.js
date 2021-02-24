const response = {
  headers: { 'content-type': 'application/json' },
  statusCode: 500,
};

const badBodyResponse = {
  ...response,
  statusCode: 400,
  body: JSON.stringify({
    message: 'Request must contain a body containing a position and a message',
  }),
};

const postToWebsocket = async ({
  ApiGatewayManagementApi,
  Dynamo,
  connectionTableName,
  eventId,
  assistanceRequestId,
  time,
  position,
  message,
}) => {
  const connections = await Dynamo.query({
    TableName: connectionTableName,
    KeyConditionExpression: 'websocket = :websocket',
    FilterExpression: 'eventId = :eventId',
    ExpressionAttributeValues: {
      ':websocket': 'assistanceRequest',
      ':eventId': eventId,
    },
  }).promise();

  const postCalls = connections.Items.map(async ({ connectionId }) => {
    try {
      await ApiGatewayManagementApi.postToConnection({
        ConnectionId: connectionId,
        Data: JSON.stringify({
          type: 'NewAssistanceRequest',
          assistanceRequest: {
            assistanceRequestId,
            time,
            position,
            message,
            handled: false,
          },
        }),
      }).promise();
    } catch (e) {
      if (e.statusCode === 410) {
        console.log(`Found stale connection, deleting ${connectionId}`);
        await Dynamo.delete({
          TableName: connectionTableName,
          Key: {
            connectionId: connectionId,
            websocket: 'assistanceRequest',
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
    generateUUID,
    Dynamo,
    getCurrentTime,
    connectionTableName,
    ApiGatewayManagementApi,
  } = dependencies;

  if (!event.body) {
    return badBodyResponse;
  }

  const { eventId } = event.pathParameters;

  const { position, message } = JSON.parse(event.body);

  // TODO trim message and position names
  if (!position || !message) {
    return badBodyResponse;
  }

  if (!position.positionId || !position.name) {
    return badBodyResponse;
  }

  try {
    const assistanceRequestId = generateUUID().toString();
    const time = getCurrentTime();

    const itemToAdd = {
      id: eventId,
      metadata: `assistanceRequest_${assistanceRequestId}`,
      position,
      message,
      time,
      handled: false,
    };

    const putParams = {
      TableName: tableName,
      Item: itemToAdd,
    };

    await Dynamo.put(putParams).promise();

    await postToWebsocket({
      ApiGatewayManagementApi,
      Dynamo,
      connectionTableName,
      eventId,
      assistanceRequestId,
      time,
      position,
      message,
    });

    return {
      ...response,
      statusCode: 201,
      body: JSON.stringify({
        assistanceRequestId,
        position,
        message,
        time,
      }),
    };
  } catch (err) {
    console.error(`${err.code} - ${err.message}`);
    return {
      ...response,
      statusCode: 500,
      body: JSON.stringify({
        message: `Error creating assistance request - ${err.message}`,
      }),
    };
  }
};
