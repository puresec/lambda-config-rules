'use strict';

require('./function_shield');
const lambda = require('./lambda');
const config = require('./config_service');

exports.handler = async (event) => {
  let resultToken = event.resultToken;
  let invokingEvent = JSON.parse(event.invokingEvent);
  let notificationCreationTime = invokingEvent.notificationCreationTime;

  let functionConfigurations = await lambda.listFunctions();
  let rolesToFunctionsMap = {};

  for (let functionConfiguration of functionConfigurations) {
    if (!(functionConfiguration.Role in rolesToFunctionsMap)) {
      rolesToFunctionsMap[functionConfiguration.Role] = [];
    }
    rolesToFunctionsMap[functionConfiguration.Role].push(functionConfiguration.FunctionName);
  }

  let evaluations = [];

  for (let functionConfiguration of functionConfigurations) {
    let complianceType = 'COMPLIANT';
    let annotation = 'OK';
    if (rolesToFunctionsMap[functionConfiguration.Role].length > 1) {
      complianceType = 'NON_COMPLIANT';
      let sharesRoleWith = rolesToFunctionsMap[functionConfiguration.Role].filter(FunctionName => FunctionName !== functionConfiguration.FunctionName);
      annotation = 'The function shares IAM role with: ' + sharesRoleWith.join(', ');
    }
    evaluations.push({
      ComplianceResourceType: 'AWS::Lambda::Function',
      ComplianceResourceId: functionConfiguration.FunctionName,
      ComplianceType: complianceType,
      Annotation: annotation,
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
