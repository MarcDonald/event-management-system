let handler;

const verifyMock = jest.fn();
const getPublicKeysMock = jest.fn();

const validJwt =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImFraWQifQ.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.ZU4lgDuP5fNWV-HrRMu58wffnJLzeJ65TcjJmrm51HI';

beforeEach(() => {
  const dependencies = {
    verify: verifyMock,
    getPublicKeys: getPublicKeysMock,
  };
  handler = require('../../../../lambdas/authorizers/controlRoomAuthorizer/handler')(
    dependencies
  );
});

afterEach(jest.resetAllMocks);

test('Should return 401 when no token provided', async () => {
  const event = {
    identitySource: [],
  };

  const { statusCode, isAuthorized } = await handler(event);

  expect(statusCode).toBe(401);
  expect(isAuthorized).toBe(false);
  expect(getPublicKeysMock).toBeCalledTimes(0);
  expect(verifyMock).toBeCalledTimes(0);
});

test('Should return 401 when token has 1 section', async () => {
  const event = {
    identitySource: ['abc'],
  };

  const { statusCode, isAuthorized } = await handler(event);

  expect(statusCode).toBe(401);
  expect(isAuthorized).toBe(false);
  expect(getPublicKeysMock).toBeCalledTimes(0);
  expect(verifyMock).toBeCalledTimes(0);
});

test('Should return 401 if the kid is undefined', async () => {
  const event = {
    // This JWT has no KID
    identitySource: [
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    ],
  };

  const { statusCode, isAuthorized } = await handler(event);

  expect(statusCode).toBe(401);
  expect(isAuthorized).toBe(false);
  expect(getPublicKeysMock).toBeCalledTimes(0);
  expect(verifyMock).toBeCalledTimes(0);
});

test('Should return 401 when the KID is not included in the keys', async () => {
  const event = {
    identitySource: [validJwt],
  };

  getPublicKeysMock.mockReturnValue({
    anotherkid: 'validkid',
  });

  const { statusCode, isAuthorized } = await handler(event);

  expect(statusCode).toBe(401);
  expect(isAuthorized).toBe(false);
  expect(getPublicKeysMock).toBeCalledTimes(1);
  expect(verifyMock).toBeCalledTimes(0);
});

test('Should return 401 when the user does not have the Administrator role', async () => {
  const event = {
    identitySource: [validJwt],
  };

  getPublicKeysMock.mockReturnValue({
    akid: 'validkid',
  });

  verifyMock.mockReturnValue({
    'custom:jobRole': 'Steward',
  });

  const { statusCode, isAuthorized } = await handler(event);

  expect(statusCode).toBe(401);
  expect(isAuthorized).toBe(false);
  expect(getPublicKeysMock).toBeCalledTimes(1);
  expect(verifyMock).toBeCalledTimes(1);
});

test('Should return 401 when an error occurs getting keys', async () => {
  const event = {
    identitySource: [validJwt],
  };

  getPublicKeysMock.mockImplementation(() => {
    throw new Error('Error getting keys');
  });

  const { statusCode, isAuthorized } = await handler(event);

  expect(statusCode).toBe(401);
  expect(isAuthorized).toBe(false);
  expect(getPublicKeysMock).toBeCalledTimes(1);
  expect(verifyMock).toBeCalledTimes(0);
});

test('Should return 401 when an error occurs verifying token', async () => {
  const event = {
    identitySource: [validJwt],
  };

  getPublicKeysMock.mockReturnValue({
    akid: 'validkid',
  });

  verifyMock.mockImplementation(() => {
    throw new Error('Token is invalid');
  });

  const { statusCode, isAuthorized } = await handler(event);

  expect(statusCode).toBe(401);
  expect(isAuthorized).toBe(false);
  expect(getPublicKeysMock).toBeCalledTimes(1);
  expect(verifyMock).toBeCalledTimes(1);
});

test('Should return 200 when the user has the Control Room Operator role', async () => {
  const event = {
    identitySource: [validJwt],
  };

  getPublicKeysMock.mockReturnValue({
    akid: 'validkid',
  });

  verifyMock.mockReturnValue({
    'custom:jobRole': 'Control Room Operator',
  });

  const { statusCode, isAuthorized } = await handler(event);

  expect(statusCode).toBe(200);
  expect(isAuthorized).toBe(true);
  expect(getPublicKeysMock).toBeCalledTimes(1);
  expect(verifyMock).toBeCalledTimes(1);
});

test('Should return 200 when the user has the Administrator role', async () => {
  const event = {
    identitySource: [validJwt],
  };

  getPublicKeysMock.mockReturnValue({
    akid: 'validkid',
  });

  verifyMock.mockReturnValue({
    'custom:jobRole': 'Administrator',
  });

  const { statusCode, isAuthorized } = await handler(event);

  expect(statusCode).toBe(200);
  expect(isAuthorized).toBe(true);
  expect(getPublicKeysMock).toBeCalledTimes(1);
  expect(verifyMock).toBeCalledTimes(1);
});
