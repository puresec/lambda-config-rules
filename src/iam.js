'use strict';

const AWS = require('aws-sdk');
require('./aws_sdk_hooks');
const iam = new AWS.IAM({});

async function getAccountAuthorizationDetails() {
  const result = {
    RoleDetailList: [],
    Policies: []
  };
  await Promise.all([['Role'], ['LocalManagedPolicy'], ['AWSManagedPolicy']].map(async (filter) => {
    const params = {
      Filter: filter,
      MaxItems: 1000
    };
    do {
      const response = await iam.getAccountAuthorizationDetails(params).promise();
      result.RoleDetailList.push(...response.RoleDetailList);
      result.Policies.push(...response.Policies);
      params.Marker = response.Marker;
    } while (params.Marker);
  }));
  return result;
}

function listRoleStatements(iamDump, roleArn) {
  let result = [];
  for (const roleDetail of iamDump.RoleDetailList) {
    if (roleDetail.Arn === roleArn) {
      // handle inline policies
      for (const policyDetail of roleDetail.RolePolicyList) {
        const policyDocument = JSON.parse(decodeURIComponent(policyDetail.PolicyDocument));
        result = result.concat(policyDocument.Statement);
      }
      // handle attached policies
      for (const attachedPolicy of roleDetail.AttachedManagedPolicies) {
        for (const managedPolicyDetail of iamDump.Policies) {
          if (managedPolicyDetail.Arn === attachedPolicy.PolicyArn) {
            for (const policyVersion of managedPolicyDetail.PolicyVersionList) {
              if (policyVersion.IsDefaultVersion) {
                const policyDocument = JSON.parse(decodeURIComponent(policyVersion.Document));
                result = result.concat(policyDocument.Statement);
                break;
              }
            }
            break;
          }
        }
      }
      break;
    }
  }
  return result;
}

module.exports = {
  getAccountAuthorizationDetails,
  listRoleStatements
};
