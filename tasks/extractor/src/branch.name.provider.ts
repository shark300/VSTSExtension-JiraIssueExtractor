import * as winston from "winston";

import { PullRequestProvider } from "@/pullrequest.provider";

export class BranchNameProvider {
  constructor(
    public pullRequestProvider: PullRequestProvider,
    public logger: winston.Logger
  ) {}

  async getBranchName(project: string, buildId: number): Promise<string> {
    this.logger.info(
      "Getting branch for %s with buildId: %s",
      project,
      buildId
    );

    const pullRequest = await this.pullRequestProvider.getPullRequest(
      project,
      buildId
    );
    const branchName = pullRequest?.sourceRefName as string;

    this.logger.info("Found branch: %s", branchName);
    return branchName;
  }
}
