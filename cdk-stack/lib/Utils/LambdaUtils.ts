import * as cdk from '@aws-cdk/core';
import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import { Code, Function, Runtime } from '@aws-cdk/aws-lambda';
import { PolicyStatement } from '@aws-cdk/aws-iam';

/**
 * Function to create a LambdaProxyIntegration with the base config required
 * @param scope
 * @param functionId
 * @param functionName
 * @param codeDir - Directory where Lambda code is stored
 * @param resources - AWS resource ARNs that should be allowed in the PolicyStatement
 * @param actions - Actions to be added to the PolicyStatement
 * @param environment - Environment variables to pass to the Lambda
 */
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
