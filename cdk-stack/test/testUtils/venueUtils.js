const testValues = {
  validVenueId: 'abc-123-def-456',
  invalidVenueId: 'def-456-abc-123',
  validTableName: 'validTableName',
  validVenueName: 'validVenueName',
  invalidVenueName: 'invalidVenueName',
  validPositionName: 'validPositionName',
  validPositionId: 'qwe-123-rty-456',
  invalidPositionId: 'rty-456-qwe-123',
};

const validStatuses = {
  ALL_OK: 'AllOk',
  YELLOW_ALERT: 'YellowAlert',
  RED_ALERT: 'RedAlert',
};

module.exports = {
  testValues,
  validStatuses,
};
