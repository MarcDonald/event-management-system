const MockAWSError = require('../../testUtils/MockAWSError');

let handler;

beforeEach(() => {
  const dependencies = {};

  handler = require('../../../lambdas/updateUser/handler')(dependencies);
});

afterEach(jest.resetAllMocks);

test('TODO', async () => {
  expect(true).toBeTruthy();
});
