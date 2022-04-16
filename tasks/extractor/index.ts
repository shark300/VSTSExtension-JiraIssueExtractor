import tl = require('azure-pipelines-task-lib/task');
import { Pipeline } from "./pipeline";

async function run() {
    try {
        let pipeline = new Pipeline();
        pipeline.banner(`Extracting Jira keys from current build`);
    } catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();