import * as cdk from '@aws-cdk/core';
import { ConcreteDependable, Duration, RemovalPolicy } from '@aws-cdk/core';
import {
  CfnApi,
  CfnDeployment,
  CfnIntegration,
  CfnRoute,
  CfnStage,
} from '@aws-cdk/aws-apigatewayv2';
import { AttributeType, BillingMode, Table } from '@aws-cdk/aws-dynamodb';
import {
  Effect,
  ManagedPolicy,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from '@aws-cdk/aws-iam';
import { AssetCode, Function, Runtime } from '@aws-cdk/aws-lambda';

export default class WebsocketResources {
  readonly connectionTable: Table;
  readonly api: CfnApi;

  constructor(private scope: cdk.Construct) {
    this.connectionTable = this.createConnectionTable();
    this.api = this.createApi();

    const deployment = new CfnDeployment(this.scope, 'WebsocketApiDeployment', {
      apiId: this.api.ref,
    });

    new CfnStage(this.scope, 'WebsocketApiProductionStage', {
      apiId: this.api.ref,
      autoDeploy: true,
      deploymentId: deployment.ref,
      stageName: 'production',
    });

    const dependencies = new ConcreteDependable();
    dependencies.add(
      this.createRoute('Connect', ['dynamodb:PutItem'], 'onConnect')
    );
    dependencies.add(
      this.createRoute('Disconnect', ['dynamodb:DeleteItem'], 'onDisconnect')
    );
    deployment.node.addDependency(dependencies);
  }

  private createConnectionTable(): Table {
    return new Table(this.scope, 'WebsocketConnections', {
      tableName: 'EmsWebsocketConnections',
      partitionKey: {
        name: 'connectionId',
        type: AttributeType.STRING,
      },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });
  }

  private createApi(): CfnApi {
    return new CfnApi(this.scope, 'WebsocketApi', {
      name: 'EmsWebsocketApi',
      description: 'EMS Websocket Api',
      protocolType: 'WEBSOCKET',
      routeSelectionExpression: '$request.body.action',
    });
  }

  private createLambdaPolicy = (tableArn: string): PolicyStatement =>
    new PolicyStatement({
      actions: [
        'dynamodb:GetItem',
        'dynamodb:DeleteItem',
        'dynamodb:PutItem',
        'dynamodb:Scan',
        'dynamodb:Query',
        'dynamodb:UpdateItem',
        'dynamodb:BatchWriteItem',
        'dynamodb:BatchGetItem',
        'dynamodb:DescribeTable',
        'dynamodb:ConditionCheckItem',
      ],
      resources: [tableArn],
    });

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

  createIntegrationRole(functionArns: string[], id: string): Role {
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

  private createRoute(name: string, actions: string[], codePath: string) {
    const lambdaRole = this.createLambdaRole(
      `${name}LambdaRole`,
      new PolicyStatement({
        actions,
        resources: [this.connectionTable.tableArn],
      })
    );
    const func = this.createFunction(
      name,
      codePath,
      lambdaRole,
      this.connectionTable.tableName
    );
    const integrationRole = this.createIntegrationRole(
      [func.functionArn],
      `Websocket${name}IntegrationRoles`
    );
    const integration = this.createIntegration(
      `Ems${name}RouteIntegration`,
      func.functionArn,
      integrationRole.roleArn,
      this.api.ref
    );
    return new CfnRoute(this.scope, `EmsWebsocket${name}Route`, {
      apiId: this.api.ref,
      routeKey: `$${name.toLowerCase()}`,
      authorizationType: 'NONE',
      target: 'integrations/' + integration.ref,
    });
  }

  private createFunction(
    name: string,
    codePath: string,
    role: Role,
    tableName: string
  ): Function {
    return new Function(this.scope, `Websocket${name}`, {
      functionName: `EmsWebsocket${name}`,
      code: new AssetCode(`./lambdas/websocket/${codePath}`),
      handler: 'index.handler',
      runtime: Runtime.NODEJS_12_X,
      timeout: Duration.seconds(300),
      memorySize: 256,
      role,
      environment: {
        TABLE_NAME: tableName,
      },
    });
  }
}
