import * as cdk from '@aws-cdk/core';
import { ConcreteDependable, Duration } from '@aws-cdk/core';
import WebsocketConnectionTable from './WebsocketConnectionTable';
import {
  CfnApi,
  CfnDeployment,
  CfnIntegration,
  CfnRoute,
  CfnStage,
} from '@aws-cdk/aws-apigatewayv2';
import {
  Effect,
  ManagedPolicy,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from '@aws-cdk/aws-iam';
import { AssetCode, Function, Runtime } from '@aws-cdk/aws-lambda';

interface WebsocketRoute {
  name: string;
  actions: string[];
  codePath: string;
}

export default class Websocket {
  public readonly api: CfnApi;

  constructor(
    private scope: cdk.Construct,
    private connectionTable: WebsocketConnectionTable,
    private id: string,
    private baseCodeRoute: string,
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

    this.addRoutes(api, deployment, additionalRoutes);

    return api;
  }

  private addRoutes(
    api: CfnApi,
    deployment: CfnDeployment,
    additionalRoutes: WebsocketRoute[]
  ) {
    const dependencies = new ConcreteDependable();
    dependencies.add(
      this.createRoute(api, {
        name: 'Connect',
        actions: ['dynamodb:PutItem'],
        codePath: 'onConnect',
      })
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
    { name, actions, codePath }: WebsocketRoute
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
    return new CfnRoute(this.scope, `Ems${this.id}Websocket${name}Route`, {
      apiId: api.ref,
      routeKey: `$${name.toLowerCase()}`,
      authorizationType: 'NONE',
      target: 'integrations/' + integration.ref,
    });
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
}
