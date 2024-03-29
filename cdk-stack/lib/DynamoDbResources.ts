import * as cdk from '@aws-cdk/core';
import { RemovalPolicy } from '@aws-cdk/core';
import { AttributeType, BillingMode, Table } from '@aws-cdk/aws-dynamodb';

/**
 * DynamoDB Table and Global Secondary Index
 */
export default class DynamoDbResources {
  public readonly table: Table;
  public readonly metadataIndex: GSI;

  private readonly metadataIndexName = 'EventMetadataIndex';

  constructor(private scope: cdk.Construct) {
    this.table = this.createTable();
    this.metadataIndex = this.createMetadataIndex();
    this.addIndexToTable(this.metadataIndex);
  }

  private createTable = (): Table => {
    return new Table(this.scope, 'MainTable', {
      tableName: 'EventManagementSystem',
      partitionKey: { name: 'id', type: AttributeType.STRING },
      sortKey: { name: 'metadata', type: AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });
  };

  private createMetadataIndex(): GSI {
    return {
      indexName: this.metadataIndexName,
      arn: `${this.table.tableArn}/index/${this.metadataIndexName}`,
    };
  }

  private addIndexToTable(index: GSI) {
    this.table.addGlobalSecondaryIndex({
      indexName: index.indexName,
      partitionKey: {
        name: 'metadata',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
    });
  }
}
