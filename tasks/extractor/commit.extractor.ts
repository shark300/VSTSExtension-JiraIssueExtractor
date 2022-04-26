import { CommitMessageProvider } from "./commit.message.provider";
import { IExtractApi } from "./ExtractApi";

export class CommitExtractor implements IExtractApi {
  constructor(public commitMessageProvider: CommitMessageProvider) {}

  async getJiraKeys(project: string, buildId: number): Promise<string[]> {
    return this.commitMessageProvider
      .getCommitMessages(project, buildId)
      .then((messages) =>
        messages.flatMap((message) => this.extractJiraKeys(message))
      );
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
