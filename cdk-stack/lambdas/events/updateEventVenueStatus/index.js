const aws = require('aws-sdk');
const Dynamo = new aws.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: 'eu-west-1',
});

exports.handler = require('./handler')({
  Dynamo,
  tableName: process.env.TABLE_NAME,
  getCurrentTime: () => Math.round(new Date().getTime() / 1000),
});
