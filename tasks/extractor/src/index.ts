import tl = require("azure-pipelines-task-lib/task");
import { createLogger, format, transports } from "winston";

import { Pipeline } from "@/pipeline";
import { BranchExtractor } from "@/branch.extractor";
import { BranchNameProvider } from "@/branch.name.provider";
import { PullRequestProvider } from "@/pullrequest.provider";
import { CommitMessageProvider } from "@/commit.message.provider";
import { CommitExtractor } from "@/commit.extractor";
import { ExtractorService } from "@/extractor.service";

async function run() {
  try {
    const myFormat = format.printf(
      ({ level, message, component, timestamp }) => {
        if (component) {
          return `${timestamp} ${level} [component: ${component}]: ${message}`;
        }
        return `${timestamp} ${level} []: ${message}`;
      }
    );

    const mainLogger = createLogger({
      level: "info",
      format: format.combine(
        format.colorize({ all: true }),
        format.timestamp({
          format: "YYYY-MM-DD HH:mm:ss.SSS",
        }),
        format.errors({ stack: true }),
        format.splat(),
        myFormat
      ),
      transports: [new transports.Console()],
    });

    const branchNameLogger = mainLogger.child({ component: "branchName" });
    const commitsLogger = mainLogger.child({ component: "commits" });

    const pipeline = new Pipeline(mainLogger);

    mainLogger.info("Extracting Jira keys from current build");

    const pullRequestProvider = new PullRequestProvider(
      pipeline,
      branchNameLogger
    );

    const branchNameProvider = new BranchNameProvider(
      pullRequestProvider,
      branchNameLogger
    );
    const branchExtractor = new BranchExtractor(
      branchNameProvider,
      branchNameLogger
    );

    const commitMessageProvider = new CommitMessageProvider(
      pipeline,
      commitsLogger
    );
    const commitExtractor = new CommitExtractor(
      commitMessageProvider,
      commitsLogger
    );

    const extractorService = new ExtractorService([
      branchExtractor,
      commitExtractor,
    ]);

    const jiraKeys = await extractorService.getJiraKeys(
      pipeline.getProject(),
      pipeline.getBuildId()
    );

    mainLogger.info("All extracted Jira keys: %s", jiraKeys);

    mainLogger.info("Publishing variable");

    tl.setVariable("JIRA_KEYS", jiraKeys);
  } catch (err) {
    tl.setResult(tl.TaskResult.Failed, err.message);
  }
}

run();
