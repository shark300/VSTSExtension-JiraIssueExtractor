import tl = require("azure-pipelines-task-lib/task");

import { Pipeline } from "@/pipeline";
import { BranchExtractor } from "@/branch.extractor";
import { BranchNameProvider } from "@/branch.name.provider";
import { PullRequestProvider } from "@/pullrequest.provider";
import { CommitMessageProvider } from "@/commit.message.provider";
import { CommitExtractor } from "@/commit.extractor";
import { ExtractorService } from "@/extractor.service";
import { Logger } from "@/logger";

async function run() {
  try {
    const pipeline = new Pipeline();
    const logger = new Logger();

    logger.banner(`Extracting Jira keys from current build`);

    const pullRequestProvider = new PullRequestProvider(pipeline, logger);

    const branchNameProvider = new BranchNameProvider(
      pullRequestProvider,
      logger
    );
    const branchExtractor = new BranchExtractor(branchNameProvider, logger);

    const commitMessageProvider = new CommitMessageProvider(pipeline, logger);
    const commitExtractor = new CommitExtractor(commitMessageProvider, logger);

    const extractorService = new ExtractorService([
      branchExtractor,
      commitExtractor,
    ]);

    const jiraKeys = await extractorService.getJiraKeys(
      pipeline.getProject(),
      pipeline.getBuildId()
    );

    logger.log(`All extracted Jira keys: ${jiraKeys}`);

    logger.log(`Publishing variable`);

    tl.setVariable("JIRA_KEYS", jiraKeys);
  } catch (err) {
    tl.setResult(tl.TaskResult.Failed, err.message);
  }
}

run();
