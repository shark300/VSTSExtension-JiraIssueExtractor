import * as vm from "azure-devops-node-api";
import * as ba from "azure-devops-node-api/BuildApi";
import * as gitm from "azure-devops-node-api/GitApi";
import * as bi from "azure-devops-node-api/interfaces/BuildInterfaces";
import * as gi from "azure-devops-node-api/interfaces/GitInterfaces";

import { Pipeline } from "@/pipeline";
import { Logger } from "@/logger";

export class PullRequestProvider {
  constructor(public pipeline: Pipeline, public logger: Logger) {}

  async getPullRequest(
    project: string,
    buildId: number
  ): Promise<gi.GitPullRequest> {
    const vsts: vm.WebApi = await this.pipeline.getWebApi();
    const vstsBuild: ba.IBuildApi = await vsts.getBuildApi();

    const build = await vstsBuild.getBuild(project, buildId);

    if (build.reason != bi.BuildReason.IndividualCI) {
      throw Error("IndividualCI is supported only");
    }

    if ((build.repository as bi.BuildRepository).type != "TfsGit") {
      throw Error("TfsGit Repository type is supported only");
    }

    const sourceVersion = build.sourceVersion as string;
    const sourceBranch = build.sourceBranch as string;
    const repositoryId = (build.repository as bi.BuildRepository).id as string;

    this.logger.heading(
      `Searching for Pull Request for ${sourceVersion} sourceVersion at repositoryId: ${repositoryId}`
    );

    const vstsGit: gitm.IGitApi = await vsts.getGitApi();

    const pullRequests = await vstsGit.getPullRequests(repositoryId, <
      gi.GitPullRequestSearchCriteria
    >{
      status: gi.PullRequestStatus.Completed,
      targetRefName: sourceBranch,
    });

    const firstMatchingPullRequestForBuild = pullRequests
      .filter(
        (pullRequest) => pullRequest.lastMergeCommit?.commitId == sourceVersion
      )
      .find((v) => v);

    if (firstMatchingPullRequestForBuild) {
      this.logger.log(
        `Found Pull Request with pullRequestId: ${firstMatchingPullRequestForBuild.pullRequestId}`
      );
      return firstMatchingPullRequestForBuild;
    } else {
      throw Error(
        `Pull Request not found for ${project} project and ${buildId} buildId`
      );
    }
  }
}
