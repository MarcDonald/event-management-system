#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { EmsStack } from '../lib/EmsStack';

const CdkApp = new cdk.App();
new EmsStack(CdkApp, 'EmsStack');
CdkApp.synth();
