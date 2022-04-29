import chai = require("chai");
const expect = chai.expect;

import * as path from "path";
import * as ttm from "azure-pipelines-task-lib/mock-test";

describe("Extract Jira keys", function () {
  it("should succeed with given values", function (done: Mocha.Done) {
    // given
    this.timeout(100000);

    const tp: string = path.join(__dirname, "setup.js");
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    // when
    tr.run();

    // then
    expect(tr.succeeded).to.equals(true, "should have succeeded");
    expect(tr.warningIssues.length).to.equals(0, "should have no warnings");
    expect(tr.errorIssues.length).to.equals(0, "should have no errors");
    console.log(tr.stdout);
    done();
  });
});
