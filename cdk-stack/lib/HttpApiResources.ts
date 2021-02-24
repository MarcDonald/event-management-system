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
import DynamoDbResources from './DynamoDbResources';

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

  /**
   * Authorizer that checks if the user making the request is assigned to the position in the positionId path parameter
   */
  public readonly samePositionAuthorizer: CfnAuthorizer;

  constructor(
    private scope: cdk.Construct,
    private cognitoResources: CognitoResources,
    private dynamoResources: DynamoDbResources,
    private region: string
  ) {
    this.api = this.createApi();
    this.jwtAuthorizer = this.createJwtAuthorizer();
    this.adminJwtAuthorizer = this.createAuthorizer(
      'UserIsAdmin',
      'adminAuthorizer'
    );
    this.controlRoomAuthorizer = this.createAuthorizer(
      'UserIsControlRoom',
      'controlRoomAuthorizer'
    );
    this.sameUsernameAuthorizer = this.createAuthorizer(
      'SameUsernameAsPath',
      'sameUsernameAuthorizer',
      0
    );
    this.samePositionAuthorizer = this.createAuthorizer(
      'SamePositionAsPath',
      'samePositionAuthorizer',
      0,
      {
        TABLE_NAME: this.dynamoResources.table.tableName,
      },
      [this.dynamoResources.table.tableArn],
      ['dynamodb:Query']
    );
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
          this.cognitoResources.androidUserPoolClient.userPoolClientId,
        ],
      },
    });

  private createAuthorizer(
    name: string,
    codeDir: string,
    ttl?: number,
    additionalEnvironment?: { [key: string]: string },
    functionResources?: string[],
    functionActions?: string[]
  ) {
    let environment = {
      USER_POOL_ID: this.cognitoResources.userPool.userPoolId,
      REGION: this.region,
    };
    if (additionalEnvironment) {
      environment = { ...environment, ...additionalEnvironment };
    }

    const authorizerFunc = new Function(
      this.scope,
      `${name}AuthorizerFunction`,
      {
        runtime: Runtime.NODEJS_12_X,
        handler: 'index.handler',
        functionName: `Ems${name}Authorizer`,
        code: Code.fromAsset(`./lambdas/restAuthorizers/${codeDir}`),
        environment,
      }
    );

    if (functionResources || functionActions) {
      const policyStatement = new PolicyStatement();
      functionResources?.forEach((resource) =>
        policyStatement.addResources(resource)
      );
      functionActions?.forEach((action) => policyStatement.addActions(action));
      authorizerFunc.addToRolePolicy(policyStatement);
    }

    const authorizerRole = new Role(this.scope, `${name}AuthorizerRole`, {
      roleName: `Ems${name}AuthorizerRole`,
      assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
    });

    authorizerRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['lambda:InvokeFunction'],
        resources: [authorizerFunc.functionArn],
      })
    );

    return new CfnAuthorizer(this.scope, `Ems${name}Authorizer`, {
      apiId: this.api.httpApiId,
      authorizerType: 'REQUEST',
      identitySource: ['$request.header.Authorization'],
      authorizerResultTtlInSeconds:
        ttl !== null && ttl !== undefined ? ttl : 300,
      name: `${name}Authorizer`,
      enableSimpleResponses: true,
      authorizerCredentialsArn: authorizerRole.roleArn,
      authorizerPayloadFormatVersion: '2.0',
      authorizerUri: `arn:aws:apigateway:${this.region}:lambda:path/2015-03-31/functions/${authorizerFunc.functionArn}/invocations`,
    });
  }

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

  public addSamePositionAuthorizerToRoutes(routes: HttpRoute[]) {
    routes.forEach((route: HttpRoute) => {
      const routeCfn = route.node.defaultChild as CfnRoute;
      routeCfn.authorizerId = this.samePositionAuthorizer.ref;
      routeCfn.authorizationType = 'CUSTOM';
    });
  }
}
