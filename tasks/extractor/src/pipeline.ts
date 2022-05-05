import * as vm from "azure-devops-node-api";
import * as lim from "azure-devops-node-api/interfaces/LocationsInterfaces";
import * as winston from "winston";

export class Pipeline {
  constructor(public logger: winston.Logger) {}

  getEnv(name: string): string {
    const val = process.env[name];
    if (!val) {
      this.logger.error("%s env var not set", name);
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
    this.logger.info(
      "Welcome to %s",
      connData.authenticatedUser?.providerDisplayName
    );
    return vsts;
  }

  getProject(): string {
    return this.getEnv("SYSTEM_TEAMPROJECT");
  }

  getBuildId(): number {
    return parseInt(this.getEnv("BUILD_BUILDID"));
  }
}
