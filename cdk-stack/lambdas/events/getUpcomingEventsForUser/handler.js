const response = {
  headers: { 'content-type': 'application/json' },
  statusCode: 500,
};

module.exports = (dependencies) => async (event) => {
  const {
    Dynamo,
    tableName,
    metadataIndexName,
    getCurrentDayMidnight,
  } = dependencies;

  const { username } = event.pathParameters;

  let count;
  let limit = 5;

  if (event.query) {
    count = event.query.count;
  }

  if (count) {
    if (typeof count === 'number' && count > 0 && count < 10) {
      limit = count;
    } else {
      return {
        ...response,
        statusCode: 400,
        body: JSON.stringify({
          message:
            'Count query parameter must be a number greater than 0 and less than 10',
        }),
      };
    }
  }

  try {
    const result = await Dynamo.query({
      TableName: tableName,
      IndexName: metadataIndexName,
      KeyConditionExpression: 'metadata = :metadata',
      FilterExpression: '#start >= :now or :now between #start and #end',
      ExpressionAttributeNames: {
        '#start': 'start',
        '#end': 'end',
      },
      ExpressionAttributeValues: {
        ':metadata': 'event',
        ':now': getCurrentDayMidnight(),
      },
      Limit: limit,
    }).promise();

    const filteredList = result.Items.filter((dbEvent) => {
      return (
        isUserInStaffList(username, dbEvent.supervisors) ||
        isUserInStaffList(username, dbEvent.staff)
      );
    });

    const formattedEventList = filteredList.map((dbEvent) => {
      const { name, venue, start, end, supervisors, staff } = dbEvent;
      return {
        eventId: dbEvent.id,
        name,
        venue,
        start,
        end,
        supervisors,
        staff,
      };
    });

    return {
      ...response,
      statusCode: 200,
      body: JSON.stringify(formattedEventList),
    };
  } catch (e) {
    console.error(`${e.code} - ${e.message}`);

    return {
      ...response,
      body: JSON.stringify({
        message: `Error getting upcoming events - ${e.message}`,
      }),
    };
  }
};

const isUserInStaffList = (username, staffList) => {
  const foundStaff = staffList.find((staff) => {
    return staff.staffMember.username === username;
  });
  return !!foundStaff;
};
