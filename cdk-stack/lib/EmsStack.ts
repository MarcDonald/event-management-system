import * as cdk from '@aws-cdk/core';
import CognitoResources from './CognitoResources';
import HttpApiResources from './HttpApiResources';
import StaffHttpEndpoints from './HttpEndpoints/StaffHttpEndpoints';
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
    const staffHttpEndpoints = new StaffHttpEndpoints(
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
