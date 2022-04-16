import chai = require("chai");
import chaiAsPromised from 'chai-as-promised';

import { stubConstructor, stubInterface } from "ts-sinon";

import { Pipeline } from "../../pipeline";
import { WebApi } from "azure-devops-node-api";
import { IBuildApi } from "azure-devops-node-api/BuildApi";
import { Build, BuildReason, BuildRepository } from "azure-devops-node-api/interfaces/BuildInterfaces";
import { IGitApi } from "azure-devops-node-api/GitApi";
import { createStubInstance } from "sinon";
import { PullRequestProvider } from "../../pullrequest.provider";
import { $enum } from "ts-enum-util";
import { GitPullRequest, PullRequestStatus } from "azure-devops-node-api/interfaces/GitInterfaces";

chai.use(chaiAsPromised)


const expect = chai.expect;

describe("Pull Request provider", function () {

    const dummyProject = "dummyProject";
    const dummyBuildId = 1;
    const dummySourceBranch = "dummySourceBranch";
    const dummyBuildRepositoryId = "dummyBuildRepositoryId";

    const firstSourceVersion = "firstSourceVersion"
    const secondSourceVersion = "secondSourceVersion"

    let branchNameProvider: PullRequestProvider;

    let pipelineMock = stubConstructor(Pipeline);
    let webApiMock = createStubInstance(WebApi);
    let buildApiMock = stubInterface<IBuildApi>();
    let gitApiMock = stubInterface<IGitApi>();

    let firstGitPullRequest: GitPullRequest = {};
    let secondGitPullRequest: GitPullRequest = {};

    let buildRepository: BuildRepository = {};
    let build: Build = {};

    beforeEach(() => {
        branchNameProvider = new PullRequestProvider(pipelineMock);

        buildRepository = {
            id: dummyBuildRepositoryId,
            type: "TfsGit"
        }

        build = {
            sourceVersion: secondSourceVersion,
            sourceBranch: dummySourceBranch,
            repository: buildRepository,
            reason: BuildReason.IndividualCI
        }

        firstGitPullRequest.lastMergeCommit = {
            commitId: firstSourceVersion
        }

        secondGitPullRequest.lastMergeCommit = {
            commitId: secondSourceVersion
        }

        pipelineMock.getWebApi.resolves(webApiMock);
        webApiMock.getBuildApi.resolves(buildApiMock);
        webApiMock.getGitApi.resolves(gitApiMock);
        buildApiMock.getBuild.withArgs(dummyProject, dummyBuildId).resolves(build);

        gitApiMock.getPullRequests.withArgs(dummyBuildRepositoryId, {
            status: PullRequestStatus.Completed,
            targetRefName: dummySourceBranch
        }).resolves([firstGitPullRequest, secondGitPullRequest]);
    });

    describe("getPullRequest", function () {

        $enum(BuildReason).getKeys()
            .filter(reason => BuildReason[reason] != BuildReason.IndividualCI)
            .map(reason => {
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

        ["TfsVersionControl", "Git", "GitHub", "Svn"].map(repositoryType => {
            it(`should not support ${repositoryType} repository type`, async function () {
                // given
                buildRepository.type = repositoryType;

                // when + then
                await expect(
                    branchNameProvider.getPullRequest(dummyProject, dummyBuildId)
                ).to.eventually.be.rejectedWith("TfsGit Repository type is supported only");
            });
        });
    });

    describe("getPullRequest", function () {

        it(`should find matching pull request by commit hash`, async function () {
            // given in setUp

            // when
            const actual = await branchNameProvider.getPullRequest(dummyProject, dummyBuildId);

            // then
            expect(actual).to.equals(secondGitPullRequest);
        });

        it(`should return with error when there is no matching pull request`, async function () {
            // given
            gitApiMock.getPullRequests.withArgs(dummyBuildRepositoryId, {
                status: PullRequestStatus.Completed,
                targetRefName: dummySourceBranch
            }).resolves([firstGitPullRequest]);

            // when + then
            await expect(
                branchNameProvider.getPullRequest(dummyProject, dummyBuildId)
            ).to.eventually.be.rejectedWith(`Pull Request not found for ${dummyProject} project and ${dummyBuildId} buildId`);
        });

    });
});