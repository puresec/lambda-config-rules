'use strict';

const AWS = require('aws-sdk');
require('./aws_sdk_hooks');
const config = new AWS.ConfigService({});

function chunkArray(myArray, chunk_size) {
  let results = [];

  while (myArray.length) {
    results.push(myArray.splice(0, chunk_size));
  }

  return results;
}

async function putEvaluations(params) {
  let evaluationsChunks = chunkArray(params.Evaluations, 100);
  await Promise.all(evaluationsChunks.map(async (evaluationsChunk) => {
    let result = await config.putEvaluations({
      Evaluations: evaluationsChunk,
      ResultToken: params.ResultToken,
      TestMode: params.TestMode
    }).promise();
    if ('FailedEvaluations' in result && result.FailedEvaluations.length > 0) {
      throw Error(JSON.stringify(result));
    }

  }));
}

module.exports = {
  putEvaluations
};
