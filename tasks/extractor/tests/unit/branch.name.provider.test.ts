import chai = require("chai");
const expect = chai.expect;

import { stubConstructor } from "ts-sinon";

import { GitPullRequest } from "azure-devops-node-api/interfaces/GitInterfaces";

import { BranchNameProvider } from "@/branch.name.provider";
import { PullRequestProvider } from "@/pullrequest.provider";
import { Logger } from "../../src/logger";

describe("Branch name provider", function () {
  const dummyProject = "dummyProject";
  const dummyBuildId = 1;
  const dummyBranchName = "dummyBranchName";

  let branchNameProvider: BranchNameProvider;

  const pullRequestProviderMock = stubConstructor(PullRequestProvider);
  const loggerMock = stubConstructor(Logger);

  let gitPullRequest: GitPullRequest = {};

  beforeEach(() => {
    branchNameProvider = new BranchNameProvider(
      pullRequestProviderMock,
      loggerMock
    );

    gitPullRequest = {
      sourceRefName: dummyBranchName,
    };
  });

  describe("getBranchName", function () {
    it("should return branch name from pull request", async function () {
      // given

      pullRequestProviderMock.getPullRequest
        .withArgs(dummyProject, dummyBuildId)
        .resolves(gitPullRequest);

      // when
      const actual = await branchNameProvider.getBranchName(
        dummyProject,
        dummyBuildId
      );

      // then
      expect(actual).to.equals(dummyBranchName);
    });
  });
});
