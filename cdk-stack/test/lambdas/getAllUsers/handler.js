const { expect } = require('chai');
const sinon = require('sinon');

const AWS = require('aws-sdk');

const MockAWSError = require('../../testUtils/MockAWSError');

describe('getAllUsers', async () => {
  let handler;

  beforeEach(() => {
    const dependencies = {};

    handler = require('../../../lambdas/getAllUsers/handler')(dependencies);
  });

  afterEach(sinon.reset);

  describe('when a valid event is passed in', () => {
    it('should work', async () => {
      // TODO tests
    });
  });
});
