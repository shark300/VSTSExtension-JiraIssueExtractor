import * as vm from "azure-devops-node-api";
import * as ba from "azure-devops-node-api/BuildApi";
import * as gitm from "azure-devops-node-api/GitApi";
import * as bi from "azure-devops-node-api/interfaces/BuildInterfaces";
import * as gi from "azure-devops-node-api/interfaces/GitInterfaces";
import { GitPullRequest } from "azure-devops-node-api/interfaces/GitInterfaces";
import { Pipeline } from "./pipeline";

export class PullRequestProvider {

    constructor(public pipeline: Pipeline) {
    }

    async getPullRequest(project: string, buildId: number): Promise<GitPullRequest> {
        let vsts: vm.WebApi = await this.pipeline.getWebApi();
        let vstsBuild: ba.IBuildApi = await vsts.getBuildApi();

        this.pipeline.heading(`Get branch for ${project} with buildId: ${buildId}`);

        let build = await vstsBuild.getBuild(project, buildId);

        if (build.reason != bi.BuildReason.IndividualCI) {
            throw Error("IndividualCI is supported only");
        }

        if ((build.repository as bi.BuildRepository).type != "TfsGit") {
            throw Error("TfsGit Repository type is supported only");
        }

        let sourceVersion = build.sourceVersion as string;
        let sourceBranch = build.sourceBranch as string;
        let repositoryId = (build.repository as bi.BuildRepository).id as string;

        this.pipeline.heading(`Searching for Pull Request for ${sourceVersion} sourceVersion at repositoryId: ${repositoryId}`);

        let vstsGit: gitm.IGitApi = await vsts.getGitApi();

        let pullRequests = await vstsGit.getPullRequests(repositoryId, <gi.GitPullRequestSearchCriteria>{
            status: gi.PullRequestStatus.Completed,
            targetRefName: sourceBranch,
        });

        let firstMatchingPullRequestForBuild = pullRequests.filter(pullRequest => pullRequest.lastMergeCommit?.commitId == sourceVersion).find(v => v);

        if (firstMatchingPullRequestForBuild) {
            return firstMatchingPullRequestForBuild;
        } else {
            throw Error(`Pull Request not found for ${project} project and ${buildId} buildId`);
        }
    }
}