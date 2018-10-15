'use strict';

require('./function_shield');
const lambda = require('./lambda');
const config = require('./config_service');

exports.handler = async (event) => {
  let resultToken = event.resultToken;
  let invokingEvent = JSON.parse(event.invokingEvent);
  let notificationCreationTime = invokingEvent.notificationCreationTime;

  let functionConfigurations = await lambda.listFunctions();

  let evaluations = [];

  await Promise.all(functionConfigurations.map(async (functionConfiguration) => {
    let complianceType = 'COMPLIANT';
    let annotation = 'OK';
    let triggers = await lambda.getTriggers(functionConfiguration.FunctionArn);

    if (triggers.length > 1) {
      annotation = 'The function can be triggered by: ' + triggers.join(', ');
      complianceType = 'NON_COMPLIANT';
    }

    evaluations.push({
      ComplianceResourceType: 'AWS::Lambda::Function',
      ComplianceResourceId: functionConfiguration.FunctionName,
      ComplianceType: complianceType,
      Annotation: annotation,
      OrderingTimestamp: notificationCreationTime
    });

  }));
  await config.putEvaluations(
    {
      Evaluations: evaluations,
      ResultToken: resultToken
    }
  );
};
