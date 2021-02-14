let generateAllowPolicy;

beforeEach(() => {
  generateAllowPolicy = require('../../../../lambdas/venueStatusWebsocket/connectionAuthorizer/generateAllowPolicy');
});

afterEach(() => {
  jest.resetAllMocks();
});

test('Should generate a policy with just the principal when provided with just a principal', () => {
  const policy = generateAllowPolicy('testPrincipal');
  expect(policy).toStrictEqual({
    principalId: 'testPrincipal',
  });
});

test('Should generate a policy with all details when provided with a principal and a resource', () => {
  const policy = generateAllowPolicy('testPrincipal', 'testMethodArn');
  expect(policy).toStrictEqual({
    policyDocument: {
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: 'Allow',
          Resource: 'testMethodArn',
        },
      ],
      Version: '2012-10-17',
    },
    principalId: 'testPrincipal',
  });
});
