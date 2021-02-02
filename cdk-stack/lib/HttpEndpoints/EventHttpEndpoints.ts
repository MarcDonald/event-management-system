import * as cdk from '@aws-cdk/core';
import { HttpMethod, HttpRoute } from '@aws-cdk/aws-apigatewayv2';
import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import HttpApiResources from '../HttpApiResources';
import DynamoDbResources from '../DynamoDbResources';
import { createBaseHandler } from '../Utils/LambdaUtils';

/**
 * /venues/ endpoints for the HttpApi
 */
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

    const getEventInformation = api.addRoutes({
      path: '/events/{eventId}/information',
      methods: [HttpMethod.GET],
      integration: this.createGetEventInformationHandler(),
    });

    const updateEventInformationRoutes = api.addRoutes({
      path: '/events/{eventId}/information',
      methods: [HttpMethod.PUT],
      integration: this.createUpdateEventInformationHandler(),
    });

    const getEventVenueStatus = api.addRoutes({
      path: '/events/{eventId}/status',
      methods: [HttpMethod.GET],
      integration: this.createGetEventVenueStatusHandler(),
    });

    const updateEventVenueStatus = api.addRoutes({
      path: '/events/{eventId}/status',
      methods: [HttpMethod.PUT],
      integration: this.createUpdateEventVenueStatusHandler(),
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

    const getUpcomingEventsForUserRoutes = api.addRoutes({
      path: '/events/upcoming/{username}',
      methods: [HttpMethod.GET],
      integration: this.createGetUpcomingEventsForUserHandler(),
    });

    httpApiResources.addSameUsernameAuthorizerToRoutes(
      Array<HttpRoute>().concat(...[getUpcomingEventsForUserRoutes])
    );

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
        ...[
          getUpcomingEventsRoutes,
          addAssistanceRequestRoutes,
          getEventVenueStatus,
        ]
      )
    );

    httpApiResources.addControlRoomAuthorizerToRoutes(
      Array<HttpRoute>().concat(
        ...[
          getAssistanceRequestRoutes,
          getEventInformation,
          updateEventVenueStatus,
        ]
      )
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

  private createGetEventInformationHandler(): LambdaProxyIntegration {
    return this.createHandler(
      'GetEventInformationFunction',
      'EmsGetEventInformation',
      'getEventInformation',
      ['dynamodb:Query']
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

  private createGetEventVenueStatusHandler(): LambdaProxyIntegration {
    return this.createHandler(
      'GetEventVenueStatusFunction',
      'EmsGetEventVenueStatusFunction',
      'getEventVenueStatus',
      ['dynamodb:Query']
    );
  }

  private createUpdateEventVenueStatusHandler(): LambdaProxyIntegration {
    return this.createHandler(
      'UpdateEventVenueStatusFunction',
      'EmsUpdateEventVenueStatusFunction',
      'updateEventVenueStatus',
      ['dynamodb:PutItem']
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

  private createGetUpcomingEventsForUserHandler(): LambdaProxyIntegration {
    return this.createHandler(
      'GetUpcomingEventsForUserFunction',
      'EmsGetUpcomingEventsForUser',
      'getUpcomingEventsForUser',
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
