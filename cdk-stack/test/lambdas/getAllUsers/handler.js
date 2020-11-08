const MockAWSError = require('../../testUtils/MockAWSError');

let handler;

beforeEach(() => {
  const dependencies = {};

  handler = require('../../../lambdas/getAllUsers/handler')(dependencies);
});

afterEach(jest.resetAllMocks);

test('TODO', async () => {
  expect(true).toBeTruthy();
});
