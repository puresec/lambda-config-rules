'use strict';

const AWS = require('aws-sdk');
require('./aws_sdk_hooks');
const config = new AWS.ConfigService({});

async function putEvaluations(params) {
  let result = await config.putEvaluations(params).promise();
  if ('FailedEvaluations' in result && result.FailedEvaluations.length > 0) {
    throw Error(JSON.stringify(result));
  }
}

module.exports = {
  putEvaluations
};
