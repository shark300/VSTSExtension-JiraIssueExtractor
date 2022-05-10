import * as winston from "winston";

import { IExtractApi } from "@/ExtractApi";

require("core-js/modules/es.array.flat");
require("core-js/modules/es.promise.all-settled");

export class ExtractorService {
  constructor(
    public extractors: IExtractApi[],
    public logger: winston.Logger
  ) {}

  async getJiraKeys(project: string, buildId: number): Promise<string> {
    return Promise.allSettled(
      this.extractors.map((extractor) =>
        extractor.getJiraKeys(project, buildId)
      )
    ).then((jiraKeys) => {
      const resolvedJiraKeys = jiraKeys
        .filter((jiraKey) => {
          if (jiraKey.status != "fulfilled") {
            this.logger.warn(
              `Rejected result: ${
                ((jiraKey as PromiseRejectedResult).reason as Error).message
              }`
            );
            return false;
          }
          return true;
        })
        .map((jiraKey: PromiseFulfilledResult<string[]>) => {
          return jiraKey.value;
        })
        .flat();

      return [...new Set(resolvedJiraKeys)].join(", ");
    });
  }
}
