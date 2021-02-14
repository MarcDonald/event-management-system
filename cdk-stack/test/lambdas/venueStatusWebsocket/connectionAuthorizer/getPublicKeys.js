const { region } = require('../../../testUtils/awsUtils').testValues;
const { validUserPoolId } = require('../../../testUtils/staffUtils').testValues;

let getPublicKeys;

const getMock = jest.fn();
const jwkToPemMock = jest.fn();

beforeEach(() => {
  const dependencies = {
    region,
    userPoolId: validUserPoolId,
    axios: {
      get: getMock,
    },
    jwkToPem: jwkToPemMock,
  };

  getPublicKeys = require('../../../../lambdas/venueStatusWebsocket/connectionAuthorizer/getPublicKeys')(
    dependencies
  );
});

afterEach(() => {
  jest.resetAllMocks();
  // Doesn't cache the import so the keyCache is cleared every test
  jest.resetModules();
});

test('Should fetch public keys if not cached and return formatted version', async () => {
  getMock.mockReturnValue({
    data: {
      keys: [
        {
          alg: 'RS256',
          e: 'AQAB',
          kid: 'abc123',
          kty: 'RSA',
          n: 'abcdef123456',
          use: 'sig',
        },
        {
          alg: 'RS256',
          e: 'AQAB',
          kid: 'def456',
          kty: 'RSA',
          n: 'ghijkl78910',
          use: 'sig',
        },
      ],
    },
  });

  jwkToPemMock
    // First call
    .mockReturnValueOnce('firstpem')
    // Second call
    .mockReturnValueOnce('secondpem')
    // Default
    .mockReturnValue('defaultpem');

  const keys = await getPublicKeys();

  expect(getMock).toBeCalledWith(
    `https://cognito-idp.${region}.amazonaws.com/${validUserPoolId}/.well-known/jwks.json`
  );
  expect(getMock).toBeCalledTimes(1);
  expect(jwkToPemMock).nthCalledWith(1, {
    alg: 'RS256',
    e: 'AQAB',
    kid: 'abc123',
    kty: 'RSA',
    n: 'abcdef123456',
    use: 'sig',
  });
  expect(jwkToPemMock).nthCalledWith(2, {
    alg: 'RS256',
    e: 'AQAB',
    kid: 'def456',
    kty: 'RSA',
    n: 'ghijkl78910',
    use: 'sig',
  });
  expect(jwkToPemMock).toBeCalledTimes(2);
  expect(keys).toStrictEqual({
    abc123: {
      instance: {
        alg: 'RS256',
        e: 'AQAB',
        kid: 'abc123',
        kty: 'RSA',
        n: 'abcdef123456',
        use: 'sig',
      },
      pem: 'firstpem',
    },
    def456: {
      instance: {
        alg: 'RS256',
        e: 'AQAB',
        kid: 'def456',
        kty: 'RSA',
        n: 'ghijkl78910',
        use: 'sig',
      },
      pem: 'secondpem',
    },
  });
});

test('Should not fetch public keys if cached and return formatted version', async () => {
  getMock.mockReturnValueOnce({
    data: {
      keys: [
        {
          alg: 'RS256',
          e: 'AQAB',
          kid: 'abc123',
          kty: 'RSA',
          n: 'abcdef123456',
          use: 'sig',
        },
        {
          alg: 'RS256',
          e: 'AQAB',
          kid: 'def456',
          kty: 'RSA',
          n: 'ghijkl78910',
          use: 'sig',
        },
      ],
    },
  });

  jwkToPemMock
    // First call
    .mockReturnValueOnce('firstpem')
    // Second call
    .mockReturnValueOnce('secondpem')
    // Default
    .mockReturnValue('defaultpem');

  const firstKeys = await getPublicKeys();
  const cachedKeys = await getPublicKeys();

  // Only fetches and formats once when the cache is empty
  expect(getMock).toBeCalledTimes(1);
  expect(jwkToPemMock).toBeCalledTimes(2);

  const expectedKeys = {
    abc123: {
      instance: {
        alg: 'RS256',
        e: 'AQAB',
        kid: 'abc123',
        kty: 'RSA',
        n: 'abcdef123456',
        use: 'sig',
      },
      pem: 'firstpem',
    },
    def456: {
      instance: {
        alg: 'RS256',
        e: 'AQAB',
        kid: 'def456',
        kty: 'RSA',
        n: 'ghijkl78910',
        use: 'sig',
      },
      pem: 'secondpem',
    },
  };

  expect(firstKeys).toStrictEqual(expectedKeys);
  expect(cachedKeys).toStrictEqual(expectedKeys);
});
