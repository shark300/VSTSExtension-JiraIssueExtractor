import chai = require("chai");
import { stubConstructor, stubInterface } from "ts-sinon";

import { CommitMessageProvider } from "../../commit.message.provider";
import { Pipeline } from "../../pipeline";
import { createStubInstance } from "sinon";
import { WebApi } from "azure-devops-node-api";
import { IBuildApi } from "azure-devops-node-api/BuildApi";
import { Build, BuildReason, Change } from "azure-devops-node-api/interfaces/BuildInterfaces";
import { $enum } from "ts-enum-util";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised)

const expect = chai.expect;

describe("Commit message provider", function () {

    const dummyProject = "dummyProject";
    const dummyBuildId = 1;

    const firstMessage = "firstMessage";
    const secondMessage = "secondMessage";

    let commitMessageProvider: CommitMessageProvider;

    const pipelineMock = stubConstructor(Pipeline);
    const webApiMock = createStubInstance(WebApi);
    const buildApiMock = stubInterface<IBuildApi>();

    const invalidMessage: Change = {};

    const firstValidChange: Change = {
        message: firstMessage
    };
    const secondValidChange: Change = {
        message: secondMessage
    };

    let build: Build = {};

    beforeEach(() => {
        commitMessageProvider = new CommitMessageProvider(pipelineMock);

        build = {
            reason: BuildReason.IndividualCI
        }

        pipelineMock.getWebApi.resolves(webApiMock);
        webApiMock.getBuildApi.resolves(buildApiMock);
        buildApiMock.getBuild.withArgs(dummyProject, dummyBuildId).resolves(build);
        buildApiMock.getBuildChanges.withArgs(dummyProject, dummyBuildId).resolves([firstValidChange, secondValidChange]);
    });

    describe("getCommitMessages", function () {

        $enum(BuildReason).getKeys()
            .filter(reason => BuildReason[reason] != BuildReason.IndividualCI)
            .map(reason => {
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
            const actual = await commitMessageProvider.getCommitMessages(dummyProject, dummyBuildId);

            // then
            expect(actual).to.have.members([firstMessage, secondMessage]);
        });

        it("should filter out invalid commit", async function () {
            // given
            buildApiMock.getBuildChanges.withArgs(dummyProject, dummyBuildId).resolves([invalidMessage, firstValidChange]);

            // when
            const actual = await commitMessageProvider.getCommitMessages(dummyProject, dummyBuildId);

            // then
            expect(actual).to.have.members([firstMessage]);
        });
    });
});
