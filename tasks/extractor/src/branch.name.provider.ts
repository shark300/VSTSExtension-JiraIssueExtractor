import { PullRequestProvider } from "@/pullrequest.provider";

export class BranchNameProvider {
  constructor(public pullRequestProvider: PullRequestProvider) {}

  async getBranchName(project: string, buildId: number): Promise<string> {
    return this.pullRequestProvider
      .getPullRequest(project, buildId)
      .then((branchName) => branchName?.sourceRefName as string);
  }
}
