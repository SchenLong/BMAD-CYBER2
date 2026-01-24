export = YamlToMdConverter;
/**
 * YAML to MD Conversion Engine
 * Handles bidirectional conversion between YAML distribution format and MD runtime format
 */
declare class YamlToMdConverter {
    constructor(options?: {});
    options: {
        preserveComments: boolean;
        validateOutput: boolean;
        addMetadata: boolean;
    };
    templates: {
        agent: {
            frontmatter: {};
            contentSections: string[];
            xmlSections: string[];
        };
        workflow: {
            frontmatter: {};
            contentSections: string[];
            requiredFields: string[];
        };
    };
    /**
     * Convert YAML agent to MD format
     * @param {Object|string} yamlAgent - YAML agent data or string
     * @param {Object} options - Conversion options
     * @returns {Promise<Object>} Converted MD agent structure
     */
    yamlToMd(yamlAgent: Object | string, options?: Object): Promise<Object>;
    /**
     * Convert YAML workflow to MD format
     * @param {Object|string} yamlWorkflow - YAML workflow data or string
     * @param {Object} options - Conversion options
     * @returns {Promise<Object>} Converted MD workflow structure
     */
    yamlWorkflowToMd(yamlWorkflow: Object | string, options?: Object): Promise<Object>;
    /**
     * Extract metadata from YAML agent
     */
    extractMetadata(agentData: any): {
        name: any;
        title: any;
        description: any;
        icon: any;
        team: any;
        version: any;
        author: any;
        created_date: any;
        last_updated: any;
        tags: any;
        difficulty: any;
        requires_external_tools: any;
        source_file: any;
    };
    /**
     * Build YAML frontmatter for MD agent
     */
    buildFrontmatter(metadata: any): {
        name: any;
        title: any;
        description: any;
        icon: any;
        team: any;
    };
    /**
     * Build agent content section
     */
    buildAgentContent(agentData: any): string;
    /**
     * Build agent XML block for BMAD runtime
     */
    buildAgentXml(agentData: any): string;
    /**
     * Assemble full MD content
     */
    assembleMdContent(frontmatter: any, content: any, xmlBlock: any): string;
    /**
     * Extract workflow metadata
     */
    extractWorkflowMetadata(workflowData: any): {
        workflow_id: any;
        name: any;
        description: any;
        module: any;
        version: any;
        primary_agent: any;
        parallel_agents: any;
        execution_mode: any;
        estimated_duration: any;
    };
    /**
     * Build workflow frontmatter
     */
    buildWorkflowFrontmatter(metadata: any, workflowData: any): {
        workflow_id: any;
        name: any;
        description: any;
        module: any;
        version: any;
        primary_agent: any;
        execution_mode: any;
        estimated_duration: any;
    };
    /**
     * Build workflow content
     */
    buildWorkflowContent(workflowData: any): string;
    /**
     * Assemble workflow MD content
     */
    assembleWorkflowMdContent(frontmatter: any, content: any): string;
    /**
     * Generate MD filename from metadata
     */
    generateMdFileName(metadata: any): string;
    /**
     * Generate workflow filename from metadata
     */
    generateWorkflowFileName(metadata: any): string;
    /**
     * Validate YAML agent structure
     */
    validateYamlAgent(agentData: any): void;
    /**
     * Validate YAML workflow structure
     */
    validateYamlWorkflow(workflowData: any): void;
    /**
     * Validate MD output
     */
    validateMdOutput(mdAgent: any): void;
    /**
     * Validate workflow MD output
     */
    validateWorkflowMdOutput(mdWorkflow: any): void;
    /**
     * Escape XML special characters
     */
    escapeXml(text: any): any;
    /**
     * Get agent template (placeholder for future enhancement)
     */
    getAgentTemplate(): {
        frontmatter: {};
        contentSections: string[];
        xmlSections: string[];
    };
    /**
     * Get workflow template (placeholder for future enhancement)
     */
    getWorkflowTemplate(): {
        frontmatter: {};
        contentSections: string[];
        requiredFields: string[];
    };
    /**
     * Convert batch of YAML agents
     * @param {Array} yamlAgents - Array of YAML agents
     * @param {Object} options - Conversion options
     * @returns {Promise<Array>} Array of converted MD agents
     */
    convertAgentBatch(yamlAgents: any[], options?: Object): Promise<any[]>;
    /**
     * Convert batch of YAML workflows
     * @param {Array} yamlWorkflows - Array of YAML workflows
     * @param {Object} options - Conversion options
     * @returns {Promise<Array>} Array of converted MD workflows
     */
    convertWorkflowBatch(yamlWorkflows: any[], options?: Object): Promise<any[]>;
}
//# sourceMappingURL=yaml-to-md-converter.d.ts.map