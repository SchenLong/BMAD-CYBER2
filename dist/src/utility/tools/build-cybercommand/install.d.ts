#!/usr/bin/env node
export = MultiModuleInstaller;
declare class MultiModuleInstaller {
    projectRoot: string;
    packageRoot: string;
    config: any;
    loadConfig(): any;
    install(): Promise<void>;
    validateEnvironment(): Promise<void>;
    createOutputDirectories(): Promise<void>;
    installTeamModule(teamName: any): Promise<void>;
    setupCoordination(): Promise<void>;
    verifyInstallation(): Promise<void>;
}
//# sourceMappingURL=install.d.ts.map