import * as cdk from '@aws-cdk/core';
import { CfnAuthorizer, HttpApi } from '@aws-cdk/aws-apigatewayv2';
import CognitoResources from './CognitoResources';

export default class RestApiResources {
  public readonly api: HttpApi;
  public readonly basicUserJwtAuthorizer: CfnAuthorizer;

  constructor(scope: cdk.Construct, cognitoResources: CognitoResources) {
    this.api = this.createApi(scope);
    this.basicUserJwtAuthorizer = this.createBasicUserJwtAuthorizer(
      scope,
      this.api,
      cognitoResources
    );
  }

  private createApi = (scope: cdk.Construct): HttpApi => {
    const api = new HttpApi(scope, 'RestAPI', {
      apiName: 'EmsRestApi',
      createDefaultStage: false,
    });

    api.addStage('production', {
      stageName: 'production',
      autoDeploy: true,
    });

    return api;
  };

  private createBasicUserJwtAuthorizer = (
    scope: cdk.Construct,
    api: HttpApi,
    cognitoResources: CognitoResources
  ) =>
    new CfnAuthorizer(scope, 'EmsAuthorizer', {
      apiId: api.httpApiId,
      authorizerType: 'JWT',
      identitySource: ['$request.header.Authorization'],
      name: 'ems-authorizer',
      jwtConfiguration: {
        issuer: `https://cognito-idp.eu-west-1.amazonaws.com/${cognitoResources.userPool.userPoolId}`,
        audience: [
          cognitoResources.webDashboardUserPoolClient.userPoolClientId,
        ],
      },
    });
}
