import * as cdk from '@aws-cdk/core';
import {
  CfnAuthorizer,
  CfnRoute,
  HttpApi,
  HttpMethod,
  HttpRoute,
} from '@aws-cdk/aws-apigatewayv2';
import CognitoResources from './CognitoResources';
import { Code, Function, Runtime } from '@aws-cdk/aws-lambda';
import {
  Effect,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from '@aws-cdk/aws-iam';

export default class HttpApiResources {
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
    const api = new HttpApi(scope, 'HttpApi', {
      apiName: 'EmsHttpApi',
      createDefaultStage: false,
      corsPreflight: {
        allowOrigins: ['*'],
        allowHeaders: [
          'content-type',
          'x-amz-date',
          'authorization',
          'x-api-key',
          'x-amz-security-token',
          'x-amz-user-agent',
        ],
        allowMethods: [
          HttpMethod.GET,
          HttpMethod.DELETE,
          HttpMethod.HEAD,
          HttpMethod.OPTIONS,
          HttpMethod.POST,
          HttpMethod.PUT,
          HttpMethod.PATCH,
        ],
      },
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
    new CfnAuthorizer(scope, 'JwtAuthorizerFunction', {
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
    const authorizerFunc = new Function(scope, 'AdminJwtAuthorizerFunction', {
      runtime: Runtime.NODEJS_12_X,
      handler: 'index.handler',
      functionName: 'EmsAdminAuthorizer',
      code: Code.fromAsset('./lambdas/authorizers/adminAuthorizer'),
      environment: {
        USER_POOL_ID: cognitoResources.userPool.userPoolId,
        REGION: region,
      },
    });

    const adminAuthorizerRole = new Role(scope, 'AdminAuthorizerRole', {
      roleName: 'EmsAdminAuthorizerRole',
      assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
    });

    adminAuthorizerRole.addToPolicy(
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
      authorizerCredentialsArn: adminAuthorizerRole.roleArn,
      authorizerPayloadFormatVersion: '2.0',
      authorizerUri: `arn:aws:apigateway:${region}:lambda:path/2015-03-31/functions/${authorizerFunc.functionArn}/invocations`,
    });
  };

  public addJwtAuthorizerToRoutes(routes: HttpRoute[]) {
    routes.forEach((route: HttpRoute) => {
      const routeCfn = route.node.defaultChild as CfnRoute;
      routeCfn.authorizerId = this.jwtAuthorizer.ref;
      routeCfn.authorizationType = 'JWT';
    });
  }

  public addAdminJwtAuthorizerToRoutes(routes: HttpRoute[]) {
    routes.forEach((route: HttpRoute) => {
      const routeCfn = route.node.defaultChild as CfnRoute;
      routeCfn.authorizerId = this.adminJwtAuthorizer.ref;
      routeCfn.authorizationType = 'CUSTOM';
    });
  }
}
