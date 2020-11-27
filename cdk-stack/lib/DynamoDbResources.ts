import * as cdk from '@aws-cdk/core';
import { RemovalPolicy } from '@aws-cdk/core';
import { AttributeType, BillingMode, Table } from '@aws-cdk/aws-dynamodb';

interface GSI {
  indexName: string;
  arn: string;
}

export default class DynamoDbResources {
  private readonly metadataIndexName = 'EventMetadataIndex';

  public readonly table: Table;
  public readonly metadataIndex: GSI;

  constructor(scope: cdk.Construct) {
    this.table = this.createTable(scope);
    this.metadataIndex = {
      indexName: this.metadataIndexName,
      arn: `${this.table.tableArn}/index/${this.metadataIndexName}`,
    };
  }

  private createTable = (scope: cdk.Construct): Table => {
    const table = new Table(scope, 'MainTable', {
      tableName: 'EventManagementSystem',
      partitionKey: { name: 'id', type: AttributeType.STRING },
      sortKey: { name: 'metadata', type: AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    table.addGlobalSecondaryIndex({
      indexName: this.metadataIndexName,
      partitionKey: {
        name: 'metadata',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
    });

    return table;
  };
}
