const aws = require('aws-sdk');

exports.handler = async (event) => {
  const jwt = event.identitySource;
  console.log(jwt);

  return {
    isAuthorized: true,
  };
};
