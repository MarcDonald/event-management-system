const response = {
  headers: { 'content-type': 'application/json' },
  statusCode: 500,
};

module.exports = (dependencies) => async (event) => {
  const { Dynamo, tableName, metadataIndexName } = dependencies;

  try {
    const result = await Dynamo.query({
      TableName: tableName,
      IndexName: metadataIndexName,
      KeyConditionExpression: 'metadata = :metadata',
      ExpressionAttributeValues: {
        ':metadata': 'venue',
      },
    }).promise();

    const venueList = result.Items;
    const formattedVenueList = venueList.map((dbVenue) => {
      return {
        venueId: dbVenue.id,
        name: dbVenue.name,
        positions: dbVenue.positions,
      };
    });

    return {
      ...response,
      statusCode: 200,
      body: JSON.stringify(formattedVenueList),
    };
  } catch (e) {
    console.error(`${e.code} - ${e.message}`);

    return {
      ...response,
      body: JSON.stringify({
        message: `Error getting all venues - ${e.message}`,
      }),
    };
  }
};
