'use strict';

require('./function_shield');
const lambda = require('./lambda');
const config = require('./config_service');
const iam = require('./iam');

exports.handler = async (event) => {
  let resultToken = event.resultToken;
  let invokingEvent = JSON.parse(event.invokingEvent);
  let notificationCreationTime = invokingEvent.notificationCreationTime;

  let functionConfigurationsPromise = lambda.listFunctions();
  let iamDumpPromise = iam.getAccountAuthorizationDetails();

  let functionConfigurations = await functionConfigurationsPromise;
  let iamDump = await iamDumpPromise;


  let evaluations = [];

  for (let functionConfiguration of functionConfigurations) {
    let complianceType = 'COMPLIANT';
    let annotation = 'OK';
    let roleStatements = iam.listRoleStatements(iamDump, functionConfiguration.Role);
    let wildcardActions = [];
    for(let roleStatement of roleStatements){
      if(Array.isArray(roleStatement.Action)){
        for(let action of roleStatement.Action){
          if(action.includes('*')){
            wildcardActions.push(action);
          }
        }
      }
      else {
        if(roleStatement.Action.includes('*')){
          wildcardActions.push(roleStatement.Action);
        }
      }
    }
    if (wildcardActions.length > 0) {
      complianceType = 'NON_COMPLIANT';
      annotation = 'Wildcard actions: ' + wildcardActions.join(', ');
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
