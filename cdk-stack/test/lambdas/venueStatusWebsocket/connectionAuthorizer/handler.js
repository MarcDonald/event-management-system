let handler;

const verifyMock = jest.fn();
const getPublicKeysMock = jest.fn();
const generateAllowPolicyMock = jest.fn();
const callbackMock = jest.fn();

const validJwt =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImFraWQifQ.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.ZU4lgDuP5fNWV-HrRMu58wffnJLzeJ65TcjJmrm51HI';

const validMethodArn = '$connect';

const validAllowPolicy = {
  policyDocument: {
    Statement: [
      {
        Action: 'execute-api:Invoke',
        Effect: 'Allow',
        Resource: validMethodArn,
      },
    ],
    Version: '2012-10-17',
  },
  principalId: validJwt,
};

beforeEach(() => {
  const dependencies = {
    verify: verifyMock,
    getPublicKeys: getPublicKeysMock,
    generateAllowPolicy: generateAllowPolicyMock,
  };
  handler = require('../../../../lambdas/venueStatusWebsocket/connectionAuthorizer/handler')(
    dependencies
  );
});

afterEach(jest.resetAllMocks);

test('Should return unauthorized when no token provided', async () => {
  const event = {
    queryStringParameters: [],
    methodArn: validMethodArn,
  };

  await handler(event, {}, callbackMock);

  expect(callbackMock).toBeCalledWith('Unauthorized');
  expect(callbackMock).toBeCalledTimes(1);
  expect(getPublicKeysMock).toBeCalledTimes(0);
  expect(verifyMock).toBeCalledTimes(0);
});

test('Should return unauthorized when token has 1 section', async () => {
  const event = {
    queryStringParameters: { Authorization: 'abc' },
    methodArn: validMethodArn,
  };

  await handler(event, {}, callbackMock);

  expect(callbackMock).toBeCalledWith('Unauthorized');
  expect(callbackMock).toBeCalledTimes(1);
  expect(getPublicKeysMock).toBeCalledTimes(0);
  expect(verifyMock).toBeCalledTimes(0);
});

test('Should return unauthorized if the kid is undefined', async () => {
  const event = {
    // This JWT has no KID
    queryStringParameters: {
      Authorization:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    },
    methodArn: validMethodArn,
  };

  await handler(event, {}, callbackMock);

  expect(callbackMock).toBeCalledWith('Unauthorized');
  expect(callbackMock).toBeCalledTimes(1);
  expect(getPublicKeysMock).toBeCalledTimes(0);
  expect(verifyMock).toBeCalledTimes(0);
});

test('Should return unauthorized when the KID is not included in the keys', async () => {
  const event = {
    queryStringParameters: { Authorization: validJwt },
    methodArn: validMethodArn,
  };

  getPublicKeysMock.mockReturnValue({
    anotherkid: 'validkid',
  });

  await handler(event, {}, callbackMock);

  expect(callbackMock).toBeCalledWith('Unauthorized');
  expect(callbackMock).toBeCalledTimes(1);
  expect(getPublicKeysMock).toBeCalledTimes(1);
  expect(verifyMock).toBeCalledTimes(0);
});

test('Should return unauthorized when the user has a role other than Control Room Operator, Administrator, or Steward', async () => {
  const event = {
    queryStringParameters: { Authorization: validJwt },
    methodArn: validMethodArn,
  };

  getPublicKeysMock.mockReturnValue({
    akid: 'validkid',
  });

  verifyMock.mockReturnValue({
    'custom:jobRole': 'A Different Role',
  });

  await handler(event, {}, callbackMock);

  expect(callbackMock).toBeCalledWith('Unauthorized');
  expect(callbackMock).toBeCalledTimes(1);
  expect(getPublicKeysMock).toBeCalledTimes(1);
  expect(verifyMock).toBeCalledTimes(1);
});

test('Should return unauthorized when an error occurs getting keys', async () => {
  const event = {
    queryStringParameters: { Authorization: validJwt },
    methodArn: validMethodArn,
  };

  getPublicKeysMock.mockImplementation(() => {
    throw new Error('Error getting keys');
  });

  await handler(event, {}, callbackMock);

  expect(callbackMock).toBeCalledWith('Unauthorized');
  expect(callbackMock).toBeCalledTimes(1);
  expect(getPublicKeysMock).toBeCalledTimes(1);
  expect(verifyMock).toBeCalledTimes(0);
});

test('Should return unauthorized when an error occurs verifying token', async () => {
  const event = {
    queryStringParameters: { Authorization: validJwt },
    methodArn: validMethodArn,
  };

  getPublicKeysMock.mockReturnValue({
    akid: 'validkid',
  });

  verifyMock.mockImplementation(() => {
    throw new Error('Token is invalid');
  });

  await handler(event, {}, callbackMock);

  expect(callbackMock).toBeCalledWith('Unauthorized');
  expect(callbackMock).toBeCalledTimes(1);
  expect(getPublicKeysMock).toBeCalledTimes(1);
  expect(verifyMock).toBeCalledTimes(1);
});

test('Should return authorized when the user has the Administrator role', async () => {
  const event = {
    queryStringParameters: { Authorization: validJwt },
    methodArn: validMethodArn,
  };

  getPublicKeysMock.mockReturnValue({
    akid: 'validkid',
  });

  verifyMock.mockReturnValue({
    'custom:jobRole': 'Administrator',
  });

  generateAllowPolicyMock.mockReturnValueOnce(validAllowPolicy);

  await handler(event, {}, callbackMock);

  expect(generateAllowPolicyMock).toBeCalledWith(validJwt, validMethodArn);
  expect(generateAllowPolicyMock).toBeCalledTimes(1);
  expect(callbackMock).toBeCalledWith(null, validAllowPolicy);
  expect(callbackMock).toBeCalledTimes(1);
  expect(getPublicKeysMock).toBeCalledTimes(1);
  expect(verifyMock).toBeCalledTimes(1);
});

test('Should return authorized when the user has the Control Room Operator role', async () => {
  const event = {
    queryStringParameters: { Authorization: validJwt },
    methodArn: validMethodArn,
  };

  getPublicKeysMock.mockReturnValue({
    akid: 'validkid',
  });

  verifyMock.mockReturnValue({
    'custom:jobRole': 'Control Room Operator',
  });

  generateAllowPolicyMock.mockReturnValueOnce(validAllowPolicy);

  await handler(event, {}, callbackMock);

  expect(generateAllowPolicyMock).toBeCalledWith(validJwt, validMethodArn);
  expect(generateAllowPolicyMock).toBeCalledTimes(1);
  expect(callbackMock).toBeCalledWith(null, validAllowPolicy);
  expect(callbackMock).toBeCalledTimes(1);
  expect(getPublicKeysMock).toBeCalledTimes(1);
  expect(verifyMock).toBeCalledTimes(1);
});

test('Should return authorized when the user has the Steward role', async () => {
  const event = {
    queryStringParameters: { Authorization: validJwt },
    methodArn: validMethodArn,
  };

  getPublicKeysMock.mockReturnValue({
    akid: 'validkid',
  });

  verifyMock.mockReturnValue({
    'custom:jobRole': 'Steward',
  });

  generateAllowPolicyMock.mockReturnValueOnce(validAllowPolicy);

  await handler(event, {}, callbackMock);

  expect(generateAllowPolicyMock).toBeCalledWith(validJwt, validMethodArn);
  expect(generateAllowPolicyMock).toBeCalledTimes(1);
  expect(callbackMock).toBeCalledWith(null, validAllowPolicy);
  expect(callbackMock).toBeCalledTimes(1);
  expect(getPublicKeysMock).toBeCalledTimes(1);
  expect(verifyMock).toBeCalledTimes(1);
});
