import * as cdk from '@aws-cdk/core';
import { HttpMethod, HttpRoute } from '@aws-cdk/aws-apigatewayv2';
import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import { Code, Function, Runtime } from '@aws-cdk/aws-lambda';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import HttpApiResources from '../HttpApiResources';
import DynamoDbResources from '../DynamoDbResources';

export default class VenueHttpEndpoints {
  private lambdaRootDir = './lambdas/venues/';

  constructor(
    scope: cdk.Construct,
    httpApiResources: HttpApiResources,
    dynamoResources: DynamoDbResources
  ) {
    const { api } = httpApiResources;
    const { tableName, tableArn } = dynamoResources.venueTable;

    const addVenueRoutes = api.addRoutes({
      path: '/venues',
      methods: [HttpMethod.POST],
      integration: this.createAddVenueHandler(scope, tableName, tableArn),
    });

    const getAllRoutes = api.addRoutes({
      path: '/venues',
      methods: [HttpMethod.GET],
      integration: this.createGetAllVenuesHandler(scope, tableName, tableArn),
    });

    const getOneRoutes = api.addRoutes({
      path: '/venues/{venueId}',
      methods: [HttpMethod.GET],
      integration: this.createGetVenueHandler(scope, tableName, tableArn),
    });

    const deleteOneRoutes = api.addRoutes({
      path: '/venues/{venueId}',
      methods: [HttpMethod.DELETE],
      integration: this.createDeleteVenueHandler(scope, tableName, tableArn),
    });

    const updateMetadataRoutes = api.addRoutes({
      path: '/venues/{venueId}/metadata',
      methods: [HttpMethod.PUT],
      integration: this.createUpdateMetadataHandler(scope, tableName, tableArn),
    });

    // Flattens all the individual arrays of routes into one single array
    const allAdminRoutes = Array<HttpRoute>().concat(
      ...[
        addVenueRoutes,
        getAllRoutes,
        getOneRoutes,
        deleteOneRoutes,
        updateMetadataRoutes,
      ]
    );
    httpApiResources.addAdminJwtAuthorizerToRoutes(allAdminRoutes);
  }

  private createAddVenueHandler(
    scope: cdk.Construct,
    tableName: string,
    tableArn: string
  ): LambdaProxyIntegration {
    const addVenueFunc = new Function(scope, 'AddVenueFunction', {
      runtime: Runtime.NODEJS_12_X,
      handler: 'index.handler',
      functionName: 'EmsAddVenue',
      code: Code.fromAsset(this.lambdaRootDir + 'addVenue'),
      environment: {
        TABLE_NAME: tableName,
      },
    });

    const policyStatement = new PolicyStatement();
    policyStatement.addResources(tableArn);
    policyStatement.addActions('dynamodb:PutItem');
    addVenueFunc.addToRolePolicy(policyStatement);

    return new LambdaProxyIntegration({
      handler: addVenueFunc,
    });
  }

  private createGetVenueHandler(
    scope: cdk.Construct,
    tableName: string,
    tableArn: string
  ): LambdaProxyIntegration {
    const getVenueFunc = new Function(scope, 'GetVenueFunction', {
      runtime: Runtime.NODEJS_12_X,
      handler: 'index.handler',
      functionName: 'EmsGetVenue',
      code: Code.fromAsset(this.lambdaRootDir + 'getVenue'),
      environment: {
        TABLE_NAME: tableName,
      },
    });

    const policyStatement = new PolicyStatement();
    policyStatement.addResources(tableArn);
    policyStatement.addActions('dynamodb:Query');
    getVenueFunc.addToRolePolicy(policyStatement);

    return new LambdaProxyIntegration({
      handler: getVenueFunc,
    });
  }

  private createDeleteVenueHandler(
    scope: cdk.Construct,
    tableName: string,
    tableArn: string
  ): LambdaProxyIntegration {
    const deleteVenueFunc = new Function(scope, 'DeleteVenueFunction', {
      runtime: Runtime.NODEJS_12_X,
      handler: 'index.handler',
      functionName: 'EmsDeleteVenue',
      code: Code.fromAsset(this.lambdaRootDir + 'deleteVenue'),
      environment: {
        TABLE_NAME: tableName,
      },
    });

    const policyStatement = new PolicyStatement();
    policyStatement.addResources(tableArn);
    policyStatement.addActions('dynamodb:DeleteItem');
    deleteVenueFunc.addToRolePolicy(policyStatement);

    return new LambdaProxyIntegration({
      handler: deleteVenueFunc,
    });
  }

  private createGetAllVenuesHandler(
    scope: cdk.Construct,
    tableName: string,
    tableArn: string
  ): LambdaProxyIntegration {
    const getAllVenuesFunc = new Function(scope, 'GetAllVenuesFunction', {
      runtime: Runtime.NODEJS_12_X,
      handler: 'index.handler',
      functionName: 'EmsGetAllVenues',
      code: Code.fromAsset(this.lambdaRootDir + 'getAllVenues'),
      environment: {
        TABLE_NAME: tableName,
      },
    });

    const policyStatement = new PolicyStatement();
    policyStatement.addResources(tableArn);
    policyStatement.addActions('dynamodb:Scan');
    getAllVenuesFunc.addToRolePolicy(policyStatement);

    return new LambdaProxyIntegration({
      handler: getAllVenuesFunc,
    });
  }

  private createUpdateMetadataHandler(
    scope: cdk.Construct,
    tableName: string,
    tableArn: string
  ): LambdaProxyIntegration {
    const updateMetadataFunc = new Function(
      scope,
      'UpdateVenueMetadataFunction',
      {
        runtime: Runtime.NODEJS_12_X,
        handler: 'index.handler',
        functionName: 'EmsUpdateVenueMetadata',
        code: Code.fromAsset(this.lambdaRootDir + 'updateVenueMetadata'),
        environment: {
          TABLE_NAME: tableName,
        },
      }
    );

    const policyStatement = new PolicyStatement();
    policyStatement.addResources(tableArn);
    policyStatement.addActions('dynamodb:UpdateItem');
    updateMetadataFunc.addToRolePolicy(policyStatement);

    return new LambdaProxyIntegration({
      handler: updateMetadataFunc,
    });
  }
}
