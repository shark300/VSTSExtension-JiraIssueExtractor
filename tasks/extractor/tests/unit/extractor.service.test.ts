import chai = require("chai");
const expect = chai.expect;

import { stubInterface } from "ts-sinon";

import { IExtractApi } from "@/ExtractApi";
import { ExtractorService } from "@/extractor.service";

describe("Extractor service", function () {
  const dummyProject = "dummyProject";
  const dummyBuildId = 1;

  let extractorService: ExtractorService;

  const firstExtractorMock = stubInterface<IExtractApi>();
  const secondExtractorMock = stubInterface<IExtractApi>();

  beforeEach(() => {
    extractorService = new ExtractorService([
      firstExtractorMock,
      secondExtractorMock,
    ]);
  });

  describe("getJiraKeys", function () {
    it("should return empty array when extractors returns with empty arrays", async function () {
      // given
      firstExtractorMock.getJiraKeys
        .withArgs(dummyProject, dummyBuildId)
        .resolves([]);
      secondExtractorMock.getJiraKeys
        .withArgs(dummyProject, dummyBuildId)
        .resolves([]);

      // when
      const actual = await extractorService.getJiraKeys(
        dummyProject,
        dummyBuildId
      );

      // then
      expect(actual).to.equals("");
    });

    it("should concatenate extractors' results with comma", async function () {
      // given
      firstExtractorMock.getJiraKeys
        .withArgs(dummyProject, dummyBuildId)
        .resolves(["JIE-540"]);
      secondExtractorMock.getJiraKeys
        .withArgs(dummyProject, dummyBuildId)
        .resolves(["JIE-1257"]);

      // when
      const actual = await extractorService.getJiraKeys(
        dummyProject,
        dummyBuildId
      );

      // then
      expect(actual).to.equals("JIE-540, JIE-1257");
    });

    it("should filter out duplication from extractors' results", async function () {
      // given
      firstExtractorMock.getJiraKeys
        .withArgs(dummyProject, dummyBuildId)
        .resolves(["JIE-540"]);
      secondExtractorMock.getJiraKeys
        .withArgs(dummyProject, dummyBuildId)
        .resolves(["JIE-1257", "JIE-540"]);

      // when
      const actual = await extractorService.getJiraKeys(
        dummyProject,
        dummyBuildId
      );

      // then
      expect(actual).to.equals("JIE-540, JIE-1257");
    });
  });
});
