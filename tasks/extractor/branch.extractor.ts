import { BranchNameProvider } from "./branch.name.provider";
import { IExtractApi } from "./ExtractApi";

export class BranchExtractor implements IExtractApi {
  constructor(public branchNameProvider: BranchNameProvider) {}

  async getJiraKeys(project: string, buildId: number): Promise<string[]> {
    const branchName = await this.branchNameProvider.getBranchName(
      project,
      buildId
    );
    return extractMatch(branchName);

    function isBlank(jiraKey: string) {
      return !jiraKey || jiraKey.length == 0;
    }

    function extractMatch(branchName: string): string[] {
      const getComposedRegex = (...regexes: RegExp[]) =>
        new RegExp(regexes.map((regex) => regex.source).join("|"), "g");

      const jiraKeyWithoutFixes = /^([A-Z]+-\d+)$/;
      const jiraKeyWithSuffix = /^([A-Z]+-\d+)\W.*?$/;
      const jiraKeyWithPrefix = /^.*?\W([A-Z]+-\d+)$/;
      const jiraKeyWithPrefixAndSuffix = /.*?\W([A-Z]+-\d+)\W.*?/;

      const regExp = getComposedRegex(
        jiraKeyWithoutFixes,
        jiraKeyWithSuffix,
        jiraKeyWithPrefix,
        jiraKeyWithPrefixAndSuffix
      );

      return Array.from(branchName.matchAll(regExp))
        .flatMap(function (matches) {
          matches.shift(); // skip whole match
          return matches;
        })
        .filter((jiraKey) => !isBlank(jiraKey));
    }
  }
}
