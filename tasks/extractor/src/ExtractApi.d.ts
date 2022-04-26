export interface IExtractApi {
  getJiraKeys(project: string, buildId: number): Promise<string[]>;
}
