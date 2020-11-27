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

    const updateEventInformationRoutes = api.addRoutes({
      path: '/events/{eventId}/information',
      methods: [HttpMethod.PUT],
      integration: this.createUpdateEventInformationHandler(),
    });

    const updateEventStaffRoutes = api.addRoutes({
      path: '/events/{eventId}/staff',
      methods: [HttpMethod.PUT],
      integration: this.createUpdateEventStaffHandler(),
    });

    const updateEventSupervisorsRoutes = api.addRoutes({
      path: '/events/{eventId}/supervisors',
      methods: [HttpMethod.PUT],
      integration: this.createUpdateEventSupervisorsHandler(),
    });

    // Flattens all the individual arrays of routes into one single array
    const allAdminRoutes = Array<HttpRoute>().concat(
      ...[
        addEventRoutes,
        getAllEventsRoutes,
        deleteEventRoutes,
        updateEventInformationRoutes,
        updateEventStaffRoutes,
        updateEventSupervisorsRoutes,
      ]
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
        METADATA_INDEX_NAME: this.dynamoResources.metadataIndex.indexName,
      },
      [this.dynamoResources.metadataIndex.arn]
    );
  }

  private createUpdateEventInformationHandler(): LambdaProxyIntegration {
    return this.createHandler(
      'UpdateEventInformationFunction',
      'EmsUpdateEventInformation',
      'updateEventInformation',
      ['dynamodb:UpdateItem', 'dynamodb:Query']
    );
  }

  private createUpdateEventStaffHandler(): LambdaProxyIntegration {
    return this.createHandler(
      'UpdateEventStaffFunction',
      'EmsUpdateEventStaff',
      'updateEventStaff',
      ['dynamodb:UpdateItem']
    );
  }

  private createUpdateEventSupervisorsHandler(): LambdaProxyIntegration {
    return this.createHandler(
      'UpdateEventSupervisorsFunction',
      'EmsUpdateEventSupervisors',
      'updateEventSupervisors',
      ['dynamodb:UpdateItem']
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
    const { tableName, tableArn } = this.dynamoResources.table;

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
