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

module.exports = (dependencies) => async (event) => {
  const { tableName, generateUUID, Dynamo, getCurrentTime } = dependencies;

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
      id: assistanceRequestId,
      metadata: `assistanceRequest_${eventId}`,
      position,
      message,
      time,
    };

    const putParams = {
      TableName: tableName,
      Item: itemToAdd,
    };

    await Dynamo.put(putParams).promise();

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
