const { expect } = require('chai');
const sinon = require('sinon');

const AWS = require('aws-sdk');
const AWSCognito = new AWS.CognitoIdentityServiceProvider();

const { cognitoUserBuilder, testValues } = require('../../testUtils/userUtils');
const MockAWSError = require('../../testUtils/MockAWSError');
const {
  validUsername,
  invalidUsername,
  validPassword,
  invalidPassword,
  validSub,
  validRole,
  validGivenName,
  validFamilyName,
  validUserPoolId,
  validApiClientId,
} = testValues;

describe('addUser', async () => {
  let handler;

  let adminCreateUserStub = sinon.stub(AWSCognito, 'adminCreateUser');
  let adminInitiateAuthStub = sinon.stub(AWSCognito, 'adminInitiateAuth');
  let adminRespondToAuthChallengeStub = sinon.stub(
    AWSCognito,
    'adminRespondToAuthChallenge'
  );

  beforeEach(() => {
    const Cognito = {
      adminCreateUser: adminCreateUserStub,
      adminInitiateAuth: adminInitiateAuthStub,
      adminRespondToAuthChallenge: adminRespondToAuthChallengeStub,
    };

    const dependencies = {
      userPoolId: validUserPoolId,
      apiClientId: validApiClientId,
      Cognito,
    };

    handler = require('../../../lambdas/addUser/handler')(dependencies);
  });

  afterEach(sinon.reset);

  describe('when a valid event is passed in', () => {
    it('should create user and return formatted user object', async () => {
      const eventBody = JSON.stringify({
        username: validUsername,
        password: validPassword,
        givenName: validGivenName,
        familyName: validFamilyName,
        role: validRole,
      });
      const event = { body: eventBody };

      adminCreateUserStub.returns({
        promise: () => {},
      });

      adminInitiateAuthStub.returns({
        promise: () => {
          return {
            Session: 'session',
          };
        },
      });

      adminRespondToAuthChallengeStub.returns({
        promise: () => {},
      });

      const { statusCode, body } = await handler(event);

      expect(
        adminCreateUserStub.calledWith({
          UserPoolId: validUserPoolId,
          Username: validUsername,
          TemporaryPassword: sinon.match.string,
          UserAttributes: [
            {
              Name: 'given_name',
              Value: validGivenName,
            },
            {
              Name: 'family_name',
              Value: validFamilyName,
            },
            {
              Name: 'custom:jobRole',
              Value: validRole,
            },
          ],
        })
      ).to.be.true;
      expect(adminCreateUserStub.calledOnce).to.be.true;

      expect(
        adminInitiateAuthStub.calledWith({
          AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
          ClientId: validApiClientId,
          UserPoolId: validUserPoolId,
          AuthParameters: {
            USERNAME: validUsername,
            PASSWORD: sinon.match.string,
          },
        })
      ).to.be.true;
      expect(adminInitiateAuthStub.calledOnce).to.be.true;

      expect(
        adminRespondToAuthChallengeStub.calledWith({
          ClientId: validApiClientId,
          UserPoolId: validUserPoolId,
          ChallengeName: 'NEW_PASSWORD_REQUIRED',
          ChallengeResponses: {
            USERNAME: validUsername,
            NEW_PASSWORD: validPassword,
          },
          Session: 'session',
        })
      ).to.be.true;
      expect(adminInitiateAuthStub.calledOnce).to.be.true;

      expect(statusCode).to.equal(201);
      expect(body).to.equal(
        JSON.stringify({
          username: validUsername,
          givenName: validGivenName,
          familyName: validFamilyName,
          role: validRole,
        })
      );
    });
  });

  describe('when an invalid event is passed in', () => {
    it('when there is no body should return 400', async () => {
      const event = {};

      const { statusCode, body } = await handler(event);

      expect(statusCode).to.equal(400);
      expect(body).to.equal(
        JSON.stringify({
          message:
            'Request must contain a body containing a username, password, givenName, familyName, and role',
        })
      );
    });

    it('when there is an empty body should return 400', async () => {
      const event = { body: '' };

      const { statusCode, body } = await handler(event);

      expect(statusCode).to.equal(400);
      expect(body).to.equal(
        JSON.stringify({
          message:
            'Request must contain a body containing a username, password, givenName, familyName, and role',
        })
      );
    });

    it('when the body does not contain a username should return 400', async () => {
      const eventBody = JSON.stringify({
        password: validPassword,
        givenName: validGivenName,
        familyName: validFamilyName,
        role: validRole,
      });
      const event = { body: eventBody };

      const { statusCode, body } = await handler(event);

      expect(statusCode).to.equal(400);
      expect(body).to.equal(
        JSON.stringify({
          message:
            'Request must contain a username, password, givenName, familyName, and role',
        })
      );
    });

    it('when the body does not contain a password should return 400', async () => {
      const eventBody = JSON.stringify({
        username: validUsername,
        givenName: validGivenName,
        familyName: validFamilyName,
        role: validRole,
      });
      const event = { body: eventBody };

      const { statusCode, body } = await handler(event);

      expect(statusCode).to.equal(400);
      expect(body).to.equal(
        JSON.stringify({
          message:
            'Request must contain a username, password, givenName, familyName, and role',
        })
      );
    });

    it('when the body does not contain a givenName should return 400', async () => {
      const eventBody = JSON.stringify({
        username: validUsername,
        password: validPassword,
        familyName: validFamilyName,
        role: validRole,
      });
      const event = { body: eventBody };

      const { statusCode, body } = await handler(event);

      expect(statusCode).to.equal(400);
      expect(body).to.equal(
        JSON.stringify({
          message:
            'Request must contain a username, password, givenName, familyName, and role',
        })
      );
    });

    it('when the body does not contain a familyName should return 400', async () => {
      const eventBody = JSON.stringify({
        username: validUsername,
        password: validPassword,
        givenName: validGivenName,
        role: validRole,
      });
      const event = { body: eventBody };

      const { statusCode, body } = await handler(event);

      expect(statusCode).to.equal(400);
      expect(body).to.equal(
        JSON.stringify({
          message:
            'Request must contain a username, password, givenName, familyName, and role',
        })
      );
    });

    it('when the body does not contain a familyName should return 400', async () => {
      const eventBody = JSON.stringify({
        username: validUsername,
        password: validPassword,
        givenName: validGivenName,
        familyName: validFamilyName,
      });
      const event = { body: eventBody };

      const { statusCode, body } = await handler(event);

      expect(statusCode).to.equal(400);
      expect(body).to.equal(
        JSON.stringify({
          message:
            'Request must contain a username, password, givenName, familyName, and role',
        })
      );
    });

    it('when the username is already taken should return 400', async () => {
      const eventBody = JSON.stringify({
        username: invalidUsername,
        password: validPassword,
        givenName: validGivenName,
        familyName: validFamilyName,
        role: validRole,
      });
      const event = { body: eventBody };

      adminCreateUserStub.throws(
        new MockAWSError(
          'User account already exists',
          'UsernameExistsException'
        )
      );

      const { statusCode, body } = await handler(event);

      expect(
        adminCreateUserStub.calledWith({
          UserPoolId: validUserPoolId,
          Username: invalidUsername,
          TemporaryPassword: sinon.match.string,
          UserAttributes: [
            {
              Name: 'given_name',
              Value: validGivenName,
            },
            {
              Name: 'family_name',
              Value: validFamilyName,
            },
            {
              Name: 'custom:jobRole',
              Value: validRole,
            },
          ],
        })
      ).to.be.true;
      expect(adminCreateUserStub.calledOnce).to.be.true;
      expect(adminInitiateAuthStub.notCalled).to.be.true;
      expect(adminRespondToAuthChallengeStub.notCalled).to.be.true;

      expect(statusCode).to.equal(400);
      expect(body).to.equal(
        JSON.stringify({ message: 'Username has already been taken' })
      );
    });

    it('when another error occurs should return 500', async () => {
      const eventBody = JSON.stringify({
        username: validUsername,
        password: validPassword,
        givenName: validGivenName,
        familyName: validFamilyName,
        role: validRole,
      });
      const event = { body: eventBody };

      adminCreateUserStub.throws(
        new MockAWSError('Error message', 'UnknownException')
      );

      const { statusCode, body } = await handler(event);

      expect(
        adminCreateUserStub.calledWith({
          UserPoolId: validUserPoolId,
          Username: validUsername,
          TemporaryPassword: sinon.match.string,
          UserAttributes: [
            {
              Name: 'given_name',
              Value: validGivenName,
            },
            {
              Name: 'family_name',
              Value: validFamilyName,
            },
            {
              Name: 'custom:jobRole',
              Value: validRole,
            },
          ],
        })
      ).to.be.true;
      expect(adminCreateUserStub.calledOnce).to.be.true;
      expect(adminInitiateAuthStub.notCalled).to.be.true;
      expect(adminRespondToAuthChallengeStub.notCalled).to.be.true;

      expect(statusCode).to.equal(500);
      expect(body).to.equal(
        JSON.stringify({ message: 'Error creating user - Error message' })
      );
    });
  });
});
