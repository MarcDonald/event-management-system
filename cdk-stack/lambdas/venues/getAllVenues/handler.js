const response = {
  headers: { 'content-type': 'application/json' },
  statusCode: 500,
};

module.exports = (dependencies) => async (event) => {
  const { Dynamo, tableName } = dependencies;

  try {
    const result = await Dynamo.scan({
      TableName: tableName,
    }).promise();

    const venueList = result.Items;

    return {
      ...response,
      statusCode: 200,
      body: JSON.stringify(venueList),
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
