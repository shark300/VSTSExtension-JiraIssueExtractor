import * as vm from "azure-devops-node-api";
import * as ba from "azure-devops-node-api/BuildApi";
import * as gitm from "azure-devops-node-api/GitApi";
import * as bi from "azure-devops-node-api/interfaces/BuildInterfaces";
import * as winston from "winston";

import { Pipeline } from "@/pipeline";

export class CommitMessageProvider {
  constructor(public pipeline: Pipeline, public logger: winston.Logger) {}

  async getCommitMessages(project: string, buildId: number): Promise<string[]> {
    this.logger.info(
      "Getting commit messages for %s with buildId: %s",
      project,
      buildId
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

    this.logger.info("Get changes for %s with buildId: %s", project, buildId);

    const repositoryId = (build.repository as bi.BuildRepository).id as string;

    const commitHashes: string[] = (
      await vstsBuild.getBuildChanges(project, buildId)
    ).map((change) => change.id);

    this.logger.info("Found commits: %s", commitHashes);

    const changes = [];

    for (const commitHash of commitHashes) {
      this.logger.info(
        "Get commit for hash: %s at repositoryId: %s",
        commitHash,
        repositoryId
      );
      const commit = await vstsGit.getCommit(commitHash, repositoryId);
      changes.push(commit.comment);
    }

    this.logger.info("Found changes: %s", changes);
    return changes;
  }
}
