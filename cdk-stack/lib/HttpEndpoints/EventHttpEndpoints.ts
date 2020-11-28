import * as cdk from '@aws-cdk/core';
import { HttpMethod, HttpRoute } from '@aws-cdk/aws-apigatewayv2';
import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import HttpApiResources from '../HttpApiResources';
import DynamoDbResources from '../DynamoDbResources';
import { createBaseHandler } from '../Utils/LambdaUtils';
import { Http } from 'aws-sdk/clients/xray';

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

    const getUpcomingEventsRoutes = api.addRoutes({
      path: '/events/upcoming',
      methods: [HttpMethod.GET],
      integration: this.createGetUpcomingEventsHandler(),
    });

    const addAssistanceRequestRoutes = api.addRoutes({
      path: '/events/{eventId}/assistance',
      methods: [HttpMethod.POST],
      integration: this.createAddAssistanceRequestHandler(),
    });

    const getAssistanceRequestRoutes = api.addRoutes({
      path: '/events/{eventId}/assistance',
      methods: [HttpMethod.GET],
      integration: this.createGetAssistanceRequestsHandler(),
    });

    httpApiResources.addAdminJwtAuthorizerToRoutes(
      Array<HttpRoute>().concat(
        ...[
          addEventRoutes,
          getAllEventsRoutes,
          deleteEventRoutes,
          updateEventInformationRoutes,
          updateEventStaffRoutes,
          updateEventSupervisorsRoutes,
        ]
      )
    );

    httpApiResources.addJwtAuthorizerToRoutes(
      Array<HttpRoute>().concat(
        ...[getUpcomingEventsRoutes, addAssistanceRequestRoutes]
      )
    );

    httpApiResources.addControlRoomAuthorizerToRoutes(
      Array<HttpRoute>().concat(...[getAssistanceRequestRoutes])
    );
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
      true
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

  private createGetUpcomingEventsHandler(): LambdaProxyIntegration {
    return this.createHandler(
      'GetUpcomingEventsFunction',
      'EmsGetUpcomingEvents',
      'getUpcomingEvents',
      ['dynamodb:Query'],
      true
    );
  }

  private createAddAssistanceRequestHandler(): LambdaProxyIntegration {
    return this.createHandler(
      'AddAssistanceRequestFunction',
      'EmsAddAssistanceRequest',
      'addAssistanceRequest',
      ['dynamodb:PutItem']
    );
  }

  private createGetAssistanceRequestsHandler(): LambdaProxyIntegration {
    return this.createHandler(
      'GetAssistanceRequestsFunction',
      'EmsGetAssistanceRequests',
      'getAssistanceRequests',
      ['dynamodb:Query'],
      true
    );
  }

  private createHandler(
    functionId: string,
    functionName: string,
    codeDir: string,
    actions: string[],
    usesIndex: boolean = false
  ): LambdaProxyIntegration {
    const { tableName, tableArn } = this.dynamoResources.table;
    const { indexName, arn: indexArn } = this.dynamoResources.metadataIndex;

    let environment: { [key: string]: string } = { TABLE_NAME: tableName };
    let resources = [tableArn];
    if (usesIndex) {
      environment = { ...environment, METADATA_INDEX_NAME: indexName };
      resources = [...resources, indexArn];
    }

    return createBaseHandler(
      this.scope,
      functionId,
      functionName,
      `./lambdas/events/${codeDir}`,
      resources,
      actions,
      environment
    );
  }
}
