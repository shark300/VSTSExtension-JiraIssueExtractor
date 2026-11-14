// Load the ESM-only plugin asynchronously without converting the CommonJS task build.
exports.mochaHooks = {
  async beforeAll() {
    const chai = require("chai");
    const { default: chaiAsPromised } = await import("chai-as-promised");
    chai.use(chaiAsPromised);
  },
};
