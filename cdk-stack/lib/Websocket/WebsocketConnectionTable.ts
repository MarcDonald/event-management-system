import * as cdk from '@aws-cdk/core';
import { RemovalPolicy } from '@aws-cdk/core';
import { AttributeType, BillingMode, Table } from '@aws-cdk/aws-dynamodb';

export default class WebsocketConnectionTable {
  public readonly table: Table;
  public readonly websocketIndex: GSI;
  private readonly gsiName = 'WebsocketIndex';

  constructor(private scope: cdk.Construct) {
    this.table = this.createConnectionTable();
    this.websocketIndex = this.createWebsocketIndex();
    this.addIndexToTable(this.websocketIndex);
  }

  private createConnectionTable(): Table {
    return new Table(this.scope, 'WebsocketConnections', {
      tableName: 'EmsWebsocketConnections',
      partitionKey: {
        name: 'connectionId',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'websocket',
        type: AttributeType.STRING,
      },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });
  }

  private createWebsocketIndex(): GSI {
    return {
      indexName: this.gsiName,
      arn: `${this.table.tableArn}/index/${this.gsiName}`,
    };
  }

  private addIndexToTable(index: GSI) {
    this.table.addGlobalSecondaryIndex({
      indexName: index.indexName,
      partitionKey: {
        name: 'websocket',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'connectionId',
        type: AttributeType.STRING,
      },
    });
  }
}
