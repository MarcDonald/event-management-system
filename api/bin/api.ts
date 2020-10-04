#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { EmsStack } from '../lib/ems-stack';

const app = new cdk.App();
new EmsStack(app, 'EmsStack');
app.synth();