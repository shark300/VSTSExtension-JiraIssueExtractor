import { Pipeline } from "./pipeline";

import * as vm from "azure-devops-node-api";
import * as ba from "azure-devops-node-api/BuildApi";
import { BuildReason } from 'azure-devops-node-api/interfaces/BuildInterfaces';

export class CommitMessageProvider {

    constructor(public pipeline: Pipeline) {
    }

    async getCommitMessages(project: string, buildId: number): Promise<string[]> {
        const vsts: vm.WebApi = await this.pipeline.getWebApi();
        const vstsBuild: ba.IBuildApi = await vsts.getBuildApi();

        const build = await vstsBuild.getBuild(project, buildId);

        if (build.reason != BuildReason.IndividualCI) {
            throw Error("IndividualCI is supported only");
        }

        this.pipeline.heading(`Get changes for ${project} with buildId: ${buildId}`);

        const changes = await vstsBuild.getBuildChanges(project, buildId);

        return changes.map(change => change.message).filter((message): message is string => !!message);
    }
}
