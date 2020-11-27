import * as cdk from '@aws-cdk/core';
import { HttpMethod, HttpRoute } from '@aws-cdk/aws-apigatewayv2';
import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import HttpApiResources from '../HttpApiResources';
import DynamoDbResources from '../DynamoDbResources';
import { createBaseHandler } from '../Utils/LambdaUtils';

export default class VenueHttpEndpoints {
  constructor(
    private scope: cdk.Construct,
    httpApiResources: HttpApiResources,
    private dynamoResources: DynamoDbResources
  ) {
    const { api } = httpApiResources;

    const getAllEventsRoutes = api.addRoutes({
      path: '/events',
      methods: [HttpMethod.GET],
      integration: this.createGetAllEventsHandler(),
    });

    const deleteEventRoutes = api.addRoutes({
      path: '/events/{eventId}',
      methods: [HttpMethod.DELETE],
      integration: this.createDeleteEventHandler(),
    });

    const addEventRoutes = api.addRoutes({
      path: '/events',
      methods: [HttpMethod.POST],
      integration: this.createAddEventHandler(),
    });

    // Flattens all the individual arrays of routes into one single array
    const allAdminRoutes = Array<HttpRoute>().concat(
      ...[addEventRoutes, getAllEventsRoutes, deleteEventRoutes]
    );
    httpApiResources.addAdminJwtAuthorizerToRoutes(allAdminRoutes);
  }

  private createAddEventHandler(): LambdaProxyIntegration {
    return this.createHandler('AddEventFunction', 'EmsAddEvent', 'addEvent', [
      'dynamodb:PutItem',
    ]);
  }

  private createDeleteEventHandler(): LambdaProxyIntegration {
    return this.createHandler(
      'DeleteEventFunction',
      'EmsDeleteEvent',
      'deleteEvent',
      ['dynamodb:DeleteItem']
    );
  }

  private createGetAllEventsHandler(): LambdaProxyIntegration {
    return this.createHandler(
      'GetAllEventsFunction',
      'EmsGetAllEvents',
      'getAllEvents',
      ['dynamodb:Query'],
      {
        EVENT_METADATA_INDEX_NAME: this.dynamoResources.eventMetadataIndex
          .indexName,
      },
      [this.dynamoResources.eventMetadataIndex.arn]
    );
  }

  private createHandler(
    functionId: string,
    functionName: string,
    codeDir: string,
    actions: string[],
    additionalEnvironmentVariables?: object,
    additionalResources?: string[]
  ): LambdaProxyIntegration {
    const { tableName, tableArn } = this.dynamoResources.eventsTable;

    let resources = [tableArn];
    if (additionalResources) {
      resources = [...resources, ...additionalResources];
    }

    return createBaseHandler(
      this.scope,
      functionId,
      functionName,
      `./lambdas/events/${codeDir}`,
      resources,
      actions,
      { TABLE_NAME: tableName, ...additionalEnvironmentVariables }
    );
  }
}
