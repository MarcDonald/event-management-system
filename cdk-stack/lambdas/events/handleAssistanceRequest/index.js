const aws = require('aws-sdk');
const Dynamo = new aws.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: 'eu-west-1',
});
const ApiGatewayManagementApi = new aws.ApiGatewayManagementApi({
  apiVersion: '2018-11-29',
  endpoint: `${process.env.ASSISTANCE_REQUEST_WEBSOCKET_API_ID}.execute-api.eu-west-1.amazonaws.com/production`,
});

exports.handler = require('./handler')({
  Dynamo,
  ApiGatewayManagementApi,
  tableName: process.env.TABLE_NAME,
  connectionTableName: process.env.WEBSOCKET_CONNECTION_TABLE_NAME,
});
