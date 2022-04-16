import { BranchNameProvider } from "./branch.name.provider";
import { IExtractApi } from "./ExtractApi";

export class BranchExtractor implements IExtractApi {

    constructor(public branchNameProvider: BranchNameProvider) {
    }

    async getJiraKeys(project: string, buildId: number): Promise<String[]> {
        return this.branchNameProvider.getBranchName(project, buildId)
            .then((value) => this.extractJiraKeys(value));
    }

    private static isBlank(jiraKey: string) {
        return !jiraKey || jiraKey.length == 0;
    }

    private extractJiraKeys(branchName: string): string[] {
        const jiraKeyWithoutFixes = /^([A-Z]+-\d+)$/g;
        const jiraKeyWithSuffix = /^([A-Z]+-\d+)\W.*?$/g;
        const jiraKeyWithPrefix = /^.*?\W([A-Z]+-\d+)$/g;
        const jiraKeyWithPrefixAndSuffix = /.*?\W([A-Z]+-\d+)\W.*?/g;

        let extractedJiraKeys: string[] = [jiraKeyWithoutFixes, jiraKeyWithSuffix, jiraKeyWithPrefix, jiraKeyWithPrefixAndSuffix]
            .map(regExp => Array.from(branchName.matchAll(regExp)))
            .flatMap(matches => matches)
            .flatMap(function (matches) {
                matches.shift(); // skip whole match
                return matches;

            })
            .filter(jiraKey => !BranchExtractor.isBlank(jiraKey));

        return [...new Set(extractedJiraKeys)];
    }
}
