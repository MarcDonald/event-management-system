const testValues = {
  region: 'eu-test-1',
};

const dynamoResponseBuilder = (items) => {
  return {
    ConsumedCapacity: {},
    Count: items.length,
    Items: items,
    ScannedCount: items.length,
  };
};

module.exports = {
  testValues,
  dynamoResponseBuilder,
};
