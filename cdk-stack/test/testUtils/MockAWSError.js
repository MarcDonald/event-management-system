module.exports = class MockAWSError extends Error {
  code;

  constructor(message, code) {
    super(message);
    this.code = code;
  }
};
