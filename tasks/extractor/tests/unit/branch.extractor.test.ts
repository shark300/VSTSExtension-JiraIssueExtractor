import chai = require("chai");
const expect = chai.expect;

import { stubConstructor } from "ts-sinon";

import { BranchNameProvider } from "@/branch.name.provider";
import { BranchExtractor } from "@/branch.extractor";

describe("Branch extractor", function () {
  const dummyProject = "dummyProject";
  const dummyBuildId = 1;

  let branchNameExtractor: BranchExtractor;

  const branchNameProviderMock = stubConstructor(BranchNameProvider);

  beforeEach(() => {
    branchNameExtractor = new BranchExtractor(branchNameProviderMock);
  });

  describe("getJiraKeys", function () {
    it("should return empty array when branchName is empty", async function () {
      // given
      branchNameProviderMock.getBranchName
        .withArgs(dummyProject, dummyBuildId)
        .resolves("");

      // when
      const actual = await branchNameExtractor.getJiraKeys(
        dummyProject,
        dummyBuildId
      );

      // then
      expect(actual).to.have.members([]);
    });

    it("should return jiraKey when there is no prefix and no suffix around the key", async function () {
      // given
      branchNameProviderMock.getBranchName
        .withArgs(dummyProject, dummyBuildId)
        .resolves("JIE-540");

      // when
      const actual = await branchNameExtractor.getJiraKeys(
        dummyProject,
        dummyBuildId
      );

      // then
      expect(actual).to.have.members(["JIE-540"]);
    });

    it("should return jiraKey when there is no prefix and suffix with separator around the key", async function () {
      // given
      branchNameProviderMock.getBranchName
        .withArgs(dummyProject, dummyBuildId)
        .resolves("JIE-540-suffix");

      // when
      const actual = await branchNameExtractor.getJiraKeys(
        dummyProject,
        dummyBuildId
      );

      // then
      expect(actual).to.have.members(["JIE-540"]);
    });

    it("should return jiraKey when there is prefix with separator and no suffix around the key", async function () {
      // given
      branchNameProviderMock.getBranchName
        .withArgs(dummyProject, dummyBuildId)
        .resolves("prefix-JIE-540");

      // when
      const actual = await branchNameExtractor.getJiraKeys(
        dummyProject,
        dummyBuildId
      );

      // then
      expect(actual).to.have.members(["JIE-540"]);
    });

    it("should return jiraKey when there is prefix with separator and suffix with separator around the key", async function () {
      // given
      branchNameProviderMock.getBranchName
        .withArgs(dummyProject, dummyBuildId)
        .resolves("prefix-JIE-540-suffix");

      // when
      const actual = await branchNameExtractor.getJiraKeys(
        dummyProject,
        dummyBuildId
      );

      // then
      expect(actual).to.have.members(["JIE-540"]);
    });

    it("should return first jiraKey when there is prefix with separator, suffix with separator but separator between keys", async function () {
      // given
      branchNameProviderMock.getBranchName
        .withArgs(dummyProject, dummyBuildId)
        .resolves("prefix-JIE-1257-JIE-926-suffix");

      // when
      const actual = await branchNameExtractor.getJiraKeys(
        dummyProject,
        dummyBuildId
      );

      // then
      expect(actual).to.have.members(["JIE-1257"]);
    });

    it("should return empty array when there is prefix with separator, suffix with separator but no separator between keys", async function () {
      // given
      branchNameProviderMock.getBranchName
        .withArgs(dummyProject, dummyBuildId)
        .resolves("prefix-JIE-1257JIE-926-suffix");

      // when
      const actual = await branchNameExtractor.getJiraKeys(
        dummyProject,
        dummyBuildId
      );

      // then
      expect(actual).to.have.members([]);
    });

    it("should return two jiraKeys when there is prefix with separator, suffix with separator, and infix with separator between keys", async function () {
      // given
      branchNameProviderMock.getBranchName
        .withArgs(dummyProject, dummyBuildId)
        .resolves("prefix-JIE-1257-infix-JIE-926-suffix");

      // when
      const actual = await branchNameExtractor.getJiraKeys(
        dummyProject,
        dummyBuildId
      );

      // then
      expect(actual).to.have.members(["JIE-1257", "JIE-926"]);
    });

    it("should return empty array when there is prefix without separator and suffix without separator", async function () {
      // given
      branchNameProviderMock.getBranchName
        .withArgs(dummyProject, dummyBuildId)
        .resolves("prefixJIE-1257suffix");

      // when
      const actual = await branchNameExtractor.getJiraKeys(
        dummyProject,
        dummyBuildId
      );

      // then
      expect(actual).to.have.members([]);
    });

    it("should return two jiraKeys when there is prefix with separator, suffix with separator but two separators between keys", async function () {
      // given
      branchNameProviderMock.getBranchName
        .withArgs(dummyProject, dummyBuildId)
        .resolves("prefix-JIE-1257--JIE-926-suffix");

      // when
      const actual = await branchNameExtractor.getJiraKeys(
        dummyProject,
        dummyBuildId
      );

      // then
      expect(actual).to.have.members(["JIE-1257", "JIE-926"]);
    });

    it("should filter out duplicated values", async function () {
      // given
      branchNameProviderMock.getBranchName
        .withArgs(dummyProject, dummyBuildId)
        .resolves("prefix-JIE-1257-infix-JIE-1257-suffix");

      // when
      const actual = await branchNameExtractor.getJiraKeys(
        dummyProject,
        dummyBuildId
      );

      // then
      expect(actual).to.have.members(["JIE-1257"]);
    });
  });
});
