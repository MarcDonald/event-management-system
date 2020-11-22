import * as cdk from '@aws-cdk/core';
import { RemovalPolicy } from '@aws-cdk/core';
import { Table, AttributeType, BillingMode } from '@aws-cdk/aws-dynamodb';

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
      partitionKey: { name: 'positionId', type: AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });
}
