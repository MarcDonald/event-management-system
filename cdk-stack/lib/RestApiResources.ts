import * as cdk from '@aws-cdk/core';
import { HttpApi } from '@aws-cdk/aws-apigatewayv2';

export default class RestApiResources {
  public readonly api: HttpApi;

  constructor(scope: cdk.Construct) {
    this.api = this.createApi(scope);
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
}
