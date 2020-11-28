import * as cdk from '@aws-cdk/core';
import { HttpMethod, HttpRoute } from '@aws-cdk/aws-apigatewayv2';
import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import CognitoResources from '../CognitoResources';
import HttpApiResources from '../HttpApiResources';
import { createBaseHandler } from '../Utils/LambdaUtils';

export default class StaffHttpEndpoints {
  constructor(
    private scope: cdk.Construct,
    private cognitoResources: CognitoResources,
    httpApiResources: HttpApiResources
  ) {
    const { api } = httpApiResources;

    const addStaffRoutes = api.addRoutes({
      path: '/staff',
      methods: [HttpMethod.POST],
      integration: this.createAddStaffHandler(),
    });

    const getAllStaffRoutes = api.addRoutes({
      path: '/staff',
      methods: [HttpMethod.GET],
      integration: this.createGetAllStaffHandler(),
    });

    const deleteStaffRoutes = api.addRoutes({
      path: '/staff/{username}',
      methods: [HttpMethod.DELETE],
      integration: this.createDeleteStaffHandler(),
    });

    const updateStaffRoutes = api.addRoutes({
      path: '/staff/{username}',
      methods: [HttpMethod.PUT],
      integration: this.createUpdateStaffHandler(),
    });

    const getOneRoutes = api.addRoutes({
      path: '/staff/{username}',
      methods: [HttpMethod.GET],
      integration: this.createGetStaffHandler(),
    });

    // Flattens all the individual arrays of routes into one single array
    const allAdminRoutes = Array<HttpRoute>().concat(
      ...[
        addStaffRoutes,
        getAllStaffRoutes,
        deleteStaffRoutes,
        updateStaffRoutes,
        getOneRoutes,
      ]
    );
    httpApiResources.addAdminJwtAuthorizerToRoutes(allAdminRoutes);
  }

  private createAddStaffHandler = (): LambdaProxyIntegration => {
    const { userPoolClientId } = this.cognitoResources.apiUserPoolClient;

    return this.createHandler(
      'AddStaffFunction',
      'EmsAddStaff',
      'addStaff',
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

  private createGetAllStaffHandler = (): LambdaProxyIntegration => {
    return this.createHandler(
      'GetAllStaffFunction',
      'EmsGetAllStaff',
      'getAllStaff',
      ['cognito-idp:ListUsers']
    );
  };

  private createDeleteStaffHandler = (): LambdaProxyIntegration => {
    return this.createHandler(
      'DeleteStaffFunction',
      'EmsDeleteStaff',
      'deleteStaff',
      ['cognito-idp:AdminDeleteUser']
    );
  };

  private createUpdateStaffHandler = (): LambdaProxyIntegration => {
    return this.createHandler(
      'UpdateStaffFunction',
      'EmsUpdateStaff',
      'updateStaff',
      [
        'cognito-idp:AdminUpdateUserAttributes',
        'cognito-idp:AdminSetUserPassword',
      ]
    );
  };

  private createGetStaffHandler = (): LambdaProxyIntegration => {
    return this.createHandler('GetStaffFunction', 'EmsGetStaff', 'getStaff', [
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
      `./lambdas/staff/${codeDir}`,
      [userPoolArn],
      actions,
      { ...additionalEnvironmentVariables, USER_POOL_ID: userPoolId }
    );
  }
}
