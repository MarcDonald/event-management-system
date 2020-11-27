const aws = require('aws-sdk');
const Dynamo = new aws.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: 'eu-west-1',
});

exports.handler = require('./handler')({
  Dynamo,
  tableName: process.env.TABLE_NAME,
  eventMetadataIndexName: process.env.EVENT_METADATA_INDEX_NAME,
});
