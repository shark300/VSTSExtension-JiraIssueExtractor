import tl = require('azure-pipelines-task-lib/task');

import { Pipeline } from "./pipeline";

import * as vm from "azure-devops-node-api";
import * as ba from "azure-devops-node-api/BuildApi";
import { BuildReason } from 'azure-devops-node-api/interfaces/BuildInterfaces';

export class CommitMessageProvider {

    constructor(public pipeline: Pipeline) {
    }

    async getCommitMessages(project: string, buildId: number): Promise<string[]> {
        let vsts: vm.WebApi = await this.pipeline.getWebApi();
        let vstsBuild: ba.IBuildApi = await vsts.getBuildApi();

        let build = await vstsBuild.getBuild(project, buildId);

        if (build.reason != BuildReason.IndividualCI) {
            tl.setResult(tl.TaskResult.Failed, "IndividualCI is supported only");
        }

        this.pipeline.heading(`Get changes for ${project} with buildId: ${buildId}`);

        let changes = await vstsBuild.getBuildChanges(project, buildId);

        return changes.map(change => change.message).filter((message): message is string => !!message);
    }
}
