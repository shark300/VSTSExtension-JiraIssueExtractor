// Initialize ESM-only Chai and chai-as-promised before ts-mocha loads CommonJS tests.
import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);
