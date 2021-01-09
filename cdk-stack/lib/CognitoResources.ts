import * as cdk from '@aws-cdk/core';
import {
  AccountRecovery,
  CfnIdentityPool,
  CfnIdentityPoolRoleAttachment,
  StringAttribute,
  UserPool,
  UserPoolClient,
  UserPoolClientIdentityProvider,
} from '@aws-cdk/aws-cognito';
import {
  Effect,
  FederatedPrincipal,
  PolicyStatement,
  Role,
} from '@aws-cdk/aws-iam';

/**
 * User Pool, Identity Pool, and User Pool Clients
 */
export default class CognitoResources {
  public readonly userPool: UserPool;
  public readonly webDashboardUserPoolClient: UserPoolClient;
  public readonly apiUserPoolClient: UserPoolClient;
  public readonly webDashboardIdentityPool: CfnIdentityPool;
  public readonly defaultUnauthenticatedRole: Role;
  public readonly defaultAuthenticatedRole: Role;
  public readonly identityPoolRoleAttachment: CfnIdentityPoolRoleAttachment;

  constructor(scope: cdk.Construct) {
    this.userPool = this.createUserPool(scope);
    this.webDashboardUserPoolClient = this.createWebDashboardClient(
      this.userPool
    );
    this.apiUserPoolClient = this.createApiClient(this.userPool);
    this.webDashboardIdentityPool = this.createIdentityPool(scope, [
      {
        clientId: this.webDashboardUserPoolClient.userPoolClientId,
        providerName: this.userPool.userPoolProviderName,
      },
    ]);
    this.defaultUnauthenticatedRole = this.createUnauthenticatedRole(
      scope,
      this.webDashboardIdentityPool
    );
    this.defaultAuthenticatedRole = this.createAuthenticatedRole(
      scope,
      this.webDashboardIdentityPool
    );
    this.identityPoolRoleAttachment = this.createIdentityPoolRoleAttachment(
      scope,
      this.webDashboardIdentityPool,
      this.defaultUnauthenticatedRole,
      this.defaultAuthenticatedRole
    );
  }

  private createUserPool = (scope: cdk.Construct): UserPool =>
    new UserPool(scope, 'UserPool', {
      userPoolName: 'EmsUserPool',
      // No need for account recovery since admin users can change the password
      accountRecovery: AccountRecovery.NONE,
      signInAliases: {
        username: true,
      },
      passwordPolicy: {
        requireDigits: false,
        requireLowercase: true,
        requireUppercase: false,
        requireSymbols: false,
      },
      standardAttributes: {
        givenName: {
          required: true,
          mutable: true,
        },
        familyName: {
          required: true,
          mutable: true,
        },
      },
      // Only admins should be able to create users
      selfSignUpEnabled: false,
      customAttributes: {
        jobRole: new StringAttribute({ mutable: true }),
      },
    });

  private createWebDashboardClient = (userPool: UserPool): UserPoolClient =>
    userPool.addClient('WebDashboard', {
      userPoolClientName: 'WebDashboard',
      preventUserExistenceErrors: true,
      authFlows: {
        userSrp: true,
      },
      disableOAuth: true,
      supportedIdentityProviders: [UserPoolClientIdentityProvider.COGNITO],
    });

  private createApiClient = (userPool: UserPool): UserPoolClient =>
    userPool.addClient('Api', {
      userPoolClientName: 'API',
      // Since this is the client used by the API, we want to see user existence errors in order to handle them properly
      preventUserExistenceErrors: false,
      authFlows: {
        adminUserPassword: true,
      },
      supportedIdentityProviders: [UserPoolClientIdentityProvider.COGNITO],
    });

  private createIdentityPool = (
    scope: cdk.Construct,
    cognitoIdentityProviders:
      | Array<CfnIdentityPool.CognitoIdentityProviderProperty | cdk.IResolvable>
      | cdk.IResolvable
  ): CfnIdentityPool =>
    new CfnIdentityPool(scope, 'IdentityPool', {
      allowUnauthenticatedIdentities: false,
      identityPoolName: 'EmsIdentityPool',
      cognitoIdentityProviders,
    });

  private createUnauthenticatedRole = (
    scope: cdk.Construct,
    identityPool: CfnIdentityPool
  ): Role => {
    const unauthenticatedRole = new Role(scope, 'DefaultUnauthenticatedRole', {
      roleName: 'EmsDefaultUnauthenticated',
      assumedBy: new FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': identityPool.ref,
          },
          'ForAnyValue:StringLike': {
            'cognito-identity.amazonaws.com:amr': 'unauthenticated',
          },
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
    });

    unauthenticatedRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['mobileanalytics:PutEvents', 'cognito-sync:*'],
        resources: ['*'],
      })
    );
    return unauthenticatedRole;
  };

  private createAuthenticatedRole = (
    scope: cdk.Construct,
    identityPool: CfnIdentityPool
  ): Role => {
    const authenticatedRole = new Role(scope, 'DefaultAuthenticatedRole', {
      roleName: 'EmsDefaultAuthenticated',
      assumedBy: new FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': identityPool.ref,
          },
          'ForAnyValue:StringLike': {
            'cognito-identity.amazonaws.com:amr': 'authenticated',
          },
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
    });

    authenticatedRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          'mobileanalytics:PutEvents',
          'cognito-sync:*',
          'cognito-identity:*',
        ],
        resources: ['*'],
      })
    );

    return authenticatedRole;
  };

  private createIdentityPoolRoleAttachment = (
    scope: cdk.Construct,
    identityPool: CfnIdentityPool,
    unauthenticatedRole: Role,
    authenticatedRole: Role
  ): CfnIdentityPoolRoleAttachment =>
    new CfnIdentityPoolRoleAttachment(scope, 'IdentityPoolRoleAttachment', {
      identityPoolId: identityPool.ref,
      roles: {
        unauthenticated: unauthenticatedRole.roleArn,
        authenticated: authenticatedRole.roleArn,
      },
    });
}
