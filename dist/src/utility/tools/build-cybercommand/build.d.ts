#!/usr/bin/env node
export = MultiModuleBuilder;
declare class MultiModuleBuilder {
    packageRoot: string;
    distPath: string;
    config: any;
    loadConfig(): any;
    build(): Promise<void>;
    buildTeamModule(teamName: any): Promise<void>;
    convertAgentToYaml(content: any, filename: any): {
        id: any;
        name: any;
        team: string;
        description: string;
        specialization: any;
        capabilities: any[];
        source_format: string;
        source_path: string;
        converted_at: string;
    };
    convertWorkflowToYaml(content: any, workflowId: any): {
        id: any;
        name: any;
        description: string;
        steps: {
            order: number;
            title: any;
            description: string;
        }[];
        source_format: string;
        source_path: string;
        converted_at: string;
    };
    extractTitle(content: any): any;
    extractDescription(content: any): string;
    extractTeam(content: any): "unknown" | "cybersec-team" | "intel-team" | "legal-team" | "strategy-team";
    extractSpecialization(content: any): any;
    extractCapabilities(content: any): any[];
    extractSteps(content: any): {
        order: number;
        title: any;
        description: string;
    }[];
    generateMetadata(): Promise<void>;
    createManifest(): Promise<void>;
}
//# sourceMappingURL=build.d.ts.map