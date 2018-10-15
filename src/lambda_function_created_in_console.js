'use strict';

require('./function_shield');
const lambda = require('./lambda');
const config = require('./config_service');
const cloudTrail = require('./cloudtrail');

exports.handler = async (event) => {
  let resultToken = event.resultToken;
  let invokingEvent = JSON.parse(event.invokingEvent);
  let notificationCreationTime = invokingEvent.notificationCreationTime;

  let functionConfigurationsPromise = lambda.listFunctions();
  let lambdaCreationSourcesPromise = cloudTrail.getLambdaCreationSources();

  let functionConfigurations = await functionConfigurationsPromise;
  let lambdaCreationSources = await lambdaCreationSourcesPromise;

  let evaluations = [];

  for (let functionConfiguration of functionConfigurations) {
    let complianceType = 'COMPLIANT';
    if (lambdaCreationSources[functionConfiguration.FunctionArn] === 'signin.amazonaws.com') {
      complianceType = 'NON_COMPLIANT';
    }
    evaluations.push({
      ComplianceResourceType: 'AWS::Lambda::Function',
      ComplianceResourceId: functionConfiguration.FunctionName,
      ComplianceType: complianceType,
      OrderingTimestamp: notificationCreationTime
    });

  }
  await config.putEvaluations(
    {
      Evaluations: evaluations,
      ResultToken: resultToken
    }
  );
};
