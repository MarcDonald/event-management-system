import * as cdk from '@aws-cdk/core';
import { Bucket } from '@aws-cdk/aws-s3';
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment';
import {
  CloudFrontWebDistribution,
  CloudFrontWebDistributionProps,
  OriginAccessIdentity,
  ViewerProtocolPolicy,
} from '@aws-cdk/aws-cloudfront';
import { PolicyStatement } from '@aws-cdk/aws-iam';

export default class WebAppResources {
  constructor(private scope: cdk.Construct) {
    this.createWebsiteDeployment();
  }

  private createWebsiteDeployment() {
    const websiteBucket = new Bucket(this.scope, 'WebAppBucket', {
      // Buckets names must follow this convention instead of the normal one I've used elsewhere
      bucketName: 'ems-web-app-bucket',
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    new BucketDeployment(this.scope, 'WebAppBucketDeployment', {
      sources: [Source.asset('../web-app/build')],
      destinationBucket: websiteBucket,
    });

    const originAccessIdentity = new OriginAccessIdentity(
      this.scope,
      'OriginAccessIdentity'
    );

    const distributionProperties: CloudFrontWebDistributionProps = {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: websiteBucket,
            originAccessIdentity: originAccessIdentity,
          },
          behaviors: [{ isDefaultBehavior: true }],
        },
      ],
      // Redirect unknown routes to index for React to handle routing
      errorConfigurations: [
        {
          errorCode: 403,
          responsePagePath: '/index.html',
          responseCode: 200,
        },
        {
          errorCode: 404,
          responsePagePath: '/index.html',
          responseCode: 200,
        },
      ],
      viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    };

    new CloudFrontWebDistribution(
      this.scope,
      'WebAppCloudfrontDistribution',
      distributionProperties
    );

    const cloudfrontS3Access = new PolicyStatement({
      actions: ['s3:GetBucket*', 's3:GetObject*', 's3:List*'],
      resources: [websiteBucket.bucketArn, `${websiteBucket.bucketArn}/*`],
    });

    cloudfrontS3Access.addCanonicalUserPrincipal(
      originAccessIdentity.cloudFrontOriginAccessIdentityS3CanonicalUserId
    );

    websiteBucket.addToResourcePolicy(cloudfrontS3Access);
  }
}
