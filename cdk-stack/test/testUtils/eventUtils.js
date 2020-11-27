const testValues = {
  validEventId: 'fgh-123-hgf-456',
  invalidEventId: 'sdf-456-fds-123',
  validTableName: 'validEventsTableName',
  validEventName: 'validEventName',
  invalidEventName: 'invalidEventName',
  validAreaOfSupervision: 'validAreaOfSupervision',
  validEventMetadataIndexName: 'validEventMetadataIndexName',
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
