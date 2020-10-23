import * as cdk from '@aws-cdk/core';
import { HttpMethod, LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2';
import { Code, Function, Runtime } from '@aws-cdk/aws-lambda';
import CognitoResources from '../CognitoResources';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import RestApiResources from '../RestApiResources';

export default class UserRestEndpoints {
  constructor(
    scope: cdk.Construct,
    cognitoResources: CognitoResources,
    restApiResources: RestApiResources
  ) {
    const addUserFunc = new Function(scope, 'addUserFunction', {
      runtime: Runtime.NODEJS_12_X,
      handler: 'index.handler',
      functionName: 'EmsAddUser',
      code: Code.fromAsset('./lambdas/addUser'),
      environment: {
        USER_POOL_ID: cognitoResources.userPool.userPoolId,
        API_CLIENT_ID: cognitoResources.apiUserPoolClient.userPoolClientId,
      },
    });

    const addUserPolicyStatement = new PolicyStatement();
    addUserPolicyStatement.addResources(cognitoResources.userPool.userPoolArn);
    addUserPolicyStatement.addActions(
      'cognito-idp:AdminCreateUser',
      'cognito-idp:AdminInitiateAuth',
      'cognito-idp:AdminRespondToAuthChallenge'
    );

    addUserFunc.addToRolePolicy(addUserPolicyStatement);

    const addUserHandler = new LambdaProxyIntegration({
      handler: addUserFunc,
    });

    restApiResources.api.addRoutes({
      path: '/users',
      methods: [HttpMethod.POST],
      integration: addUserHandler,
    });
  }
}
