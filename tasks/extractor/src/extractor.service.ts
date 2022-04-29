import { IExtractApi } from "@/ExtractApi";

require("core-js/modules/es.array.flat");

export class ExtractorService {
  constructor(public extractors: IExtractApi[]) {}

  async getJiraKeys(project: string, buildId: number): Promise<string> {
    return Promise.all(
      this.extractors.map((extractor) => {
        return extractor.getJiraKeys(project, buildId);
      })
    ).then((jiraKeys) => [...new Set(jiraKeys.flat())].join(", "));
  }
}
