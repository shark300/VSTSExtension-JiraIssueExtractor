import { PullRequestProvider } from "./pullrequest.provider";

export class BranchNameProvider {
  constructor(public pullRequestProvider: PullRequestProvider) {}

  async getBranchName(project: string, buildId: number): Promise<string> {
    const firstMatchingPullRequestForBuild =
      await this.pullRequestProvider.getPullRequest(project, buildId);
    return firstMatchingPullRequestForBuild?.sourceRefName as string;
  }
}
