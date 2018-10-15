'use strict';

const AWS = require('aws-sdk');
require('./aws_sdk_hooks');
const cloudTrail = new AWS.CloudTrail({});

async function getLambdaCreationSources() {
  const lambdaCreationSources = {};
  const params = {
    LookupAttributes: [
      {
        AttributeKey: 'EventName',
        AttributeValue: 'CreateFunction20150331'
      },
    ]
  };
  do {
    const response = await cloudTrail.lookupEvents(params).promise();
    for (let event of response.Events) {
      let cloudTrailEvent = JSON.parse(event.CloudTrailEvent);
      if (cloudTrailEvent.responseElements) {
        lambdaCreationSources[cloudTrailEvent.responseElements.functionArn] = cloudTrailEvent.userIdentity.invokedBy;
      }
    }
    params.NextToken = response.NextToken;
  } while (params.NextToken);
  return lambdaCreationSources;
}

module.exports = {
  getLambdaCreationSources
};
