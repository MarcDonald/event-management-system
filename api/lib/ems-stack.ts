import * as cdk from "@aws-cdk/core";
import { AccountRecovery, StringAttribute, UserPool } from "@aws-cdk/aws-cognito";

export class EmsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const userPool = new UserPool(this, "ems-user-pool", {
      userPoolName: "EMS-User-Pool",
      accountRecovery: AccountRecovery.NONE,
      signInAliases: {
        username: true
      },
      passwordPolicy: {
        requireDigits: true,
        requireLowercase: true,
        requireUppercase: true,
        requireSymbols: false
      },
      standardAttributes: {
        givenName: {
          required: true,
          mutable: true
        },
        familyName: {
          required: true,
          mutable: true
        }
      },
      selfSignUpEnabled: true,
      customAttributes: {
        "jobRole": new StringAttribute({ mutable: true }),
      }
    });

    userPool.addClient('web-dashboard', {
      userPoolClientName: 'WebDashboard',
      authFlows: {
        userSrp: true
      },
      disableOAuth: true,
    })
  }
}
