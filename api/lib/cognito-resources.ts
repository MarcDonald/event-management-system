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
import { Effect, FederatedPrincipal, PolicyStatement, Role } from '@aws-cdk/aws-iam';

export class CognitoResources {
  public readonly userPool: UserPool;
  public readonly webDashboardUserPoolClient: UserPoolClient;
  public readonly identityPool: CfnIdentityPool;
  public readonly defaultUnauthenticatedRole: Role;
  public readonly defaultAuthenticatedRole: Role;
  public readonly identityPoolRoleAttachment: CfnIdentityPoolRoleAttachment;

  constructor(scope: cdk.Construct) {
    this.userPool = this.createUserPool(scope);
    this.webDashboardUserPoolClient = this.createWebDashboardClient(this.userPool);
    this.identityPool = this.createIdentityPool(scope, [{
      clientId: this.webDashboardUserPoolClient.userPoolClientId,
      providerName: this.userPool.userPoolProviderName,
    }]);
    this.defaultUnauthenticatedRole = this.createUnauthenticatedRole(scope, this.identityPool);
    this.defaultAuthenticatedRole = this.createAuthenticatedRole(scope, this.identityPool);
    this.identityPoolRoleAttachment = this.createIdentityPoolRoleAttachment(
      scope, this.identityPool, this.defaultUnauthenticatedRole, this.defaultAuthenticatedRole);
  }

  private createUserPool = (scope: cdk.Construct): UserPool => new UserPool(scope, 'ems-user-pool', {
    userPoolName: 'EMS-User-Pool',
    accountRecovery: AccountRecovery.NONE,
    signInAliases: {
      username: true,
    },
    passwordPolicy: {
      requireDigits: true,
      requireLowercase: true,
      requireUppercase: true,
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
    selfSignUpEnabled: true,
    customAttributes: {
      'jobRole': new StringAttribute({ mutable: true }),
    },
  });

  private createWebDashboardClient = (userPool: UserPool): UserPoolClient => userPool.addClient('web-dashboard', {
                                                                                                  userPoolClientName: 'WebDashboard',
                                                                                                  preventUserExistenceErrors: true,
                                                                                                  authFlows: {
                                                                                                    userSrp: true,
                                                                                                  },
                                                                                                  disableOAuth: true,
                                                                                                  supportedIdentityProviders: [UserPoolClientIdentityProvider.COGNITO],
                                                                                                },
  );

  private createIdentityPool = (scope: cdk.Construct, cognitoIdentityProviders: Array<CfnIdentityPool.CognitoIdentityProviderProperty | cdk.IResolvable> | cdk.IResolvable): CfnIdentityPool => new CfnIdentityPool(
    scope, 'ems-identity-pool', {
      allowUnauthenticatedIdentities: false,
      identityPoolName: 'EMS-Identity-Pool',
      cognitoIdentityProviders,
    });

  private createUnauthenticatedRole = (scope: cdk.Construct, identityPool: CfnIdentityPool): Role => {
    const unauthenticatedRole = new Role(scope, 'EMSDefaultUnauthenticatedRole', {
      roleName: 'EMS-Default-Unauthenticated',
      assumedBy: new FederatedPrincipal('cognito-identity.amazonaws.com', {
        'StringEquals': { 'cognito-identity.amazonaws.com:aud': identityPool.ref },
        'ForAnyValue:StringLike': { 'cognito-identity.amazonaws.com:amr': 'unauthenticated' },
      }, 'sts:AssumeRoleWithWebIdentity'),
    });

    unauthenticatedRole.addToPolicy(new PolicyStatement({
                                                          effect: Effect.ALLOW,
                                                          actions: [
                                                            'mobileanalytics:PutEvents',
                                                            'cognito-sync:*',
                                                          ],
                                                          resources: ['*'],
                                                        }));
    return unauthenticatedRole;
  };

  private createAuthenticatedRole = (scope: cdk.Construct, identityPool: CfnIdentityPool): Role => {
    const authenticatedRole = new Role(scope, 'EMSDefaultAuthenticatedRole', {
      roleName: 'EMS-Default-Authenticated',
      assumedBy: new FederatedPrincipal('cognito-identity.amazonaws.com', {
        'StringEquals': { 'cognito-identity.amazonaws.com:aud': identityPool.ref },
        'ForAnyValue:StringLike': { 'cognito-identity.amazonaws.com:amr': 'authenticated' },
      }, 'sts:AssumeRoleWithWebIdentity'),
    });

    authenticatedRole.addToPolicy(new PolicyStatement({
                                                        effect: Effect.ALLOW,
                                                        actions: [
                                                          'mobileanalytics:PutEvents',
                                                          'cognito-sync:*',
                                                          'cognito-identity:*',
                                                        ],
                                                        resources: ['*'],
                                                      }));

    return authenticatedRole;
  };

  private createIdentityPoolRoleAttachment = (scope: cdk.Construct, identityPool: CfnIdentityPool, unauthenticatedRole: Role, authenticatedRole: Role): CfnIdentityPoolRoleAttachment => new CfnIdentityPoolRoleAttachment(
    scope, 'EMSIdentityPoolRoleAttachment', {
      identityPoolId: identityPool.ref,
      roles: {
        'unauthenticated': unauthenticatedRole.roleArn,
        'authenticated': authenticatedRole.roleArn,
      },
    });
}