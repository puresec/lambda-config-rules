'use strict';

const AWS = require('aws-sdk');

AWS.config.update({
  maxRetries: 100
});

const throttledError = AWS.Service.prototype.throttledError;
AWS.Service.prototype.throttledError = (error) => {
  if (error.code === 'TooManyRequestsException') {
    return true;
  }
  return throttledError(error);
};
