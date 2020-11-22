import * as cdk from '@aws-cdk/core';
import { CfnRoute, HttpMethod, HttpRoute } from '@aws-cdk/aws-apigatewayv2';
import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import { Code, Function, Runtime } from '@aws-cdk/aws-lambda';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import HttpApiResources from '../HttpApiResources';
import DynamoDbResources from '../DynamoDbResources';

export default class VenueHttpEndpoints {
  private lambdaRootDir = './lambdas/venues/';

  constructor(
    scope: cdk.Construct,
    private httpApiResources: HttpApiResources,
    private dynamoResources: DynamoDbResources
  ) {
    const { api } = httpApiResources;

    const addVenueHandler = this.createAddVenueHandler(scope);
    const addVenueRoutes = api.addRoutes({
      path: '/venues',
      methods: [HttpMethod.POST],
      integration: addVenueHandler,
    });

    // Flattens all the individual arrays of routes into one single array
    const allAdminRoutes = Array<HttpRoute>().concat(...[addVenueRoutes]);
    httpApiResources.addAdminJwtAuthorizerToRoutes(allAdminRoutes);
  }

  private createAddVenueHandler(scope: cdk.Construct): LambdaProxyIntegration {
    const addVenueFunc = new Function(scope, 'AddVenueFunction', {
      runtime: Runtime.NODEJS_12_X,
      handler: 'index.handler',
      functionName: 'EmsAddVenue',
      code: Code.fromAsset(this.lambdaRootDir + 'addVenue'),
      environment: {
        TABLE_NAME: this.dynamoResources.venueTable.tableName,
      },
    });

    const policyStatement = new PolicyStatement();
    policyStatement.addResources(this.dynamoResources.venueTable.tableArn);
    policyStatement.addActions('dynamodb:PutItem');
    addVenueFunc.addToRolePolicy(policyStatement);

    return new LambdaProxyIntegration({
      handler: addVenueFunc,
    });
  }
}
