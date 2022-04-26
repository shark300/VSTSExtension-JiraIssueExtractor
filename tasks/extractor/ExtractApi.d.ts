export interface IExtractApi {
    async getJiraKeys(project: string, buildId: number): Promise<string[]>;
}