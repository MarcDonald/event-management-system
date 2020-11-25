import * as cdk from '@aws-cdk/core';
import { HttpMethod, HttpRoute } from '@aws-cdk/aws-apigatewayv2';
import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import CognitoResources from '../CognitoResources';
import HttpApiResources from '../HttpApiResources';
import { createBaseHandler } from '../Utils/LambdaUtils';

export default class UserHttpEndpoints {
  constructor(
    private scope: cdk.Construct,
    private cognitoResources: CognitoResources,
    httpApiResources: HttpApiResources
  ) {
    const { api } = httpApiResources;

    const addUserRoutes = api.addRoutes({
      path: '/users',
      methods: [HttpMethod.POST],
      integration: this.createAddUserHandler(),
    });

    const getAllUsersRoutes = api.addRoutes({
      path: '/users',
      methods: [HttpMethod.GET],
      integration: this.createGetAllUsersHandler(),
    });

    const deleteUserRoutes = api.addRoutes({
      path: '/users/{username}',
      methods: [HttpMethod.DELETE],
      integration: this.createDeleteUserHandler(),
    });

    const updateUserRoutes = api.addRoutes({
      path: '/users/{username}',
      methods: [HttpMethod.PUT],
      integration: this.createUpdateUserHandler(),
    });

    const getOneRoutes = api.addRoutes({
      path: '/users/{username}',
      methods: [HttpMethod.GET],
      integration: this.createGetUserHandler(),
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

  private createAddUserHandler = (): LambdaProxyIntegration => {
    const { userPoolClientId } = this.cognitoResources.apiUserPoolClient;

    return this.createHandler(
      'AddUserFunction',
      'EmsAddUser',
      'addUser',
      [
        'cognito-idp:AdminCreateUser',
        'cognito-idp:AdminInitiateAuth',
        'cognito-idp:AdminRespondToAuthChallenge',
      ],
      {
        API_CLIENT_ID: userPoolClientId,
      }
    );
  };

  private createGetAllUsersHandler = (): LambdaProxyIntegration => {
    return this.createHandler(
      'GetAllUsersFunction',
      'EmsGetAllUsers',
      'getAllUsers',
      ['cognito-idp:ListUsers']
    );
  };

  private createDeleteUserHandler = (): LambdaProxyIntegration => {
    return this.createHandler(
      'DeleteUserFunction',
      'EmsDeleteUser',
      'deleteUser',
      ['cognito-idp:AdminDeleteUser']
    );
  };

  private createUpdateUserHandler = (): LambdaProxyIntegration => {
    return this.createHandler(
      'UpdateUserFunction',
      'EmsUpdateUser',
      'updateUser',
      [
        'cognito-idp:AdminUpdateUserAttributes',
        'cognito-idp:AdminSetUserPassword',
      ]
    );
  };

  private createGetUserHandler = (): LambdaProxyIntegration => {
    return this.createHandler('GetUserFunction', 'EmsGetUser', 'getUser', [
      'cognito-idp:AdminGetUser',
    ]);
  };

  private createHandler(
    functionId: string,
    functionName: string,
    codeDir: string,
    actions: string[],
    additionalEnvironmentVariables?: object
  ): LambdaProxyIntegration {
    const { userPoolId, userPoolArn } = this.cognitoResources.userPool;
    return createBaseHandler(
      this.scope,
      functionId,
      functionName,
      `./lambdas/users/${codeDir}`,
      [userPoolArn],
      actions,
      { ...additionalEnvironmentVariables, USER_POOL_ID: userPoolId }
    );
  }
}
