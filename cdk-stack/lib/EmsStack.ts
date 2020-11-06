import * as cdk from '@aws-cdk/core';
import CognitoResources from './CognitoResources';
import HttpApiResources from './HttpApiResources';
import UserRestEndpoints from './HttpEndpoints/UserHttpEndpoints';

export default class EmsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cognitoResources = new CognitoResources(this);
    const httpApiResources = new HttpApiResources(
      this,
      cognitoResources,
      this.region
    );
    const userRestEndpoints = new UserRestEndpoints(
      this,
      cognitoResources,
      httpApiResources
    );
  }
}
