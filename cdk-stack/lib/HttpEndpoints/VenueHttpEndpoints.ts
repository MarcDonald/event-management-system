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

    const addVenueRoutes = api.addRoutes({
      path: '/venues',
      methods: [HttpMethod.POST],
      integration: this.createAddVenueHandler(),
    });

    const getAllRoutes = api.addRoutes({
      path: '/venues',
      methods: [HttpMethod.GET],
      integration: this.createGetAllVenuesHandler(),
    });

    const getOneRoutes = api.addRoutes({
      path: '/venues/{venueId}',
      methods: [HttpMethod.GET],
      integration: this.createGetVenueHandler(),
    });

    const deleteOneRoutes = api.addRoutes({
      path: '/venues/{venueId}',
      methods: [HttpMethod.DELETE],
      integration: this.createDeleteVenueHandler(),
    });

    const updateInformationRoutes = api.addRoutes({
      path: '/venues/{venueId}/information',
      methods: [HttpMethod.PUT],
      integration: this.createUpdateInformationHandler(),
    });

    const addPositionsRoutes = api.addRoutes({
      path: '/venues/{venueId}/positions',
      methods: [HttpMethod.POST],
      integration: this.createAddPositionsHandler(),
    });

    const updatePositionsRoutes = api.addRoutes({
      path: '/venues/{venueId}/positions',
      methods: [HttpMethod.PUT],
      integration: this.createUpdatePositionsHandler(),
    });

    const deletePositionsRoutes = api.addRoutes({
      path: '/venues/{venueId}/positions',
      methods: [HttpMethod.DELETE],
      integration: this.createDeletePositionsHandler(),
    });

    // Flattens all the individual arrays of routes into one single array
    const allAdminRoutes = Array<HttpRoute>().concat(
      ...[
        addVenueRoutes,
        getAllRoutes,
        getOneRoutes,
        deleteOneRoutes,
        updateInformationRoutes,
        addPositionsRoutes,
        deletePositionsRoutes,
        updatePositionsRoutes,
      ]
    );
    httpApiResources.addAdminJwtAuthorizerToRoutes(allAdminRoutes);
  }

  private createAddVenueHandler(): LambdaProxyIntegration {
    return this.createHandler('AddVenueFunction', 'EmsAddVenue', 'addVenue', [
      'dynamodb:PutItem',
    ]);
  }

  private createGetVenueHandler(): LambdaProxyIntegration {
    return this.createHandler('GetVenueFunction', 'EmsGetVenue', 'getVenue', [
      'dynamodb:Query',
    ]);
  }

  private createDeleteVenueHandler(): LambdaProxyIntegration {
    return this.createHandler(
      'DeleteVenueFunction',
      'EmsDeleteVenue',
      'deleteVenue',
      ['dynamodb:DeleteItem']
    );
  }

  private createGetAllVenuesHandler(): LambdaProxyIntegration {
    return this.createHandler(
      'GetAllVenuesFunction',
      'EmsGetAllVenues',
      'getAllVenues',
      ['dynamodb:Query'],
      {
        METADATA_INDEX_NAME: this.dynamoResources.metadataIndex.indexName,
      },
      [this.dynamoResources.metadataIndex.arn]
    );
  }

  private createUpdateInformationHandler(): LambdaProxyIntegration {
    return this.createHandler(
      'UpdateVenueMetadataFunction',
      'EmsUpdateVenueMetadata',
      'updateVenueInformation',
      ['dynamodb:UpdateItem']
    );
  }

  private createAddPositionsHandler(): LambdaProxyIntegration {
    return this.createHandler(
      'AddVenuePositionsFunction',
      'EmsAddVenuePositions',
      'addVenuePositions',
      ['dynamodb:UpdateItem']
    );
  }

  private createUpdatePositionsHandler(): LambdaProxyIntegration {
    return this.createHandler(
      'UpdateVenuePositionsFunction',
      'EmsUpdateVenuePositions',
      'updateVenuePositions',
      ['dynamodb:UpdateItem', 'dynamodb:Query']
    );
  }

  private createDeletePositionsHandler(): LambdaProxyIntegration {
    return this.createHandler(
      'DeleteVenuePositionsFunction',
      'EmsDeleteVenuePositions',
      'deleteVenuePositions',
      ['dynamodb:UpdateItem', 'dynamodb:Query']
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
      `./lambdas/venues/${codeDir}`,
      resources,
      actions,
      { TABLE_NAME: tableName, ...additionalEnvironmentVariables }
    );
  }
}
