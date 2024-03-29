import * as cdk from '@aws-cdk/core';
import { ConcreteDependable, Duration } from '@aws-cdk/core';
import WebsocketConnectionTable from './WebsocketConnectionTable';
import {
  CfnApi,
  CfnAuthorizer,
  CfnDeployment,
  CfnIntegration,
  CfnRoute,
  CfnRouteProps,
  CfnStage,
} from '@aws-cdk/aws-apigatewayv2';
import {
  Effect,
  ManagedPolicy,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from '@aws-cdk/aws-iam';
import { AssetCode, Code, Function, Runtime } from '@aws-cdk/aws-lambda';
import CognitoResources from '../CognitoResources';

interface WebsocketRoute {
  name: string;
  actions: string[];
  codePath: string;
}

/**
 * A WebSocket API with connect, disconnect routes and an authorizer
 */
export default class Websocket {
  public readonly api: CfnApi;

  constructor(
    private scope: cdk.Construct,
    private connectionTable: WebsocketConnectionTable,
    private id: string,
    private baseCodeRoute: string,
    private cognitoResources: CognitoResources,
    private region: string,
    additionalRoutes: WebsocketRoute[] = []
  ) {
    this.api = this.createWebsocketApi(additionalRoutes);
  }

  private createWebsocketApi(additionalRoutes: WebsocketRoute[]): CfnApi {
    const api = new CfnApi(this.scope, this.id, {
      name: `Ems${this.id}`,
      description: `EMS ${this.id} API`,
      protocolType: 'WEBSOCKET',
      routeSelectionExpression: '$request.body.action',
    });
    const deployment = new CfnDeployment(this.scope, `${this.id}Deployment`, {
      apiId: api.ref,
    });
    new CfnStage(this.scope, `${this.id}ProductionStage`, {
      apiId: api.ref,
      autoDeploy: true,
      deploymentId: deployment.ref,
      stageName: 'production',
    });

    const authorizer = this.createAuthorizer(api);

    this.addRoutes(api, deployment, authorizer, additionalRoutes);

    return api;
  }

  private addRoutes(
    api: CfnApi,
    deployment: CfnDeployment,
    authorizer: CfnAuthorizer,
    additionalRoutes: WebsocketRoute[]
  ) {
    const dependencies = new ConcreteDependable();
    dependencies.add(
      this.createRoute(
        api,
        {
          name: 'Connect',
          actions: ['dynamodb:PutItem'],
          codePath: 'onConnect',
        },
        authorizer
      )
    );
    dependencies.add(
      this.createRoute(api, {
        name: 'Disconnect',
        actions: ['dynamodb:DeleteItem'],
        codePath: 'onDisconnect',
      })
    );

    additionalRoutes.forEach((route) =>
      dependencies.add(this.createRoute(api, route))
    );

    deployment.node.addDependency(dependencies);
  }

  private createRoute(
    api: CfnApi,
    { name, actions, codePath }: WebsocketRoute,
    authorizer?: CfnAuthorizer
  ) {
    const lambdaRole = this.createLambdaRole(
      `${this.id}${name}LambdaRole`,
      new PolicyStatement({
        actions,
        resources: [this.connectionTable.table.tableArn],
      })
    );
    const func = this.createFunction(
      name,
      codePath,
      lambdaRole,
      this.connectionTable.table.tableName
    );
    const integrationRole = this.createIntegrationRole(
      [func.functionArn],
      `${this.id}${name}IntegrationRoles`
    );
    const integration = this.createIntegration(
      `Ems${this.id}${name}RouteIntegration`,
      func.functionArn,
      integrationRole.roleArn,
      api.ref
    );

    let routeKey;
    if (
      name.toLowerCase() === 'connect' ||
      name.toLowerCase() === 'disconnect'
    ) {
      routeKey = `$${name.toLowerCase()}`;
    } else {
      routeKey = name.toLowerCase();
    }

    let routeOptions: CfnRouteProps = {
      apiId: api.ref,
      routeKey,
      target: 'integrations/' + integration.ref,
    };

    if (authorizer) {
      routeOptions = {
        ...routeOptions,
        authorizationType: 'CUSTOM',
        authorizerId: authorizer.ref,
      };
    } else {
      routeOptions = {
        ...routeOptions,
        authorizationType: 'NONE',
      };
    }

    return new CfnRoute(this.scope, `Ems${this.id}${name}Route`, routeOptions);
  }

  private createLambdaRole(
    lambdaName: string,
    lambdaPolicy: PolicyStatement
  ): Role {
    const lambdaRole = new Role(this.scope, lambdaName, {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
    });
    lambdaRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName(
        'service-role/AWSLambdaBasicExecutionRole'
      )
    );
    lambdaRole.addToPolicy(lambdaPolicy);
    return lambdaRole;
  }

  private createFunction(
    name: string,
    codePath: string,
    role: Role,
    tableName: string
  ): Function {
    return new Function(this.scope, `${this.id}${name}`, {
      functionName: `Ems${this.id}${name}`,
      code: new AssetCode(`${this.baseCodeRoute}/${codePath}`),
      handler: 'index.handler',
      runtime: Runtime.NODEJS_12_X,
      timeout: Duration.seconds(300),
      memorySize: 256,
      role,
      environment: {
        CONNECTION_TABLE_NAME: tableName,
      },
    });
  }

  private createIntegrationRole(functionArns: string[], id: string): Role {
    const integrationPolicy = new PolicyStatement({
      effect: Effect.ALLOW,
      resources: functionArns,
      actions: ['lambda:InvokeFunction'],
    });

    const integrationRole = new Role(this.scope, `${id}-iam-role`, {
      assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
    });
    integrationRole.addToPolicy(integrationPolicy);

    return integrationRole;
  }

  private createIntegration(
    name: string,
    functionArn: string,
    integrationRoleArn: string,
    apiRef: string
  ): CfnIntegration {
    return new CfnIntegration(this.scope, name, {
      apiId: apiRef,
      integrationType: 'AWS_PROXY',
      integrationUri:
        'arn:aws:apigateway:eu-west-1:lambda:path/2015-03-31/functions/' +
        functionArn +
        '/invocations',
      credentialsArn: integrationRoleArn,
    });
  }

  private createAuthorizer(api: CfnApi): CfnAuthorizer {
    const authorizerFunc = new Function(
      this.scope,
      `${this.id}ConnectionAuthorizerFunction`,
      {
        runtime: Runtime.NODEJS_12_X,
        handler: 'index.handler',
        functionName: `Ems${this.id}ConnectionAuthorizer`,
        code: Code.fromAsset(`${this.baseCodeRoute}/connectionAuthorizer`),
        environment: {
          USER_POOL_ID: this.cognitoResources.userPool.userPoolId,
          REGION: this.region,
        },
      }
    );

    const authorizerRole = new Role(
      this.scope,
      `${this.id}ConnectionAuthorizerRole`,
      {
        roleName: `Ems${this.id}ConnectionAuthorizerRole`,
        assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
      }
    );

    authorizerRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['lambda:InvokeFunction'],
        resources: [authorizerFunc.functionArn],
      })
    );

    return new CfnAuthorizer(this.scope, `Ems${this.id}ConnectionAuthorizer`, {
      apiId: api.ref,
      authorizerType: 'REQUEST',
      identitySource: ['route.request.querystring.Authorization'],
      name: `${this.id}ConnectionAuthorizer`,
      authorizerCredentialsArn: authorizerRole.roleArn,
      authorizerUri: `arn:aws:apigateway:${this.region}:lambda:path/2015-03-31/functions/${authorizerFunc.functionArn}/invocations`,
    });
  }
}
