'use strict';

const AWS = require('aws-sdk');
require('./aws_sdk_hooks');
const lambda = new AWS.Lambda({});

async function listFunctions() {
  let result = [];
  let params = {};
  do {
    const response = await lambda.listFunctions(params).promise();
    result.push(...response.Functions);
    params.Marker = response.NextMarker;
  } while (params.Marker);
  return result;
}

async function getPolicy(functionArn) {
  let result = {};
  const params = {
    FunctionName: functionArn
  };
  try {
    const response = await lambda.getPolicy(params).promise();
    result = JSON.parse(response.Policy);
  }
  catch (e) {
    if (e.code !== "ResourceNotFoundException") {
      throw e;
    }
  }
  return result;
}

async function getTriggers(functionArn) {
  let result = [];
  const resourcePolicy = await getPolicy(functionArn);
  if (resourcePolicy.Statement) {
    result = [...new Set(resourcePolicy.Statement.map(s => s.Principal.Service.split('.', 1)[0]))];
  }
  return result;
}

module.exports = {
  listFunctions,
  getTriggers
};
