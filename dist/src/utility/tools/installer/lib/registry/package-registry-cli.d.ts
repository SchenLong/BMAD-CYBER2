export = PackageRegistryCLI;
declare class PackageRegistryCLI {
    program: Command;
    registry: any;
    createLogger(): {
        info: (category: any, message: any, metadata: any) => void;
        warn: (category: any, message: any, metadata: any) => void;
        error: (category: any, message: any, metadata: any) => void;
        debug: (category: any, message: any, metadata: any) => void;
    };
    setupCommands(): void;
    createHealthCommands(): Command;
    createUpdateCommands(): Command;
    createBackupCommands(): Command;
    handleInit(): Promise<void>;
    handleList(options: any): Promise<void>;
    handleShow(packageId: any): Promise<void>;
    handleHealthCheck(options: any): Promise<void>;
    handleUpdateCheck(): Promise<void>;
    handleUninstall(packageId: any, options: any): Promise<void>;
    handleStats(): Promise<void>;
    handleInteractive(): Promise<void>;
    interactiveShowPackage(): Promise<void>;
    formatStatus(status: any): any;
    formatHealth(health: any): any;
    formatSeverity(severity: any): any;
    formatBytes(bytes: any): string;
    displayHealthResult(packageName: any, result: any): void;
    run(): Promise<void>;
}
import { Command } from "commander";
//# sourceMappingURL=package-registry-cli.d.ts.map