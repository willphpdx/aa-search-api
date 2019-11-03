'use strict';

const AWS = require('aws-sdk')

var dynamo = new AWS.DynamoDB.DocumentClient()

const getDynamoQueryParams = function( event ) {
  if( !event.queryStringParameters ) {
    return undefined
  }

  if( event.queryStringParameters.author ) {
    return {
      TableName : 'audaud-articles',
      IndexName : 'author-postedDate-index',
      KeyConditionExpression : 'author = :name',
      ExpressionAttributeValues: {
        ':name' : event.queryStringParameters.author
      }
    }
  }
  if( event.queryStringParameters.slug ) {
    return {
      TableName : 'audaud-articles',
      IndexName : 'slug-postedDate-index',
      KeyConditionExpression : 'slug = :slug',
      ExpressionAttributeValues: {
        ':slug' : event.queryStringParameters.slug
      }
    }
  }
  return undefined
}

exports.handler = async function(event) {

  const params = getDynamoQueryParams( event )

  const promise = new Promise(function(resolve, reject) {
    if(!params) {
      dynamo.scan({TableName: 'audaud-articles'}, function(err, data) {
        if (err) {
          resolve({ body: "Unable to scan. Error:" + JSON.stringify(err, null, 2) });
        } else {
          resolve({
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET, OPTIONS"
            },
            body: `{"Items": ${JSON.stringify(data.Items, null, 3)}}`
          })
        }
      })
    } else {
      dynamo.query(params, function(err, data) {
        if (err) {
          resolve({ body: "Unable to query. Error:" + JSON.stringify(err, null, 2) });
        } else {
          resolve({
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET, OPTIONS"
            },
            body: `{"Items": ${JSON.stringify(data.Items, null, 3)}}`
          })
        }
      })
    }
  })
  return promise
}
