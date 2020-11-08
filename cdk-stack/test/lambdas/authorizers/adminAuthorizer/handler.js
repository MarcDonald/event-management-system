const MockAWSError = require('../../../testUtils/MockAWSError');

let handler;

beforeEach(() => {
  const dependencies = {};
  handler = require('../../../../lambdas/authorizers/adminAuthorizer/handler')(
    dependencies
  );
});

afterEach(jest.resetAllMocks);

test('TODO', async () => {
  expect(true).toBeTruthy();
});
