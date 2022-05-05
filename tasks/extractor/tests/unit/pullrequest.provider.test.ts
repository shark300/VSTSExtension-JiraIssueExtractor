import chai = require("chai");
import chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;

import { stubConstructor, stubInterface } from "ts-sinon";
import { $enum } from "ts-enum-util";

import { WebApi } from "azure-devops-node-api";
import { IBuildApi } from "azure-devops-node-api/BuildApi";
import { IGitApi } from "azure-devops-node-api/GitApi";
import {
  Build,
  BuildReason,
  BuildRepository,
} from "azure-devops-node-api/interfaces/BuildInterfaces";
import {
  GitPullRequest,
  PullRequestStatus,
} from "azure-devops-node-api/interfaces/GitInterfaces";
import { Logger } from "winston";

import { PullRequestProvider } from "@/pullrequest.provider";
import { Pipeline } from "@/pipeline";

describe("Pull Request provider", function () {
  const dummyProject = "dummyProject";
  const dummyBuildId = 1;
  const dummySourceBranch = "dummySourceBranch";
  const dummyBuildRepositoryId = "dummyBuildRepositoryId";

  const mismatchingSourceVersion = "mismatchingSourceVersion";
  const matchingSourceVersion = "matchingSourceVersion";

  let branchNameProvider: PullRequestProvider;

  const pipelineMock = stubConstructor(Pipeline);
  const loggerMock = stubInterface<Logger>();

  const webApiMock = stubInterface<WebApi>();
  const buildApiMock = stubInterface<IBuildApi>();
  const gitApiMock = stubInterface<IGitApi>();

  const mismatchingGitPullRequest: GitPullRequest = {};
  const matchingGitPullRequest: GitPullRequest = {};

  let buildRepository: BuildRepository = {};
  let build: Build = {};

  beforeEach(() => {
    branchNameProvider = new PullRequestProvider(pipelineMock, loggerMock);

    buildRepository = {
      id: dummyBuildRepositoryId,
      type: "TfsGit",
    };

    build = {
      sourceVersion: matchingSourceVersion,
      sourceBranch: dummySourceBranch,
      repository: buildRepository,
      reason: BuildReason.IndividualCI,
    };

    mismatchingGitPullRequest.lastMergeCommit = {
      commitId: mismatchingSourceVersion,
    };

    matchingGitPullRequest.lastMergeCommit = {
      commitId: matchingSourceVersion,
    };

    pipelineMock.getWebApi.resolves(webApiMock);
    webApiMock.getBuildApi.resolves(buildApiMock);
    webApiMock.getGitApi.resolves(gitApiMock);
    buildApiMock.getBuild.withArgs(dummyProject, dummyBuildId).resolves(build);

    gitApiMock.getPullRequests
      .withArgs(dummyBuildRepositoryId, {
        status: PullRequestStatus.Completed,
        targetRefName: dummySourceBranch,
      })
      .resolves([mismatchingGitPullRequest, matchingGitPullRequest]);
  });

  describe("getPullRequest", function () {
    $enum(BuildReason)
      .getKeys()
      .filter((reason) => BuildReason[reason] != BuildReason.IndividualCI)
      .map((reason) => {
        it(`should not support ${reason} buildReason`, async function () {
          // given
          build.reason = BuildReason[reason];

          // when + then
          await expect(
            branchNameProvider.getPullRequest(dummyProject, dummyBuildId)
          ).to.eventually.be.rejectedWith("IndividualCI is supported only");
        });
      });
  });

  describe("getPullRequest", function () {
    ["TfsVersionControl", "Git", "GitHub", "Svn"].map((repositoryType) => {
      it(`should not support ${repositoryType} repository type`, async function () {
        // given
        buildRepository.type = repositoryType;

        // when + then
        await expect(
          branchNameProvider.getPullRequest(dummyProject, dummyBuildId)
        ).to.eventually.be.rejectedWith(
          "TfsGit Repository type is supported only"
        );
      });
    });
  });

  describe("getPullRequest", function () {
    it(`should find matching pull request by commit hash`, async function () {
      // given in setUp

      // when
      const actual = await branchNameProvider.getPullRequest(
        dummyProject,
        dummyBuildId
      );

      // then
      expect(actual).to.equals(matchingGitPullRequest);
    });

    it(`should return with error when there is no matching pull request`, async function () {
      // given
      gitApiMock.getPullRequests
        .withArgs(dummyBuildRepositoryId, {
          status: PullRequestStatus.Completed,
          targetRefName: dummySourceBranch,
        })
        .resolves([mismatchingGitPullRequest]);

      // when + then
      await expect(
        branchNameProvider.getPullRequest(dummyProject, dummyBuildId)
      ).to.eventually.be.rejectedWith(
        `Pull Request not found for ${dummyProject} project and ${dummyBuildId} buildId`
      );
    });
  });
});
