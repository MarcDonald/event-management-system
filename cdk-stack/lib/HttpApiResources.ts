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

/**
 * HttpApi and Authorizers
 */
export default class HttpApiResources {
  public readonly api: HttpApi;

  /**
   * Basic authorizer that only checks that a JWT is valid
   */
  public readonly jwtAuthorizer: CfnAuthorizer;

  /**
   * Authorizer that checks if the user is an Administrator
   */
  public readonly adminJwtAuthorizer: CfnAuthorizer;

  /**
   * Authorizer that checks if the user is a Control Room Operator or an Administrator
   */
  public readonly controlRoomAuthorizer: CfnAuthorizer;

  /**
   * Authorizer that checks if the user making the request is the same as the user from the username path parameter
   */
  public readonly sameUsernameAuthorizer: CfnAuthorizer;

  constructor(
    private scope: cdk.Construct,
    private cognitoResources: CognitoResources,
    private region: string
  ) {
    this.api = this.createApi();
    this.jwtAuthorizer = this.createJwtAuthorizer();
    this.adminJwtAuthorizer = this.createAdminJwtAuthorizer();
    this.controlRoomAuthorizer = this.createControlRoomAuthorizer();
    this.sameUsernameAuthorizer = this.createSameUsernameAuthorizer();
  }

  private createApi = (): HttpApi => {
    const api = new HttpApi(this.scope, 'HttpApi', {
      apiName: 'EmsHttpApi',
      createDefaultStage: false,
      // Default CORS settings
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

  private createJwtAuthorizer = (): CfnAuthorizer =>
    new CfnAuthorizer(this.scope, 'JwtAuthorizerFunction', {
      apiId: this.api.httpApiId,
      authorizerType: 'JWT',
      identitySource: ['$request.header.Authorization'],
      name: 'JwtAuthorizer',
      jwtConfiguration: {
        issuer: `https://cognito-idp.eu-west-1.amazonaws.com/${this.cognitoResources.userPool.userPoolId}`,
        audience: [
          this.cognitoResources.webDashboardUserPoolClient.userPoolClientId,
        ],
      },
    });

  private createAdminJwtAuthorizer = (): CfnAuthorizer => {
    const authorizerFunc = new Function(
      this.scope,
      'AdminJwtAuthorizerFunction',
      {
        runtime: Runtime.NODEJS_12_X,
        handler: 'index.handler',
        functionName: 'EmsAdminAuthorizer',
        code: Code.fromAsset('./lambdas/authorizers/adminAuthorizer'),
        environment: {
          USER_POOL_ID: this.cognitoResources.userPool.userPoolId,
          REGION: this.region,
        },
      }
    );

    const adminAuthorizerRole = new Role(this.scope, 'AdminAuthorizerRole', {
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

    return new CfnAuthorizer(this.scope, 'EmsAdminAuthorizer', {
      apiId: this.api.httpApiId,
      authorizerType: 'REQUEST',
      identitySource: ['$request.header.Authorization'],
      authorizerResultTtlInSeconds: 300,
      name: 'AdminAuthorizer',
      enableSimpleResponses: true,
      authorizerCredentialsArn: adminAuthorizerRole.roleArn,
      authorizerPayloadFormatVersion: '2.0',
      authorizerUri: `arn:aws:apigateway:${this.region}:lambda:path/2015-03-31/functions/${authorizerFunc.functionArn}/invocations`,
    });
  };

  private createControlRoomAuthorizer = (): CfnAuthorizer => {
    const authorizerFunc = new Function(
      this.scope,
      'ControlRoomAuthorizerFunction',
      {
        runtime: Runtime.NODEJS_12_X,
        handler: 'index.handler',
        functionName: 'EmsControlRoomAuthorizer',
        code: Code.fromAsset('./lambdas/authorizers/controlRoomAuthorizer'),
        environment: {
          USER_POOL_ID: this.cognitoResources.userPool.userPoolId,
          REGION: this.region,
        },
      }
    );

    const controlRoomAuthorizerRole = new Role(
      this.scope,
      'ControlRoomAuthorizerRole',
      {
        roleName: 'EmsControlRoomAuthorizerRole',
        assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
      }
    );

    controlRoomAuthorizerRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['lambda:InvokeFunction'],
        resources: [authorizerFunc.functionArn],
      })
    );

    return new CfnAuthorizer(this.scope, 'EmsControlRoomAuthorizer', {
      apiId: this.api.httpApiId,
      authorizerType: 'REQUEST',
      identitySource: ['$request.header.Authorization'],
      authorizerResultTtlInSeconds: 300,
      name: 'ControlRoomAuthorizer',
      enableSimpleResponses: true,
      authorizerCredentialsArn: controlRoomAuthorizerRole.roleArn,
      authorizerPayloadFormatVersion: '2.0',
      authorizerUri: `arn:aws:apigateway:${this.region}:lambda:path/2015-03-31/functions/${authorizerFunc.functionArn}/invocations`,
    });
  };

  private createSameUsernameAuthorizer = (): CfnAuthorizer => {
    const authorizerFunc = new Function(
      this.scope,
      'SameUsernameAuthorizerFunction',
      {
        runtime: Runtime.NODEJS_12_X,
        handler: 'index.handler',
        functionName: 'EmsSameUsernameAuthorizer',
        code: Code.fromAsset('./lambdas/authorizers/sameUsernameAuthorizer'),
        environment: {
          USER_POOL_ID: this.cognitoResources.userPool.userPoolId,
          REGION: this.region,
        },
      }
    );

    const sameUsernameRole = new Role(this.scope, 'SameUsernameRole', {
      roleName: 'EmsSameUsernameAuthorizerRole',
      assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
    });

    sameUsernameRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['lambda:InvokeFunction'],
        resources: [authorizerFunc.functionArn],
      })
    );

    return new CfnAuthorizer(this.scope, 'EmsSameUsernameAuthorizer', {
      apiId: this.api.httpApiId,
      authorizerType: 'REQUEST',
      identitySource: ['$request.header.Authorization'],
      authorizerResultTtlInSeconds: 0,
      name: 'SameUsernameAuthorizer',
      enableSimpleResponses: true,
      authorizerCredentialsArn: sameUsernameRole.roleArn,
      authorizerPayloadFormatVersion: '2.0',
      authorizerUri: `arn:aws:apigateway:${this.region}:lambda:path/2015-03-31/functions/${authorizerFunc.functionArn}/invocations`,
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

  public addControlRoomAuthorizerToRoutes(routes: HttpRoute[]) {
    routes.forEach((route: HttpRoute) => {
      const routeCfn = route.node.defaultChild as CfnRoute;
      routeCfn.authorizerId = this.controlRoomAuthorizer.ref;
      routeCfn.authorizationType = 'CUSTOM';
    });
  }

  public addSameUsernameAuthorizerToRoutes(routes: HttpRoute[]) {
    routes.forEach((route: HttpRoute) => {
      const routeCfn = route.node.defaultChild as CfnRoute;
      routeCfn.authorizerId = this.sameUsernameAuthorizer.ref;
      routeCfn.authorizationType = 'CUSTOM';
    });
  }
}
