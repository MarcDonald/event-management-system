const testValues = {
  validEventId: 'fgh-123-hgf-456',
  invalidEventId: 'sdf-456-fds-123',
  validEventName: 'validEventName',
  validAreaOfSupervision: 'validAreaOfSupervision',
  validStart: 1606340678,
  validEnd: 1606340800,
  invalidEnd: 1606330800,
  validStatusUpdateTime: 1601330800,
  validAssistanceRequestTime: 1606240678,
  validAssistanceRequestMessage: 'validAssistanceRequestMessage',
  validAssistanceRequestId: 'zxc-123-zxc-456',
  invalidAssistanceRequestId: 'hop-321-zlc-458',
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
