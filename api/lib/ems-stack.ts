import * as cdk from '@aws-cdk/core';
import { CognitoResources } from './cognito-resources';

export class EmsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cognitoResources = new CognitoResources(this);
  }
}
