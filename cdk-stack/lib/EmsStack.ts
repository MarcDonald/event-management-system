import * as cdk from '@aws-cdk/core';
import CognitoResources from './CognitoResources';
import RestApiResources from './RestApiResources';
import UserRestEndpoints from './RestEndpoints/UserRestEndpoints';

export class EmsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cognitoResources = new CognitoResources(this);
    const restAPIResources = new RestApiResources(
      this,
      cognitoResources,
      this.region
    );
    const userRestEndpoints = new UserRestEndpoints(
      this,
      cognitoResources,
      restAPIResources
    );
  }
}
