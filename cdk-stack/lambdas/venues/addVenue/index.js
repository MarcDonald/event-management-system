const AWS = require('aws-sdk');
const Dynamo = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: 'eu-west-1',
});
const uuid = require('uuid');

exports.handler = require('./handler')({
  tableName: process.env.TABLE_NAME,
  Dynamo,
  generateUUID: uuid.v4,
});
