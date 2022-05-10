import tmrm = require("azure-pipelines-task-lib/mock-run");
import path = require("path");
import { IRestResponse } from "typed-rest-client";
import { ConnectionData } from "azure-devops-node-api/interfaces/LocationsInterfaces";
import { IWebApiArrayResult } from "azure-devops-node-api/Serialization";
import {
  Build,
  BuildReason,
} from "azure-devops-node-api/interfaces/BuildInterfaces";
import { GitCommitRef } from "azure-devops-node-api/interfaces/GitInterfaces";

const taskPath = path.join(__dirname, "..", "..", "dist", "index.js");
const tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

tmr.registerMock("typed-rest-client/RestClient", {
  RestClient: function () {
    return {
      options: async function (
        requestUrl: string
      ): Promise<IRestResponse<IWebApiArrayResult>> {
        if (
          requestUrl === "https://my-azure-server/myorganization/_apis/Location"
        ) {
          return {
            result: {
              value: [
                {
                  id: "00d9565f-ed9c-4a06-9a50-00e7896ccab4",
                  area: "Location",
                  resourceName: "ConnectionData",
                  routeTemplate: "_apis/{resource}",
                  resourceVersion: 1,
                  minVersion: "1.0",
                  maxVersion: "7.1",
                  releasedVersion: "0.0",
                },
                {
                  id: "e81700f7-3be2-46de-8624-2eb35882fcaa",
                  area: "Location",
                  resourceName: "ResourceAreas",
                  routeTemplate: "_apis/{resource}/{areaId}",
                  resourceVersion: 1,
                  minVersion: "3.2",
                  maxVersion: "7.1",
                  releasedVersion: "0.0",
                },
                {
                  id: "d810a47d-f4f4-4a62-a03f-fa1860585c4c",
                  area: "Location",
                  resourceName: "ServiceDefinitions",
                  routeTemplate: "_apis/{resource}/{serviceType}/{identifier}",
                  resourceVersion: 1,
                  minVersion: "1.0",
                  maxVersion: "7.1",
                  releasedVersion: "0.0",
                },
              ],
              count: 3,
            },
            statusCode: 200,
            headers: [],
          };
        } else if (
          requestUrl === "https://my-azure-server/myorganization/_apis/build"
        ) {
          return {
            result: {
              count: 2,
              value: [
                {
                  id: "0cd358e1-9217-4d94-8269-1c1ee6f93dcf",
                  area: "Build",
                  resourceName: "Builds",
                  routeTemplate: "{project}/_apis/build/{resource}/{buildId}",
                  resourceVersion: 7,
                  minVersion: "1.0",
                  maxVersion: "7.1",
                  releasedVersion: "7.0",
                },
                {
                  id: "54572c7b-bbd3-45d4-80dc-28be08941620",
                  area: "build",
                  resourceName: "changes",
                  routeTemplate:
                    "{project}/_apis/{area}/builds/{buildId}/{resource}",
                  resourceVersion: 2,
                  minVersion: "2.0",
                  maxVersion: "7.1",
                  releasedVersion: "7.0",
                },
              ],
            },
            statusCode: 200,
            headers: [],
          };
        } else if (
          requestUrl === "https://my-azure-server/myorganization/_apis/git"
        ) {
          return {
            result: {
              count: 2,
              value: [
                {
                  id: "9946fd70-0d40-406e-b686-b4744cbbcc37",
                  area: "git",
                  resourceName: "pullRequests",
                  routeTemplate:
                    "{project}/_apis/{area}/repositories/{repositoryId}/{resource}/{pullRequestId}",
                  resourceVersion: 1,
                  minVersion: "1.0",
                  maxVersion: "7.1",
                  releasedVersion: "7.0",
                },
                {
                  id: "c2570c3b-5b3f-41b8-98bf-5407bfde8d58",
                  area: "git",
                  resourceName: "commits",
                  routeTemplate:
                    "{project}/_apis/{area}/repositories/{repositoryId}/{resource}/{commitId}",
                  resourceVersion: 1,
                  minVersion: "1.0",
                  maxVersion: "7.1",
                  releasedVersion: "7.0",
                },
              ],
            },
            statusCode: 200,
            headers: [],
          };
        } else throw Error("Wrong url");
      },
      get: async function (
        resource: string
      ): Promise<
        IRestResponse<
          ConnectionData | IWebApiArrayResult | Build | GitCommitRef
        >
      > {
        if (
          resource ===
          "https://my-azure-server/myorganization/_apis/connectionData"
        ) {
          return {
            result: {
              authenticatedUser: {
                providerDisplayName: "shark300",
              },
            },
            statusCode: 200,
            headers: [],
          };
        } else if (
          resource ===
          "https://my-azure-server/myorganization/_apis/ResourceAreas"
        ) {
          return {
            result: {
              count: 0,
              value: [],
            },
            statusCode: 200,
            headers: [],
          };
        } else if (
          resource ===
          "https://my-azure-server/myorganization/myproject/_apis/build/Builds/1"
        ) {
          return {
            result: {
              sourceBranch: "refs/heads/master",
              sourceVersion: "4d59d256f331c8e2a4bf453d33c94f868426a0b4",
              reason: BuildReason.IndividualCI,
              repository: {
                id: "a152bef2-0262-420e-b829-aa2299c34158",
                type: "TfsGit",
              },
            },
            statusCode: 200,
            headers: [],
          };
        } else if (
          resource ===
          "https://my-azure-server/myorganization/myproject/_apis/build/Builds/2"
        ) {
          return {
            result: {
              sourceBranch: "refs/heads/master",
              sourceVersion: "0350ba5886c683e8b77c3c68f72dd043acca1f79",
              reason: BuildReason.IndividualCI,
              repository: {
                id: "a152bef2-0262-420e-b829-aa2299c34158",
                type: "TfsGit",
              },
            },
            statusCode: 200,
            headers: [],
          };
        } else if (
          resource ===
          "https://my-azure-server/myorganization/myproject/_apis/build/builds/1/changes"
        ) {
          return {
            result: {
              count: 1,
              value: [
                {
                  id: "4d59d256f331c8e2a4bf453d33c94f868426a0b4",
                },
              ],
            },
            statusCode: 200,
            headers: [],
          };
        } else if (
          resource ===
          "https://my-azure-server/myorganization/myproject/_apis/build/builds/2/changes"
        ) {
          return {
            result: {
              count: 1,
              value: [
                {
                  id: "ac7ed5ee840c7748ee060f72b45fdd51a529beb5",
                },
              ],
            },
            statusCode: 200,
            headers: [],
          };
        } else if (
          resource ===
          "https://my-azure-server/myorganization/_apis/git/repositories/a152bef2-0262-420e-b829-aa2299c34158/commits/4d59d256f331c8e2a4bf453d33c94f868426a0b4"
        ) {
          return {
            result: {
              comment: "multi line commit\nJIE-1257: sample commit message",
            },
            statusCode: 200,
            headers: [],
          };
        } else if (
          resource ===
          "https://my-azure-server/myorganization/_apis/git/repositories/a152bef2-0262-420e-b829-aa2299c34158/commits/ac7ed5ee840c7748ee060f72b45fdd51a529beb5"
        ) {
          return {
            result: {
              comment: "JIE-1349: sample commit message",
            },
            statusCode: 200,
            headers: [],
          };
        } else if (
          resource ===
          "https://my-azure-server/myorganization/_apis/git/repositories/a152bef2-0262-420e-b829-aa2299c34158/pullRequests?searchCriteria.status=3&searchCriteria.targetRefName=refs%2Fheads%2Fmaster"
        ) {
          return {
            result: {
              value: [
                {
                  pullRequestId: 367,
                  sourceRefName: "refs/heads/feature/JIE-541",
                  lastMergeCommit: {
                    commitId: "4d59d256f331c8e2a4bf453d33c94f868426a0b4",
                  },
                },
                {
                  pullRequestId: 279,
                  sourceRefName: "refs/heads/feature/JIE-831",
                  lastMergeCommit: {
                    commitId: "32b95ef55c35d857be262d0d564f321ef689445e",
                  },
                },
              ],
              count: 2,
            },
            statusCode: 200,
            headers: [],
          };
        } else throw Error("Wrong url");
      },
    };
  },
});

tmr.run();
