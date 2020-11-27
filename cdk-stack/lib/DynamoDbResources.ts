import * as cdk from '@aws-cdk/core';
import { RemovalPolicy } from '@aws-cdk/core';
import { AttributeType, BillingMode, Table } from '@aws-cdk/aws-dynamodb';

interface GSI {
  indexName: string;
  arn: string;
}

export default class DynamoDbResources {
  private readonly eventMetadataIndexName = 'EventMetadataIndex';

  public readonly venueTable: Table;
  public readonly eventsTable: Table;
  public readonly eventMetadataIndex: GSI;

  constructor(scope: cdk.Construct) {
    this.venueTable = this.createVenueTable(scope);
    this.eventsTable = this.createEventsTable(scope);
    this.eventMetadataIndex = {
      indexName: this.eventMetadataIndexName,
      arn: `${this.eventsTable.tableArn}/index/${this.eventMetadataIndexName}`,
    };
  }

  private createVenueTable = (scope: cdk.Construct): Table =>
    new Table(scope, 'VenueTable', {
      tableName: 'EmsVenues',
      partitionKey: { name: 'venueId', type: AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

  private createEventsTable = (scope: cdk.Construct): Table => {
    const table = new Table(scope, 'EventsTable', {
      tableName: 'EmsEvents',
      partitionKey: { name: 'eventId', type: AttributeType.STRING },
      sortKey: { name: 'metadata', type: AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    table.addGlobalSecondaryIndex({
      indexName: this.eventMetadataIndexName,
      partitionKey: {
        name: 'metadata',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'eventId',
        type: AttributeType.STRING,
      },
    });

    return table;
  };
}
