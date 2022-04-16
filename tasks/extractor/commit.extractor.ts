import { CommitMessageProvider } from "./commit.message.provider";
import { IExtractApi } from "./ExtractApi";

class CommitExtractor implements IExtractApi {

    constructor(public commitMessageProvider: CommitMessageProvider) {
    }

    async getJiraKeys(project: string, buildId: number): Promise<string[]> {
        return new Promise<string[]>(async (resolve, reject) => {
            try {
                let commitMessages = await this.commitMessageProvider.getCommitMessages(project, buildId);
            } catch (err) {
                reject(err);
            }
        });
    }
}