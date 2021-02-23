const response = {
  headers: { 'content-type': 'application/json' },
  statusCode: 500,
};

module.exports = (dependencies) => async (event) => {
  const { Dynamo, tableName } = dependencies;

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
