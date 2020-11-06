const { expect } = require('chai');
const sinon = require('sinon');

const AWS = require('aws-sdk');
const AWSCognito = new AWS.CognitoIdentityServiceProvider();

const { cognitoUserBuilder, testValues } = require('../../testUtils/userUtils');
const MockAWSError = require('../../testUtils/MockAWSError');
const {
  validUsername,
  invalidUsername,
  validSub,
  validRole,
  validGivenName,
  validFamilyName,
  validUserPoolId,
} = testValues;

describe('handler', async () => {
  let handler;
  let adminGetUserStub = sinon.stub(AWSCognito, 'adminGetUser');

  beforeEach(() => {
    const Cognito = {
      adminGetUser: adminGetUserStub,
    };

    const dependencies = {
      USER_POOL_ID: validUserPoolId,
      Cognito,
    };

    handler = require('../../../lambdas/getUser/handler')(dependencies);
  });

  afterEach(sinon.reset);

  describe('when a valid event is passed in', () => {
    it('should return a formatted version of the given user', async () => {
      adminGetUserStub
        .withArgs({
          UserPoolId: validUserPoolId,
          Username: validUsername,
        })
        .returns({
          promise: () => {
            return cognitoUserBuilder(
              validUsername,
              validSub,
              validRole,
              validGivenName,
              validFamilyName
            );
          },
        });

      const event = {
        pathParameters: {
          username: validUsername,
        },
      };

      const { statusCode, body } = await handler(event);

      expect(statusCode).to.equal(200);
      // expect(adminGetUserSpy.calledOnce).to.be.true;
      expect(body).to.equal(
        JSON.stringify({
          username: validUsername,
          sub: validSub,
          role: validRole,
          givenName: validGivenName,
          familyName: validFamilyName,
        })
      );
    });
  });

  describe('when an invalid event is passed in', () => {
    it('should return 404 if the user cannot be found', async () => {
      adminGetUserStub
        .withArgs()
        .throws(
          new MockAWSError('User could not be found.', 'UserNotFoundException')
        );

      const event = {
        pathParameters: {
          username: invalidUsername,
        },
      };

      const { statusCode, body } = await handler(event);

      expect(statusCode).to.equal(404);
      expect(body).to.equal(
        JSON.stringify({ message: 'User could not be found' })
      );
    });

    it('should return 500 if another error is thrown', async () => {
      adminGetUserStub
        .withArgs()
        .throws(new MockAWSError('The error message.', 'AnotherError'));

      const event = {
        pathParameters: {
          username: invalidUsername,
        },
      };

      const { statusCode, body } = await handler(event);

      expect(statusCode).to.equal(500);
      expect(body).to.equal(
        JSON.stringify({
          message: `Error getting user '${invalidUsername}' - The error message.`,
        })
      );
    });
  });
});
