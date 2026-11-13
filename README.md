## Benefits of the Jira Issue Extractor Azure DevOps Marketplace Extension

### Jira Key Publishing From Multiple Sources

JiraIssueKeyExtractor task extracts Jira Keys from Pull Request's branch name and commits of the build. The extracted
values will be propagated as `Jira.Keys` variable.

## Jira Issue Extractor Azure DevOps Marketplace Extension Details

This extension provides Pull Request's branch name and commits analysis and publishing Jira Keys. IndiviualCI and
TfsGit is the only supported way of extraction.

Integration sample for Build Pipeline:

```yaml
jobs:
  - job: Build

    steps:
      - checkout: self
        clean: true
      - task: JiraIssueKeyExtractor@1
        env:
          SYSTEM_ACCESSTOKEN: $(System.AccessToken)
        condition: eq(variables['Build.Reason'], 'IndividualCI')
```

[![VSTSExtension-JiraIssueExtractor CI](https://github.com/shark300/VSTSExtension-JiraIssueExtractor/actions/workflows/ci.yml/badge.svg)](https://github.com/shark300/VSTSExtension-JiraIssueExtractor/actions/workflows/ci.yml)

## Node.js 24 agent requirements

This task executes on the Azure Pipelines **Node24** handler and requires agent **4.265.1 or newer**.
The build, pull request, and Git commit APIs are accessed through the supported
`azure-devops-node-api` client (not hand-written REST requests). The pipeline's
`SYSTEM_ACCESSTOKEN` is used as a Bearer token. The sample above explicitly passes
that token to the task. Ensure the build service identity can read builds and code.

### Development and release

Use Node.js 24 and run the following commands inside `tasks/extractor`:

```sh
npm ci
npm run lint:check
npm test
npm run integrationTest
```

The CI workflow also builds the TypeScript task and verifies that its `dist/index.js`
entry point is emitted. Compile and package the task's runtime `node_modules` and
`dist/` together when producing the VSIX. Both `task.json` and the marketplace
manifest versions must be increased on each published release.
