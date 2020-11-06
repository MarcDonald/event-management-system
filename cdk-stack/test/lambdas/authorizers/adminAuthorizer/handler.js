const { expect } = require('chai');
const sinon = require('sinon');

const AWS = require('aws-sdk');

const MockAWSError = require('../../../testUtils/MockAWSError');

describe('adminAuthorizer', async () => {
  let handler;

  beforeEach(() => {
    const dependencies = {};

    handler = require('../../../lambdas/authorizers/adminAuthorizer/handler')(
      dependencies
    );
  });

  afterEach(sinon.reset);

  describe('when a valid event is passed in', () => {
    it('should work', async () => {
      // TODO tests
    });
  });
});
