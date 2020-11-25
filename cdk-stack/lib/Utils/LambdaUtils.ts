import * as cdk from '@aws-cdk/core';
import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import { Code, Function, Runtime } from '@aws-cdk/aws-lambda';
import { PolicyStatement } from '@aws-cdk/aws-iam';

export function createBaseHandler(
  scope: cdk.Construct,
  functionId: string,
  functionName: string,
  codeDir: string,
  resources: string[],
  actions: string[],
  environment?: {
    [key: string]: string;
  }
): LambdaProxyIntegration {
  const func = new Function(scope, functionId, {
    runtime: Runtime.NODEJS_12_X,
    handler: 'index.handler',
    functionName,
    code: Code.fromAsset(codeDir),
    environment,
  });

  const policyStatement = new PolicyStatement();
  resources.forEach((resource) => policyStatement.addResources(resource));
  actions.forEach((action) => policyStatement.addActions(action));
  func.addToRolePolicy(policyStatement);

  return new LambdaProxyIntegration({
    handler: func,
  });
}
