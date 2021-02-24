const response = {
  headers: { 'content-type': 'application/json' },
  statusCode: 500,
};

const postToWebsocket = async ({
  ApiGatewayManagementApi,
  Dynamo,
  connectionTableName,
  eventId,
  assistanceRequestId,
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
          type: 'AssistanceRequestHandled',
          assistanceRequestId,
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
    Dynamo,
    tableName,
    connectionTableName,
    ApiGatewayManagementApi,
  } = dependencies;

  const { eventId, assistanceRequestId } = event.pathParameters;

  if (!eventId) {
    return {
      ...response,
      statusCode: 400,
      body: JSON.stringify({
        message: `Event ID must be provided`,
      }),
    };
  }

  if (!assistanceRequestId) {
    return {
      ...response,
      statusCode: 400,
      body: JSON.stringify({
        message: `Assistance Request ID must be provided`,
      }),
    };
  }

  try {
    const updateParams = {
      TableName: tableName,
      Key: {
        id: eventId,
        metadata: `assistanceRequest_${assistanceRequestId}`,
      },
      UpdateExpression: 'SET handled = :handled',
      // Adding this condition prevents a new request being made if the request doesn't already exist
      ConditionExpression: 'id = :id and metadata = :metadata',
      ExpressionAttributeValues: {
        ':id': eventId,
        ':metadata': `assistanceRequest_${assistanceRequestId}`,
        ':handled': true,
      },
    };

    await Dynamo.update(updateParams).promise();

    await postToWebsocket({
      ApiGatewayManagementApi,
      Dynamo,
      connectionTableName,
      eventId,
      assistanceRequestId,
    });
  } catch (err) {
    console.error(err);
    if (
      err.code === 'ConditionalCheckFailedException' ||
      err.message === 'Assistance Request not found'
    ) {
      return {
        ...response,
        statusCode: 404,
        body: JSON.stringify({
          message: 'Assistance Request could not be found',
        }),
      };
    }
    return {
      ...response,
      statusCode: 500,
      body: JSON.stringify({
        message: `Error handling assistance request - ${err.message}`,
      }),
    };
  }

  return {
    ...response,
    statusCode: 200,
    body: JSON.stringify({ message: 'Assistance Request Handled' }),
  };
};
