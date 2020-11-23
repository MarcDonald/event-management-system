import * as cdk from '@aws-cdk/core';
import { HttpMethod, HttpRoute } from '@aws-cdk/aws-apigatewayv2';
import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import { Code, Function, Runtime } from '@aws-cdk/aws-lambda';
import CognitoResources from '../CognitoResources';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import HttpApiResources from '../HttpApiResources';

export default class UserHttpEndpoints {
  private lambdaRootDir = './lambdas/users/';

  constructor(
    scope: cdk.Construct,
    cognitoResources: CognitoResources,
    httpApiResources: HttpApiResources
  ) {
    const { userPoolId, userPoolArn } = cognitoResources.userPool;
    const { userPoolClientId } = cognitoResources.apiUserPoolClient;
    const { api } = httpApiResources;

    const addUserRoutes = api.addRoutes({
      path: '/users',
      methods: [HttpMethod.POST],
      integration: this.createAddUserHandler(
        scope,
        userPoolId,
        userPoolClientId,
        userPoolArn
      ),
    });

    const getAllUsersRoutes = api.addRoutes({
      path: '/users',
      methods: [HttpMethod.GET],
      integration: this.createGetAllUsersHandler(
        scope,
        userPoolId,
        userPoolArn
      ),
    });

    const deleteUserRoutes = api.addRoutes({
      path: '/users/{username}',
      methods: [HttpMethod.DELETE],
      integration: this.createDeleteUserHandler(scope, userPoolId, userPoolArn),
    });

    const updateUserRoutes = api.addRoutes({
      path: '/users/{username}',
      methods: [HttpMethod.PUT],
      integration: this.createUpdateUserHandler(scope, userPoolId, userPoolArn),
    });

    const getOneRoutes = api.addRoutes({
      path: '/users/{username}',
      methods: [HttpMethod.GET],
      integration: this.createGetUserHandler(scope, userPoolId, userPoolArn),
    });

    // Flattens all the individual arrays of routes into one single array
    const allAdminRoutes = Array<HttpRoute>().concat(
      ...[
        addUserRoutes,
        getAllUsersRoutes,
        deleteUserRoutes,
        updateUserRoutes,
        getOneRoutes,
      ]
    );
    httpApiResources.addAdminJwtAuthorizerToRoutes(allAdminRoutes);
  }

  private createAddUserHandler = (
    scope: cdk.Construct,
    userPoolId: string,
    clientId: string,
    userPoolArn: string
  ): LambdaProxyIntegration => {
    const addUserFunc = new Function(scope, 'AddUserFunction', {
      runtime: Runtime.NODEJS_12_X,
      handler: 'index.handler',
      functionName: 'EmsAddUser',
      code: Code.fromAsset(this.lambdaRootDir + 'addUser'),
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
    const getAllUsersFunc = new Function(scope, 'GetAllUsersFunction', {
      runtime: Runtime.NODEJS_12_X,
      handler: 'index.handler',
      functionName: 'EmsGetAllUsers',
      code: Code.fromAsset(this.lambdaRootDir + 'getAllUsers'),
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
    const deleteUserFunc = new Function(scope, 'DeleteUserFunction', {
      runtime: Runtime.NODEJS_12_X,
      handler: 'index.handler',
      functionName: 'EmsDeleteUser',
      code: Code.fromAsset(this.lambdaRootDir + 'deleteUser'),
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
    const updateUserFunc = new Function(scope, 'UpdateUserFunction', {
      runtime: Runtime.NODEJS_12_X,
      handler: 'index.handler',
      functionName: 'EmsUpdateUser',
      code: Code.fromAsset(this.lambdaRootDir + 'updateUser'),
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
    const getUserFunc = new Function(scope, 'GetUserFunction', {
      runtime: Runtime.NODEJS_12_X,
      handler: 'index.handler',
      functionName: 'EmsGetUser',
      code: Code.fromAsset(this.lambdaRootDir + 'getUser'),
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
