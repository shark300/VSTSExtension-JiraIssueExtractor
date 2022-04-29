import { PullRequestProvider } from "@/pullrequest.provider";
import { Logger } from "@/logger";

export class BranchNameProvider {
  constructor(
    public pullRequestProvider: PullRequestProvider,
    public logger: Logger
  ) {}

  async getBranchName(project: string, buildId: number): Promise<string> {
    this.logger.heading(
      `Getting branch for ${project} with buildId: ${buildId}`
    );

    const pullRequest = await this.pullRequestProvider.getPullRequest(
      project,
      buildId
    );
    const branchName = pullRequest?.sourceRefName as string;

    this.logger.log(`Found branch: ${branchName}`);
    return branchName;
  }
}
