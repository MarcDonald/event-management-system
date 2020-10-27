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

    const deleteUserHandler = this.createDeleteUserHandler(
      scope,
      userPoolId,
      userPoolArn
    );

    const updateUserHandler = this.createUpdateUserHandler(
      scope,
      userPoolId,
      userPoolArn
    );

    const getUserHandler = this.createGetUserHandler(
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

    api.addRoutes({
      path: '/users/{username}',
      methods: [HttpMethod.DELETE],
      integration: deleteUserHandler,
    });

    api.addRoutes({
      path: '/users/{username}',
      methods: [HttpMethod.PUT],
      integration: updateUserHandler,
    });

    api.addRoutes({
      path: '/users/{username}',
      methods: [HttpMethod.GET],
      integration: getUserHandler,
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

  private createDeleteUserHandler = (
    scope: cdk.Construct,
    userPoolId: string,
    userPoolArn: string
  ): LambdaProxyIntegration => {
    const deleteUserFunc = new Function(scope, 'deleteUserFunction', {
      runtime: Runtime.NODEJS_12_X,
      handler: 'index.handler',
      functionName: 'EmsDeleteUser',
      code: Code.fromAsset('./lambdas/deleteUser'),
      environment: {
        USER_POOL_ID: userPoolId,
      },
    });

    const policyStatement = new PolicyStatement();
    policyStatement.addResources(userPoolArn);
    policyStatement.addActions('cognito-idp:AdminDeleteUser');

    deleteUserFunc.addToRolePolicy(policyStatement);

    return new LambdaProxyIntegration({
      handler: deleteUserFunc,
    });
  };

  private createUpdateUserHandler = (
    scope: cdk.Construct,
    userPoolId: string,
    userPoolArn: string
  ): LambdaProxyIntegration => {
    const updateUserFunc = new Function(scope, 'updateUserFunction', {
      runtime: Runtime.NODEJS_12_X,
      handler: 'index.handler',
      functionName: 'EmsUpdateUser',
      code: Code.fromAsset('./lambdas/updateUser'),
      environment: {
        USER_POOL_ID: userPoolId,
      },
    });

    const policyStatement = new PolicyStatement();
    policyStatement.addResources(userPoolArn);
    policyStatement.addActions(
      'cognito-idp:AdminUpdateUserAttributes',
      'cognito-idp:AdminSetUserPassword'
    );

    updateUserFunc.addToRolePolicy(policyStatement);

    return new LambdaProxyIntegration({
      handler: updateUserFunc,
    });
  };

  private createGetUserHandler = (
    scope: cdk.Construct,
    userPoolId: string,
    userPoolArn: string
  ): LambdaProxyIntegration => {
    const getUserFunc = new Function(scope, 'getUserFunction', {
      runtime: Runtime.NODEJS_12_X,
      handler: 'index.handler',
      functionName: 'EmsGetUser',
      code: Code.fromAsset('./lambdas/getUser'),
      environment: {
        USER_POOL_ID: userPoolId,
      },
    });

    const policyStatement = new PolicyStatement();
    policyStatement.addResources(userPoolArn);
    policyStatement.addActions('cognito-idp:AdminGetUser');

    getUserFunc.addToRolePolicy(policyStatement);

    return new LambdaProxyIntegration({
      handler: getUserFunc,
    });
  };
}
