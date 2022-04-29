import chai = require("chai");
const expect = chai.expect;

import * as path from "path";
import * as ttm from "azure-pipelines-task-lib/mock-test";

describe("Extract Jira keys", function () {
  function getVariable(
    testRunner: ttm.MockTestRunner,
    variableName: string
  ): string | undefined {
    const parseVariableValue = new RegExp(
      `##vso\\[task\\.setvariable variable=${variableName};isOutput=false;issecret=false;\\](.*)$`,
      "m"
    );
    const match = testRunner.stdout.match(parseVariableValue);
    if (match) {
      return match.pop();
    }
  }

  it("should succeed and publish environment variable with collected jira keys", function (done: Mocha.Done) {
    // given
    this.timeout(5000);

    const tp: string = path.join(__dirname, "setup.js");
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    // when
    tr.run();

    // then
    expect(tr.succeeded).to.equals(true, "should have succeeded");
    expect(tr.warningIssues.length).to.equals(0, "should have no warnings");
    expect(tr.errorIssues.length).to.equals(0, "should have no errors");
    expect(getVariable(tr, "JIRA_KEYS")).to.equal("JIE-541, JIE-1257");
    console.log(tr.stdout);
    done();
  });
});
