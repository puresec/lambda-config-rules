'use strict';

const FunctionShield = require('@puresec/function-shield');
FunctionShield.configure(
  {
    policy: {
      read_write_tmp: "block",
      create_child_process: "block",
      outbound_connectivity: "block"
    },
    token: process.env.FUNCTION_SHIELD_TOKEN
  });
