import * as cdk from '@aws-cdk/core';
import {
  CfnRoute,
  HttpMethod,
  HttpRoute,
  LambdaProxyIntegration,
} from '@aws-cdk/aws-apigatewayv2';
import { Code, Function, Runtime } from '@aws-cdk/aws-lambda';
import CognitoResources from '../CognitoResources';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import HttpApiResources from '../HttpApiResources';

export default class UserHttpEndpoints {
  constructor(
    scope: cdk.Construct,
    private cognitoResources: CognitoResources,
    private httpApiResources: HttpApiResources
  ) {
    const { userPoolId, userPoolArn } = cognitoResources.userPool;
    const { userPoolClientId } = cognitoResources.apiUserPoolClient;
    const { api } = httpApiResources;

    const addUserHandler = this.createAddUserHandler(
      scope,
      userPoolId,
      userPoolClientId,
      userPoolArn
    );
    const addUserRoutes = api.addRoutes({
      path: '/users',
      methods: [HttpMethod.POST],
      integration: addUserHandler,
    });
    this.addAdminJwtAuthorizer(addUserRoutes);

    const getAllUsersHandler = this.createGetAllUsersHandler(
      scope,
      userPoolId,
      userPoolArn
    );
    const getAllUsersRoutes = api.addRoutes({
      path: '/users',
      methods: [HttpMethod.GET],
      integration: getAllUsersHandler,
    });
    this.addAdminJwtAuthorizer(getAllUsersRoutes);

    const deleteUserHandler = this.createDeleteUserHandler(
      scope,
      userPoolId,
      userPoolArn
    );
    const deleteUserRoutes = api.addRoutes({
      path: '/users/{username}',
      methods: [HttpMethod.DELETE],
      integration: deleteUserHandler,
    });
    this.addAdminJwtAuthorizer(deleteUserRoutes);

    const updateUserHandler = this.createUpdateUserHandler(
      scope,
      userPoolId,
      userPoolArn
    );
    const updateUserRoutes = api.addRoutes({
      path: '/users/{username}',
      methods: [HttpMethod.PUT],
      integration: updateUserHandler,
    });
    this.addAdminJwtAuthorizer(updateUserRoutes);

    const getUserHandler = this.createGetUserHandler(
      scope,
      userPoolId,
      userPoolArn
    );
    const getOneRoutes = api.addRoutes({
      path: '/users/{username}',
      methods: [HttpMethod.GET],
      integration: getUserHandler,
    });
    this.addAdminJwtAuthorizer(getOneRoutes);
  }

  private addJwtAuthorizer(routes: HttpRoute[]) {
    routes.forEach((route: HttpRoute) => {
      const routeCfn = route.node.defaultChild as CfnRoute;
      routeCfn.authorizerId = this.httpApiResources.jwtAuthorizer.ref;
      routeCfn.authorizationType = 'JWT';
    });
  }

  private addAdminJwtAuthorizer(routes: HttpRoute[]) {
    routes.forEach((route: HttpRoute) => {
      const routeCfn = route.node.defaultChild as CfnRoute;
      routeCfn.authorizerId = this.httpApiResources.adminJwtAuthorizer.ref;
      routeCfn.authorizationType = 'CUSTOM';
    });
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
    const getAllUsersFunc = new Function(scope, 'GetAllUsersFunction', {
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
    const deleteUserFunc = new Function(scope, 'DeleteUserFunction', {
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
    const updateUserFunc = new Function(scope, 'UpdateUserFunction', {
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
    const getUserFunc = new Function(scope, 'GetUserFunction', {
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
