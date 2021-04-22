import * as cdk from '@aws-cdk/core';
import { RemovalPolicy } from '@aws-cdk/core';
import { AttributeType, BillingMode, Table } from '@aws-cdk/aws-dynamodb';

/**
 * DynamoDB table for storing WebSocket connections
 */
export default class WebsocketConnectionTable {
  public readonly table: Table;

  constructor(private scope: cdk.Construct) {
    this.table = this.createConnectionTable();
  }

  private createConnectionTable(): Table {
    return new Table(this.scope, 'WebsocketConnections', {
      tableName: 'EmsWebsocketConnections',
      partitionKey: {
        name: 'websocket',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'connectionId',
        type: AttributeType.STRING,
      },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });
  }
}
