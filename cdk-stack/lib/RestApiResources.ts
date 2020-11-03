import * as cdk from '@aws-cdk/core';
import { CfnAuthorizer, HttpApi } from '@aws-cdk/aws-apigatewayv2';
import CognitoResources from './CognitoResources';
import { Code, Function, Runtime } from '@aws-cdk/aws-lambda';
import {
  ArnPrincipal,
  Effect,
  FederatedPrincipal,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from '@aws-cdk/aws-iam';

export default class RestApiResources {
  public readonly api: HttpApi;
  public readonly jwtAuthorizer: CfnAuthorizer;
  public readonly adminJwtAuthorizer: CfnAuthorizer;

  constructor(
    scope: cdk.Construct,
    cognitoResources: CognitoResources,
    region: string
  ) {
    this.api = this.createApi(scope);
    this.jwtAuthorizer = this.createJwtAuthorizer(
      scope,
      this.api,
      cognitoResources
    );
    this.adminJwtAuthorizer = this.createAdminJwtAuthorizer(
      scope,
      this.api,
      cognitoResources,
      region
    );
  }

  private createApi = (scope: cdk.Construct): HttpApi => {
    const api = new HttpApi(scope, 'RestAPI', {
      apiName: 'EmsRestApi',
      createDefaultStage: false,
    });

    api.addStage('production', {
      stageName: 'production',
      autoDeploy: true,
    });

    return api;
  };

  private createJwtAuthorizer = (
    scope: cdk.Construct,
    api: HttpApi,
    cognitoResources: CognitoResources
  ): CfnAuthorizer =>
    new CfnAuthorizer(scope, 'EmsJWTAuthorizer', {
      apiId: api.httpApiId,
      authorizerType: 'JWT',
      identitySource: ['$request.header.Authorization'],
      name: 'ems-jwt-authorizer',
      jwtConfiguration: {
        issuer: `https://cognito-idp.eu-west-1.amazonaws.com/${cognitoResources.userPool.userPoolId}`,
        audience: [
          cognitoResources.webDashboardUserPoolClient.userPoolClientId,
        ],
      },
    });

  private createAdminJwtAuthorizer = (
    scope: cdk.Construct,
    api: HttpApi,
    cognitoResources: CognitoResources,
    region: string
  ): CfnAuthorizer => {
    const authorizerFunc = new Function(scope, 'AdminAuthorizerFunction', {
      runtime: Runtime.NODEJS_12_X,
      handler: 'index.handler',
      functionName: 'EmsAdminAuthorizer',
      code: Code.fromAsset('./lambdas/authorizers/adminAuthorizer'),
      environment: {
        USER_POOL_ID: cognitoResources.userPool.userPoolId,
        REGION: region,
      },
    });

    const testRole = new Role(scope, 'EmsTestRole', {
      roleName: 'EmsTestRole',
      assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
    });

    testRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['lambda:InvokeFunction'],
        resources: [authorizerFunc.functionArn],
      })
    );

    return new CfnAuthorizer(scope, 'EmsAdminAuthorizer', {
      apiId: api.httpApiId,
      authorizerType: 'REQUEST',
      identitySource: ['$request.header.Authorization'],
      authorizerResultTtlInSeconds: 300,
      name: 'ems-admin-authorizer',
      enableSimpleResponses: true,
      authorizerCredentialsArn: testRole.roleArn,
      authorizerPayloadFormatVersion: '2.0',
      authorizerUri: `arn:aws:apigateway:${region}:lambda:path/2015-03-31/functions/${authorizerFunc.functionArn}/invocations`,
    });
  };
}
