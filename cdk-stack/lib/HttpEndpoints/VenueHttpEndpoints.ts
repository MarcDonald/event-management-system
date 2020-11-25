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
    const { tableName, tableArn } = dynamoResources.venueTable;

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

    const updateMetadataRoutes = api.addRoutes({
      path: '/venues/{venueId}/metadata',
      methods: [HttpMethod.PUT],
      integration: this.createUpdateMetadataHandler(),
    });

    const addPositionsRoutes = api.addRoutes({
      path: '/venues/{venueId}/positions',
      methods: [HttpMethod.POST],
      integration: this.createAddPositionsHandler(),
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
        updateMetadataRoutes,
        addPositionsRoutes,
        deletePositionsRoutes,
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
      ['dynamodb:Scan']
    );
  }

  private createUpdateMetadataHandler(): LambdaProxyIntegration {
    return this.createHandler(
      'UpdateVenueMetadataFunction',
      'EmsUpdateVenueMetadata',
      'updateVenueMetadata',
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
    actions: string[]
  ): LambdaProxyIntegration {
    const { tableName, tableArn } = this.dynamoResources.venueTable;
    return createBaseHandler(
      this.scope,
      functionId,
      functionName,
      `./lambdas/venues/${codeDir}`,
      [tableArn],
      actions,
      { TABLE_NAME: tableName }
    );
  }
}
