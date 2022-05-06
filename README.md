## Benefits of the Jira Issue Extractor Azure DevOps Marketplace Extension

### Jira Key Publishing From Multiple Sources

JiraIssueKeyExtractor task extracts Jira Keys from Pull Request's branch name and commits of the build. The extracted
values will be propagated as `JIRA_KEYS` environment variable.

## Jira Issue Extractor Azure DevOps Marketplace Extension Details

This extension provides Pull Request's branch name and commits analysis and publishing Jira Keys. IndiviualCI is the
only supported way of extraction.

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
