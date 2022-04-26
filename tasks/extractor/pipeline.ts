import * as vm from "azure-devops-node-api";
import * as lim from "azure-devops-node-api/interfaces/LocationsInterfaces";

export class Pipeline {

    getEnv(name: string): string {
        const val = process.env[name];
        if (!val) {
            console.error(`${name} env var not set`);
            process.exit(1);
        }
        return val;
    }

    async getWebApi(serverUrl?: string): Promise<vm.WebApi> {
        serverUrl = serverUrl || this.getEnv("SYSTEM_TEAMFOUNDATIONCOLLECTIONURI");
        return await this.getApi(serverUrl);
    }

    async getApi(serverUrl: string): Promise<vm.WebApi> {
            const token = this.getEnv("SYSTEM_ACCESSTOKEN");
            const authHandler = vm.getPersonalAccessTokenHandler(token);
            const option = undefined;

            const vsts: vm.WebApi = new vm.WebApi(serverUrl, authHandler, option);
            const connData: lim.ConnectionData = await vsts.connect();
            console.log(`Hello ${connData.authenticatedUser?.providerDisplayName}`);
            return vsts;
    }

    getProject(): string {
        return this.getEnv("SYSTEM_TEAMPROJECT");
    }

    getBuildId(): number {
        return parseInt(this.getEnv("BUILD_BUILDID"));
    }

    banner(title: string): void {
        console.log("=======================================");
        console.log(`\t${title}`);
        console.log("=======================================");
    }

    heading(title: string): void {
        console.log();
        console.log(`> ${title}`);
    }
}

