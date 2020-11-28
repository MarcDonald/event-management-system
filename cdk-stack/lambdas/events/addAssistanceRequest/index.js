const aws = require('aws-sdk');
const Dynamo = new aws.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: 'eu-west-1',
});
const uuid = require('uuid');

exports.handler = require('./handler')({
  Dynamo,
  generateUUID: uuid.v4,
  tableName: process.env.TABLE_NAME,
  getCurrentTime: () => Math.round(new Date().getTime() / 1000),
});
