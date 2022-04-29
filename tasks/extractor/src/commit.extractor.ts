import { CommitMessageProvider } from "@/commit.message.provider";
import { IExtractApi } from "@/ExtractApi";
import { Logger } from "@/logger";

require("core-js/modules/es.array.flat-map");
require("core-js/modules/es.string.match-all");

export class CommitExtractor implements IExtractApi {
  constructor(
    public commitMessageProvider: CommitMessageProvider,
    public logger: Logger
  ) {}

  async getJiraKeys(project: string, buildId: number): Promise<string[]> {
    this.logger.heading(
      `Extracting Jira keys from changes for ${project} with buildId: ${buildId}`
    );

    const messages = await this.commitMessageProvider.getCommitMessages(
      project,
      buildId
    );
    const jiraKeys = messages.flatMap((message) =>
      this.extractJiraKeys(message)
    );

    this.logger.log(`Extracted Jira keys from changes: ${jiraKeys}`);
    return jiraKeys;
  }

  private static isBlank(jiraKey: string) {
    return !jiraKey || jiraKey.length == 0;
  }

  private extractJiraKeys(message: string): string[] {
    const jiraKeyWithoutFixes = /.*?([A-Z]+-\d+).*?/g;

    const extractedJiraKeys: string[] = [jiraKeyWithoutFixes]
      .map((regExp) => Array.from(message.matchAll(regExp)))
      .flatMap((matches) => matches)
      .flatMap(function (matches) {
        matches.shift(); // skip whole match
        return matches;
      })
      .filter((jiraKey) => !CommitExtractor.isBlank(jiraKey));

    return [...new Set(extractedJiraKeys)];
  }
}
