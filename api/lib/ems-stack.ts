import * as cdk from '@aws-cdk/core';
import {
  AccountRecovery,
  CfnIdentityPool, CfnIdentityPoolRoleAttachment,
  StringAttribute,
  UserPool,
  UserPoolClientIdentityProvider,
} from '@aws-cdk/aws-cognito';
import { Effect, FederatedPrincipal, PolicyStatement, Role } from '@aws-cdk/aws-iam';

export class EmsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const userPool = new UserPool(this, 'ems-user-pool', {
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

    const webDashboardUserPoolClient = userPool.addClient('web-dashboard', {
                                                        userPoolClientName: 'WebDashboard',
                                                        preventUserExistenceErrors: true,
                                                        authFlows: {
                                                          userSrp: true,
                                                        },
                                                        disableOAuth: true,
                                                        supportedIdentityProviders: [UserPoolClientIdentityProvider.COGNITO],
                                                      },
    );

    const identityPool = new CfnIdentityPool(this, 'ems-identity-pool', {
      allowUnauthenticatedIdentities: false,
      identityPoolName: 'EMS-Identity-Pool',
      cognitoIdentityProviders: [
        {
          clientId: webDashboardUserPoolClient.userPoolClientId,
          providerName: userPool.userPoolProviderName,
        },
      ],
    });

    const unauthenticatedRole = new Role(this, 'EMSDefaultUnauthenticatedRole', {
      roleName: 'EMS-Default-Unauthenticated',
      assumedBy: new FederatedPrincipal('cognito-identity.amazonaws.com', {
        'StringEquals': { 'cognito-identity.amazonaws.com:aud': identityPool.ref },
        'ForAnyValue:StringLike': { 'cognito-identity.amazonaws.com:amr': 'unauthenticated' },
      }, 'sts:AssumeRoleWithWebIdentity'),
    });

    unauthenticatedRole.addToPolicy(new PolicyStatement({
                                                          effect: Effect.ALLOW,
                                                          actions: [
                                                            "mobileanalytics:PutEvents",
                                                            "cognito-sync:*"
                                                          ],
                                                          resources: ["*"],
                                                        }));

    const authenticatedRole = new Role(this, 'EMSDefaultAuthenticatedRole', {
      roleName: 'EMS-Default-Authenticated',
      assumedBy: new FederatedPrincipal('cognito-identity.amazonaws.com', {
        "StringEquals": { "cognito-identity.amazonaws.com:aud": identityPool.ref },
        "ForAnyValue:StringLike": { "cognito-identity.amazonaws.com:amr": "authenticated" },
      }, "sts:AssumeRoleWithWebIdentity"),
    });

    authenticatedRole.addToPolicy(new PolicyStatement({
                                                        effect: Effect.ALLOW,
                                                        actions: [
                                                          "mobileanalytics:PutEvents",
                                                          "cognito-sync:*",
                                                          "cognito-identity:*"
                                                        ],
                                                        resources: ["*"],
                                                      }));

    const identityPoolRoleAttachment = new CfnIdentityPoolRoleAttachment(this, 'EMSIdentityPoolRoleAttachment', {
      identityPoolId: identityPool.ref,
      roles: {
        'unauthenticated': unauthenticatedRole.roleArn,
        'authenticated': authenticatedRole.roleArn
      }
    });
  }
}
