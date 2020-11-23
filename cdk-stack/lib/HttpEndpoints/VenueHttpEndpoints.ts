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

    const getOneRoutes = api.addRoutes({
      path: '/venues/{venueId}',
      methods: [HttpMethod.GET],
      integration: this.createGetVenueHandler(scope, tableName, tableArn),
    });

    // Flattens all the individual arrays of routes into one single array
    const allAdminRoutes = Array<HttpRoute>().concat(
      ...[addVenueRoutes, getOneRoutes]
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
}
