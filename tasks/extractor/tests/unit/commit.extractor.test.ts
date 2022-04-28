import chai = require("chai");
const expect = chai.expect;

import { stubConstructor } from "ts-sinon";

import { CommitMessageProvider } from "@/commit.message.provider";
import { CommitExtractor } from "@/commit.extractor";

describe("Commit extractor", function () {
  const dummyProject = "dummyProject";
  const dummyBuildId = 1;

  let branchNameExtractor: CommitExtractor;

  const commitMessageProviderMock = stubConstructor(CommitMessageProvider);

  beforeEach(() => {
    branchNameExtractor = new CommitExtractor(commitMessageProviderMock);
  });

  describe("getJiraKeys", function () {
    it("should parse remote auto-merge commit without squash", async function () {
      // given
      commitMessageProviderMock.getCommitMessages
        .withArgs(dummyProject, dummyBuildId)
        .resolves([
          "Merge remote-tracking branch 'remote/origin/master' into feature/JIE-540-test-branch",
        ]);

      // when
      const actual = await branchNameExtractor.getJiraKeys(
        dummyProject,
        dummyBuildId
      );

      // then
      expect(actual).to.have.members(["JIE-540"]);
    });

    it("should parse simple commit", async function () {
      // given
      commitMessageProviderMock.getCommitMessages
        .withArgs(dummyProject, dummyBuildId)
        .resolves(["JIE-540: sample commit message"]);

      // when
      const actual = await branchNameExtractor.getJiraKeys(
        dummyProject,
        dummyBuildId
      );

      // then
      expect(actual).to.have.members(["JIE-540"]);
    });

    it("should parse local branch merge commit", async function () {
      // given
      commitMessageProviderMock.getCommitMessages
        .withArgs(dummyProject, dummyBuildId)
        .resolves(["Merge branch 'hotfix/JIE-540'"]);

      // when
      const actual = await branchNameExtractor.getJiraKeys(
        dummyProject,
        dummyBuildId
      );

      // then
      expect(actual).to.have.members(["JIE-540"]);
    });

    it("should parse remote auto-merge commit without squash with full-URL", async function () {
      // given
      commitMessageProviderMock.getCommitMessages
        .withArgs(dummyProject, dummyBuildId)
        .resolves([
          "Merge branch 'master' of git@github.com:shark300/VSTSExtension-JiraIssueExtractor.git into feature/JIE-540-sample-commit-message",
        ]);

      // when
      const actual = await branchNameExtractor.getJiraKeys(
        dummyProject,
        dummyBuildId
      );

      // then
      expect(actual).to.have.members(["JIE-540"]);
    });

    it("should parse remote auto-merge commit with pull request without squash to another branch and multiline commit message", async function () {
      // given
      commitMessageProviderMock.getCommitMessages
        .withArgs(dummyProject, dummyBuildId)
        .resolves([
          `Pull request #11: feature/JIE-1223 sample commit message

Merge in shark300/VSTSExtension-JiraIssueExtractor from feature/JIE-1223-sample-branch to feature/JIE-18-sample-branch

* commit '7ebc2c0a2e9faf47c557c31a4c4362194985972b':
  JIE-1257: sample commit message
  JIE-225: sample commit message`,
        ]);

      // when
      const actual = await branchNameExtractor.getJiraKeys(
        dummyProject,
        dummyBuildId
      );

      // then
      expect(actual).to.have.members([
        "JIE-1223",
        "JIE-18",
        "JIE-1257",
        "JIE-225",
      ]);
    });

    it("should parse remote auto-merge commit with pull request without squash to another branch and multiline commit message and local squash", async function () {
      // given
      commitMessageProviderMock.getCommitMessages
        .withArgs(dummyProject, dummyBuildId)
        .resolves([
          `Pull request #11: feature/JIE-1223 sample commit message

Merge in shark300/VSTSExtension-JiraIssueExtractor from feature/JIE-1223-sample-branch to feature/JIE-18-sample-branch

Squashed commit of the following:

commit 33df21d6cab8708c76278b5ac1449340ec6a55c5
Author: Unknown
Date: Mon Jan 31 12:16:02 2022 +0100

JIE-1257: sample commit message

commit f7f4bb4506a0c070ad420a3f455fb6b3c02ba82b
Author: Unknown
Date: Mon Jan 31 12:03:54 2022 +0100

JIE-225: sample commit message`,
        ]);

      // when
      const actual = await branchNameExtractor.getJiraKeys(
        dummyProject,
        dummyBuildId
      );

      // then
      expect(actual).to.have.members([
        "JIE-1223",
        "JIE-18",
        "JIE-1257",
        "JIE-225",
      ]);
    });

    it("should parse revert commit", async function () {
      // given
      commitMessageProviderMock.getCommitMessages
        .withArgs(dummyProject, dummyBuildId)
        .resolves([
          `Revert "JIE-1223: sample commit message"

This reverts commit e0606f39f65a98ec55b8f66dfcfaa1deba5377ba.`,
        ]);

      // when
      const actual = await branchNameExtractor.getJiraKeys(
        dummyProject,
        dummyBuildId
      );

      // then
      expect(actual).to.have.members(["JIE-1223"]);
    });
  });
});
