import * as cdk from '@aws-cdk/core';
import { RemovalPolicy } from '@aws-cdk/core';
import { AttributeType, BillingMode, Table } from '@aws-cdk/aws-dynamodb';

export default class DynamoDbResources {
  public readonly venueTable: Table;
  public readonly eventsTable: Table;

  constructor(scope: cdk.Construct) {
    this.venueTable = this.createVenueTable(scope);
    this.eventsTable = this.createEventsTable(scope);
  }

  private createVenueTable = (scope: cdk.Construct): Table =>
    new Table(scope, 'VenueTable', {
      tableName: 'EmsVenues',
      partitionKey: { name: 'venueId', type: AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

  private createEventsTable = (scope: cdk.Construct): Table =>
    new Table(scope, 'EventsTable', {
      tableName: 'EmsEvents',
      partitionKey: { name: 'eventId', type: AttributeType.STRING },
      sortKey: { name: 'metadata', type: AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });
}
