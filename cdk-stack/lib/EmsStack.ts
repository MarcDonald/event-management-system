import * as cdk from '@aws-cdk/core';
import CognitoResources from './CognitoResources';
import HttpApiResources from './HttpApiResources';
import StaffHttpEndpoints from './HttpEndpoints/StaffHttpEndpoints';
import DynamoDbResources from './DynamoDbResources';
import VenueHttpEndpoints from './HttpEndpoints/VenueHttpEndpoints';
import EventHttpEndpoints from './HttpEndpoints/EventHttpEndpoints';
import WebsocketResources from './Websocket/WebsocketResources';
import WebsocketConnectionTable from './Websocket/WebsocketConnectionTable';
import WebAppResources from './WebAppResources';

/**
 * Main Stack
 */
export default class EmsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cognitoResources = new CognitoResources(this);
    const dynamoDbResources = new DynamoDbResources(this);
    const websocketConnectionTableResources = new WebsocketConnectionTable(
      this
    );
    const websocketResources = new WebsocketResources(
      this,
      websocketConnectionTableResources,
      cognitoResources,
      this.region
    );
    const httpApiResources = new HttpApiResources(
      this,
      cognitoResources,
      dynamoDbResources,
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
    const eventsHttpEndpoints = new EventHttpEndpoints(
      this,
      httpApiResources,
      dynamoDbResources,
      websocketConnectionTableResources,
      websocketResources,
      this.region,
      this.account
    );
    const webAppDeployment = new WebAppResources(this);
  }
}
