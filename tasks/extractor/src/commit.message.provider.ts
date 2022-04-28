import * as vm from "azure-devops-node-api";
import * as ba from "azure-devops-node-api/BuildApi";
import { BuildReason } from "azure-devops-node-api/interfaces/BuildInterfaces";

import { Pipeline } from "@/pipeline";
import { Logger } from "@/logger";

export class CommitMessageProvider {
  constructor(public pipeline: Pipeline, public logger: Logger) {}

  async getCommitMessages(project: string, buildId: number): Promise<string[]> {
    const vsts: vm.WebApi = await this.pipeline.getWebApi();
    const vstsBuild: ba.IBuildApi = await vsts.getBuildApi();

    const build = await vstsBuild.getBuild(project, buildId);

    if (build.reason != BuildReason.IndividualCI) {
      throw Error("IndividualCI is supported only");
    }

    this.logger.heading(`Get changes for ${project} with buildId: ${buildId}`);

    const changes = await vstsBuild.getBuildChanges(project, buildId);

    return changes
      .map((change) => change.message)
      .filter((message): message is string => !!message);
  }
}
