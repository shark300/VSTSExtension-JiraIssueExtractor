import tl = require('azure-pipelines-task-lib/task');

async function run() {
    try {
        // pipeline.banner(`Extracting Jira keys from current build`);
    } catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();