import * as cdk from '@aws-cdk/core';
import WebsocketConnectionTable from './WebsocketConnectionTable';
import Websocket from './Websocket';
import CognitoResources from '../CognitoResources';

export default class WebsocketResources {
  readonly assistanceRequestsWebsocket: Websocket;
  readonly venueStatusWebsocket: Websocket;

  constructor(
    private scope: cdk.Construct,
    private connectionTable: WebsocketConnectionTable,
    private cognitoResources: CognitoResources,
    private region: string
  ) {
    this.assistanceRequestsWebsocket = new Websocket(
      scope,
      connectionTable,
      'AssistanceRequestWebsocket',
      './lambdas/assistanceRequestWebsocket',
      cognitoResources,
      region
    );
    this.venueStatusWebsocket = new Websocket(
      scope,
      connectionTable,
      'VenueStatusWebsocket',
      './lambdas/venueStatusWebsocket',
      cognitoResources,
      region
    );
  }
}
