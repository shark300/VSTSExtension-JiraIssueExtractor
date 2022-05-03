import * as vm from "azure-devops-node-api";
import * as ba from "azure-devops-node-api/BuildApi";
import * as gitm from "azure-devops-node-api/GitApi";
import * as bi from "azure-devops-node-api/interfaces/BuildInterfaces";

import { Pipeline } from "@/pipeline";
import { Logger } from "@/logger";

export class CommitMessageProvider {
  constructor(public pipeline: Pipeline, public logger: Logger) {}

  async getCommitMessages(project: string, buildId: number): Promise<string[]> {
    this.logger.heading(
      `Getting commit messages for ${project} with buildId: ${buildId}`
    );

    const vsts: vm.WebApi = await this.pipeline.getWebApi();
    const vstsBuild: ba.IBuildApi = await vsts.getBuildApi();
    const vstsGit: gitm.IGitApi = await vsts.getGitApi();

    const build = await vstsBuild.getBuild(project, buildId);

    if (build.reason != bi.BuildReason.IndividualCI) {
      throw Error("IndividualCI is supported only");
    }

    if ((build.repository as bi.BuildRepository).type != "TfsGit") {
      throw Error("TfsGit Repository type is supported only");
    }

    this.logger.log(`Get changes for ${project} with buildId: ${buildId}`);

    const repositoryId = (build.repository as bi.BuildRepository).id as string;

    const commitHashes: string[] = (
      await vstsBuild.getBuildChanges(project, buildId)
    ).map((change) => change.id);

    this.logger.log(`Found commits: ${commitHashes}`);

    const changes = [];

    for (const commitHash of commitHashes) {
      this.logger.log(
        `Get commit for hash: ${commitHash} at repositoryId: ${repositoryId}`
      );
      const commit = await vstsGit.getCommit(commitHash, repositoryId);
      changes.push(commit.comment);
    }

    this.logger.log(`Found changes: ${changes}`);
    return changes;
  }
}
