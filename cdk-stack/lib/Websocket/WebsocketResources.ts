import * as cdk from '@aws-cdk/core';
import WebsocketConnectionTable from './WebsocketConnectionTable';
import Websocket from './Websocket';

export default class WebsocketResources {
  readonly assistanceRequestsWebsocket: Websocket;
  readonly venueStatusWebsocket: Websocket;

  constructor(
    private scope: cdk.Construct,
    private connectionTable: WebsocketConnectionTable
  ) {
    this.assistanceRequestsWebsocket = new Websocket(
      scope,
      connectionTable,
      'AssistanceRequestWebsocket',
      './lambdas/assistanceRequestWebsocket'
    );
    this.venueStatusWebsocket = new Websocket(
      scope,
      connectionTable,
      'VenueStatusWebsocket',
      './lambdas/venueStatusWebsocket'
    );
  }
}
