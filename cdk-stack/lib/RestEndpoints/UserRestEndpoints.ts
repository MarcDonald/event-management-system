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
    const { userPoolId, userPoolArn } = cognitoResources.userPool;
    const { userPoolClientId } = cognitoResources.apiUserPoolClient;
    const { api } = restApiResources;

    const addUserHandler = this.createAddUserHandler(
      scope,
      userPoolId,
      userPoolClientId,
      userPoolArn
    );

    const getAllUsersHandler = this.createGetAllUsersHandler(
      scope,
      userPoolId,
      userPoolArn
    );

    api.addRoutes({
      path: '/users',
      methods: [HttpMethod.POST],
      integration: addUserHandler,
    });

    api.addRoutes({
      path: '/users',
      methods: [HttpMethod.GET],
      integration: getAllUsersHandler,
    });
  }

  private createAddUserHandler = (
    scope: cdk.Construct,
    userPoolId: string,
    clientId: string,
    userPoolArn: string
  ): LambdaProxyIntegration => {
    const addUserFunc = new Function(scope, 'addUserFunction', {
      runtime: Runtime.NODEJS_12_X,
      handler: 'index.handler',
      functionName: 'EmsAddUser',
      code: Code.fromAsset('./lambdas/addUser'),
      environment: {
        USER_POOL_ID: userPoolId,
        API_CLIENT_ID: clientId,
      },
    });

    const policyStatement = new PolicyStatement();
    policyStatement.addResources(userPoolArn);
    policyStatement.addActions(
      'cognito-idp:AdminCreateUser',
      'cognito-idp:AdminInitiateAuth',
      'cognito-idp:AdminRespondToAuthChallenge'
    );

    addUserFunc.addToRolePolicy(policyStatement);

    return new LambdaProxyIntegration({
      handler: addUserFunc,
    });
  };

  private createGetAllUsersHandler = (
    scope: cdk.Construct,
    userPoolId: string,
    userPoolArn: string
  ): LambdaProxyIntegration => {
    const getAllUsersFunc = new Function(scope, 'getAllUsersFunction', {
      runtime: Runtime.NODEJS_12_X,
      handler: 'index.handler',
      functionName: 'EmsGetAllUsers',
      code: Code.fromAsset('./lambdas/getAllUsers'),
      environment: {
        USER_POOL_ID: userPoolId,
      },
    });

    const policyStatement = new PolicyStatement();
    policyStatement.addResources(userPoolArn);
    policyStatement.addActions('cognito-idp:ListUsers');

    getAllUsersFunc.addToRolePolicy(policyStatement);

    return new LambdaProxyIntegration({
      handler: getAllUsersFunc,
    });
  };
}
