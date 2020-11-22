import * as cdk from '@aws-cdk/core';
import CognitoResources from './CognitoResources';
import HttpApiResources from './HttpApiResources';
import UserHttpEndpoints from './HttpEndpoints/UserHttpEndpoints';
import DynamoDbResources from './DynamoDbResources';
import VenueHttpEndpoints from './HttpEndpoints/VenueHttpEndpoints';

export default class EmsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cognitoResources = new CognitoResources(this);
    const dynamoDbResources = new DynamoDbResources(this);
    const httpApiResources = new HttpApiResources(
      this,
      cognitoResources,
      this.region
    );
    const userHttpEndpoints = new UserHttpEndpoints(
      this,
      cognitoResources,
      httpApiResources
    );
    const venueHttpEndpoints = new VenueHttpEndpoints(
      this,
      httpApiResources,
      dynamoDbResources
    );
  }
}
