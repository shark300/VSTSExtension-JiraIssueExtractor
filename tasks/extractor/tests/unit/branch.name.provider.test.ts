import chai = require("chai");
const expect = chai.expect;

import { stubConstructor, stubInterface } from "ts-sinon";

import { GitPullRequest } from "azure-devops-node-api/interfaces/GitInterfaces";

import { BranchNameProvider } from "@/branch.name.provider";
import { PullRequestProvider } from "@/pullrequest.provider";

describe("Branch name provider", function () {
  let branchNameProvider: BranchNameProvider;

  const pullRequestProvider = stubConstructor(PullRequestProvider);
  const gitPullRequestStub = stubInterface<GitPullRequest>();

  const dummyProject = "dummyProject";
  const dummyBuildId = 1;
  const dummyBranchName = "dummyBranchName";

  beforeEach(() => {
    branchNameProvider = new BranchNameProvider(pullRequestProvider);

    gitPullRequestStub.sourceRefName = dummyBranchName;
  });

  describe("getBranchName", function () {
    it("should return branch name from pull request", async function () {
      // given

      pullRequestProvider.getPullRequest
        .withArgs(dummyProject, dummyBuildId)
        .resolves(gitPullRequestStub);

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
