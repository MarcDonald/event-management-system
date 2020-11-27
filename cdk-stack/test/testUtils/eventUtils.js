const testValues = {
  validEventId: 'fgh-123-hgf-456',
  invalidEventId: 'sdf-456-fds-123',
  validTableName: 'validEventsTableName',
  validEventName: 'validEventName',
  invalidEventName: 'invalidEventName',
  validAreaOfSupervision: 'validAreaOfSupervision',
  validEventMetadataIndexName: 'validEventMetadataIndexName',
  validStart: 1606340678,
  validEnd: 1606340800,
  invalidEnd: 1606330800,
};

const validStatuses = {
  LOW: 'LOW',
  HIGH: 'HIGH',
  EVACUATE: 'EVACUATE',
};

module.exports = {
  testValues,
  validStatuses,
};
