import chai = require("chai");
import chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;

import { stubConstructor, stubInterface } from "ts-sinon";
import { createStubInstance } from "sinon";
import { $enum } from "ts-enum-util";

import { WebApi } from "azure-devops-node-api";
import { IBuildApi } from "azure-devops-node-api/BuildApi";
import {
  Build,
  BuildReason,
  BuildRepository,
  Change,
} from "azure-devops-node-api/interfaces/BuildInterfaces";
import { IGitApi } from "azure-devops-node-api/GitApi";

import { CommitMessageProvider } from "@/commit.message.provider";
import { Pipeline } from "@/pipeline";
import { Logger } from "@/logger";

describe("Commit message provider", function () {
  const dummyProject = "dummyProject";
  const dummyBuildId = 1;
  const dummyBuildRepositoryId = "dummyBuildRepositoryId";

  const firstCommitHash = "firstCommitHash";
  const secondCommitHash = "secondCommitHash";
  const firstMessage = "firstMessage";
  const secondMessage = "secondMessage";

  let commitMessageProvider: CommitMessageProvider;

  const pipelineMock = stubConstructor(Pipeline);
  const loggerMock = stubConstructor(Logger);

  const webApiMock = createStubInstance(WebApi);
  const buildApiMock = stubInterface<IBuildApi>();
  const gitApiMock = stubInterface<IGitApi>();

  const firstValidChange: Change = {
    id: firstCommitHash,
    message: firstMessage,
  };
  const secondValidChange: Change = {
    id: secondCommitHash,
    message: secondMessage,
  };

  let build: Build = {};
  let buildRepository: BuildRepository = {};

  beforeEach(() => {
    commitMessageProvider = new CommitMessageProvider(pipelineMock, loggerMock);

    buildRepository = {
      id: dummyBuildRepositoryId,
      type: "TfsGit",
    };

    build = {
      repository: buildRepository,
      reason: BuildReason.IndividualCI,
    };

    pipelineMock.getWebApi.resolves(webApiMock);
    webApiMock.getBuildApi.resolves(buildApiMock);
    webApiMock.getGitApi.resolves(gitApiMock);
    buildApiMock.getBuild.withArgs(dummyProject, dummyBuildId).resolves(build);

    buildApiMock.getBuildChanges
      .withArgs(dummyProject, dummyBuildId)
      .resolves([firstValidChange, secondValidChange]);

    gitApiMock.getCommit
      .withArgs(firstCommitHash, dummyBuildRepositoryId)
      .resolves({ comment: firstMessage });

    gitApiMock.getCommit
      .withArgs(secondCommitHash, dummyBuildRepositoryId)
      .resolves({ comment: secondMessage });
  });

  describe("getCommitMessages", function () {
    $enum(BuildReason)
      .getKeys()
      .filter((reason) => BuildReason[reason] != BuildReason.IndividualCI)
      .map((reason) => {
        it(`should not support ${reason} buildReason`, async function () {
          // given
          build.reason = BuildReason[reason];

          // when + then
          await expect(
            commitMessageProvider.getCommitMessages(dummyProject, dummyBuildId)
          ).to.eventually.be.rejectedWith("IndividualCI is supported only");
        });
      });
  });

  describe("getCommitMessages", function () {
    it("should return array of commit messages", async function () {
      // given

      // when
      const actual = await commitMessageProvider.getCommitMessages(
        dummyProject,
        dummyBuildId
      );

      // then
      expect(actual).to.have.members([firstMessage, secondMessage]);
    });
  });
});
