// Based on official AWS documentation available at
// https://github.com/awslabs/aws-support-tools/blob/master/Cognito/decode-verify-jwt/decode-verify-jwt.ts
// (Mayer and Tiwari, 2018)

module.exports = (dependencies) => async (event) => {
  const requestedPositionId = event.pathParameters.positionId;
  const requestedEventId = event.pathParameters.eventId;

  console.log(requestedEventId);
  console.log(requestedPositionId);

  if (requestedPositionId && requestedEventId) {
    const { verify, getPublicKeys, Dynamo, tableName } = dependencies;

    // The first index in the identity source array is the Authorization header value i.e the JWT
    const token = event.identitySource[0];
    try {
      const tokenSections = (token || '').split('.');
      if (tokenSections.length < 2) {
        throw new Error('Invalid number of sections in token');
      }
      const rawHeader = Buffer.from(tokenSections[0], 'base64').toString(
        'utf8'
      );
      const headerJson = JSON.parse(rawHeader);
      if (!headerJson.kid) {
        throw new Error('No kid provided');
      }
      const keys = await getPublicKeys();
      const key = keys[headerJson.kid];
      if (key === undefined) {
        throw new Error('Unknown kid');
      }

      const decodedToken = await verify(token, key.pem);

      if (decodedToken['cognito:username']) {
        const result = await Dynamo.query({
          TableName: tableName,
          KeyConditionExpression: 'id = :eventId and metadata = :metadata',
          ExpressionAttributeValues: {
            ':eventId': requestedEventId,
            ':metadata': 'event',
          },
          Limit: 1,
        }).promise();

        console.log(result);

        if (result.Items[0]) {
          const assignedPosition = result.Items[0].staff.find(
            (assignedStaff) =>
              assignedStaff.position.positionId === requestedPositionId
          );
          if (assignedPosition) {
            if (
              assignedPosition.staffMember.username ===
              decodedToken['cognito:username']
            ) {
              return {
                statusCode: 200,
                isAuthorized: true,
              };
            } else {
              console.log('User is not assigned to the requested position');
            }
          } else {
            throw new Error('Position not found on event');
          }
        } else {
          throw new Error('No event found');
        }
      }
    } catch (e) {
      console.error(e.message);
    }
  } else {
    console.error('No positionId or no eventId in path parameters');
  }

  return {
    statusCode: 401,
    isAuthorized: false,
  };
};
