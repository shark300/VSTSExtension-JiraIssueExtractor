import * as tmrm from "azure-pipelines-task-lib/mock-run";
import * as path from "path";

const taskPath = path.join(__dirname, "..", "..", "dist", "index.js");
const tmr = new tmrm.TaskMockRunner(taskPath);

const repositoryId = "a152bef2-0262-420e-b829-aa2299c34158";
const firstCommit = "4d59d256f331c8e2a4bf453d33c94f868426a0b4";
const secondCommit = "ac7ed5ee840c7748ee060f72b45fdd51a529beb5";

const builds: Record<number, object> = {
  1: {
    sourceBranch: "refs/heads/master",
    sourceVersion: firstCommit,
    reason: 2, // BuildReason.IndividualCI
    repository: { id: repositoryId, type: "TfsGit" },
  },
  2: {
    sourceBranch: "refs/heads/master",
    sourceVersion: "0350ba5886c683e8b77c3c68f72dd043acca1f79",
    reason: 2,
    repository: { id: repositoryId, type: "TfsGit" },
  },
};

tmr.registerMock("azure-devops-node-api", {
  getBearerHandler: () => ({}),
  WebApi: class {
    async connect() {
      return { authenticatedUser: { providerDisplayName: "test-user" } };
    }

    async getBuildApi() {
      return {
        getBuild: async (_project: string, buildId: number) => {
          if (!builds[buildId]) throw new Error("Unexpected build");
          return builds[buildId];
        },
        getBuildChanges: async (_project: string, buildId: number) => {
          if (buildId === 1) return [{ id: firstCommit }];
          if (buildId === 2) return [{ id: secondCommit }];
          throw new Error("Unexpected build");
        },
      };
    }

    async getGitApi() {
      return {
        getCommit: async (commitId: string, repoId: string) => {
          if (repoId !== repositoryId) throw new Error("Unexpected repository");
          if (commitId === firstCommit)
            return {
              comment: "multi line commit\nJIE-1257: sample commit message",
            };
          if (commitId === secondCommit)
            return { comment: "JIE-1349: sample commit message" };
          throw new Error("Unexpected commit");
        },
        getPullRequests: async (repoId: string) => {
          if (repoId !== repositoryId) throw new Error("Unexpected repository");
          return [
            {
              pullRequestId: 367,
              sourceRefName: "refs/heads/feature/JIE-541",
              lastMergeCommit: { commitId: firstCommit },
            },
            {
              pullRequestId: 279,
              sourceRefName: "refs/heads/feature/JIE-831",
              lastMergeCommit: {
                commitId: "32b95ef55c35d857be262d0d564f321ef689445e",
              },
            },
          ];
        },
      };
    }
  },
});

tmr.run();
