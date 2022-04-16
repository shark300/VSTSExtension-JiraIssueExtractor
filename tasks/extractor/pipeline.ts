import * as vm from "azure-devops-node-api";
import * as lim from "azure-devops-node-api/interfaces/LocationsInterfaces";

export class Pipeline {

    getEnv(name: string): string {
        let val = process.env[name];
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
        return new Promise<vm.WebApi>(async (resolve, reject) => {
            try {
                let token = this.getEnv("SYSTEM_ACCESSTOKEN");
                let authHandler = vm.getPersonalAccessTokenHandler(token);
                let option = undefined;

                let vsts: vm.WebApi = new vm.WebApi(serverUrl, authHandler, option);
                let connData: lim.ConnectionData = await vsts.connect();
                console.log(`Hello ${connData.authenticatedUser?.providerDisplayName}`);
                resolve(vsts);
            } catch (err) {
                reject(err);
            }
        });
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

