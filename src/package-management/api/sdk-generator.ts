/**
 * EPIC 2 STORY 2.7 - SDK GENERATOR
 * Multi-language SDK generation system for BMAD Package Registry API
 * Generates client SDKs for TypeScript, JavaScript, Python, and Go
 *
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 * @classification PRODUCTION-READY
 * @epic Epic 2 - Story 2.7
 */

import * as fs from 'fs';
import * as path from 'path';
import { APIConfig } from './package-registry-api';

/**
 * SDK Configuration Interface
 */
export interface SDKConfig {
  apiBaseUrl: string;
  version: string;
  packageName: string;
  outputDir: string;
  languages: SDKLanguage[];
  includeAuth: boolean;
  includeTypes: boolean;
  includeExamples: boolean;
}

export type SDKLanguage = 'typescript' | 'javascript' | 'python' | 'go' | 'java' | 'csharp';

export interface GeneratedSDK {
  language: SDKLanguage;
  files: SDKFile[];
  packageInfo: {
    name: string;
    version: string;
    size: number;
    dependencies: string[];
  };
}

export interface SDKFile {
  path: string;
  content: string;
  type: 'source' | 'config' | 'example' | 'documentation';
}

/**
 * Multi-Language SDK Generator
 */
export class SDKGenerator {
  private config: SDKConfig;
  private apiSpec: any;

  constructor(config: SDKConfig, apiSpec?: any) {
    this.config = config;
    this.apiSpec = apiSpec || this.generateDefaultAPISpec();
  }

  /**
   * Generate SDKs for all configured languages
   */
  public async generateAll(): Promise<GeneratedSDK[]> {
    console.log('🔨 Generating SDKs for all languages...');

    const sdks: GeneratedSDK[] = [];

    for (const language of this.config.languages) {
      try {
        const sdk = await this.generateSDK(language);
        sdks.push(sdk);
        console.log(`✅ ${language} SDK generated successfully`);
      } catch (error) {
        console.error(`❌ Failed to generate ${language} SDK:`, error);
        throw error;
      }
    }

    // Generate cross-language documentation
    await this.generateDocumentation(sdks);

    console.log('✅ All SDKs generated successfully');
    return sdks;
  }

  /**
   * Generate SDK for specific language
   */
  public async generateSDK(language: SDKLanguage): Promise<GeneratedSDK> {
    switch (language) {
      case 'typescript':
        return this.generateTypeScriptSDK();
      case 'javascript':
        return this.generateJavaScriptSDK();
      case 'python':
        return this.generatePythonSDK();
      case 'go':
        return this.generateGoSDK();
      case 'java':
        return this.generateJavaSDK();
      case 'csharp':
        return this.generateCSharpSDK();
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
  }

  /**
   * Generate TypeScript SDK
   */
  private async generateTypeScriptSDK(): Promise<GeneratedSDK> {
    const files: SDKFile[] = [];

    // Main client file
    files.push({
      path: 'src/client.ts',
      type: 'source',
      content: this.generateTypeScriptClient()
    });

    // Type definitions
    if (this.config.includeTypes) {
      files.push({
        path: 'src/types.ts',
        type: 'source',
        content: this.generateTypeScriptTypes()
      });
    }

    // Authentication module
    if (this.config.includeAuth) {
      files.push({
        path: 'src/auth.ts',
        type: 'source',
        content: this.generateTypeScriptAuth()
      });
    }

    // Package configuration
    files.push({
      path: 'package.json',
      type: 'config',
      content: this.generateTypeScriptPackageJson()
    });

    files.push({
      path: 'tsconfig.json',
      type: 'config',
      content: this.generateTsConfig()
    });

    // Example usage
    if (this.config.includeExamples) {
      files.push({
        path: 'examples/basic-usage.ts',
        type: 'example',
        content: this.generateTypeScriptExample()
      });
    }

    // README
    files.push({
      path: 'README.md',
      type: 'documentation',
      content: this.generateTypeScriptReadme()
    });

    return {
      language: 'typescript',
      files,
      packageInfo: {
        name: `${this.config.packageName}-ts`,
        version: this.config.version,
        size: files.reduce((acc, file) => acc + file.content.length, 0),
        dependencies: ['axios', '@types/node']
      }
    };
  }

  /**
   * Generate JavaScript SDK
   */
  private async generateJavaScriptSDK(): Promise<GeneratedSDK> {
    const files: SDKFile[] = [];

    // Main client file
    files.push({
      path: 'src/client.js',
      type: 'source',
      content: this.generateJavaScriptClient()
    });

    // Authentication module
    if (this.config.includeAuth) {
      files.push({
        path: 'src/auth.js',
        type: 'source',
        content: this.generateJavaScriptAuth()
      });
    }

    // Package configuration
    files.push({
      path: 'package.json',
      type: 'config',
      content: this.generateJavaScriptPackageJson()
    });

    // Type definitions for JS users
    if (this.config.includeTypes) {
      files.push({
        path: 'types/index.d.ts',
        type: 'source',
        content: this.generateJavaScriptTypes()
      });
    }

    // Example usage
    if (this.config.includeExamples) {
      files.push({
        path: 'examples/basic-usage.js',
        type: 'example',
        content: this.generateJavaScriptExample()
      });
    }

    // README
    files.push({
      path: 'README.md',
      type: 'documentation',
      content: this.generateJavaScriptReadme()
    });

    return {
      language: 'javascript',
      files,
      packageInfo: {
        name: `${this.config.packageName}-js`,
        version: this.config.version,
        size: files.reduce((acc, file) => acc + file.content.length, 0),
        dependencies: ['axios']
      }
    };
  }

  /**
   * Generate Python SDK
   */
  private async generatePythonSDK(): Promise<GeneratedSDK> {
    const files: SDKFile[] = [];

    // Main client file
    files.push({
      path: 'bmad_packages/__init__.py',
      type: 'source',
      content: this.generatePythonInit()
    });

    files.push({
      path: 'bmad_packages/client.py',
      type: 'source',
      content: this.generatePythonClient()
    });

    // Type hints
    if (this.config.includeTypes) {
      files.push({
        path: 'bmad_packages/types.py',
        type: 'source',
        content: this.generatePythonTypes()
      });
    }

    // Authentication module
    if (this.config.includeAuth) {
      files.push({
        path: 'bmad_packages/auth.py',
        type: 'source',
        content: this.generatePythonAuth()
      });
    }

    // Package configuration
    files.push({
      path: 'setup.py',
      type: 'config',
      content: this.generatePythonSetup()
    });

    files.push({
      path: 'requirements.txt',
      type: 'config',
      content: 'requests>=2.25.0\ntyping-extensions>=3.7.4'
    });

    // Example usage
    if (this.config.includeExamples) {
      files.push({
        path: 'examples/basic_usage.py',
        type: 'example',
        content: this.generatePythonExample()
      });
    }

    // README
    files.push({
      path: 'README.md',
      type: 'documentation',
      content: this.generatePythonReadme()
    });

    return {
      language: 'python',
      files,
      packageInfo: {
        name: `${this.config.packageName.replace(/-/g, '_')}_python`,
        version: this.config.version,
        size: files.reduce((acc, file) => acc + file.content.length, 0),
        dependencies: ['requests', 'typing-extensions']
      }
    };
  }

  /**
   * Generate Go SDK
   */
  private async generateGoSDK(): Promise<GeneratedSDK> {
    const files: SDKFile[] = [];

    // Main client file
    files.push({
      path: 'client.go',
      type: 'source',
      content: this.generateGoClient()
    });

    // Types
    if (this.config.includeTypes) {
      files.push({
        path: 'types.go',
        type: 'source',
        content: this.generateGoTypes()
      });
    }

    // Authentication
    if (this.config.includeAuth) {
      files.push({
        path: 'auth.go',
        type: 'source',
        content: this.generateGoAuth()
      });
    }

    // Go module
    files.push({
      path: 'go.mod',
      type: 'config',
      content: this.generateGoMod()
    });

    // Example usage
    if (this.config.includeExamples) {
      files.push({
        path: 'examples/basic_usage.go',
        type: 'example',
        content: this.generateGoExample()
      });
    }

    // README
    files.push({
      path: 'README.md',
      type: 'documentation',
      content: this.generateGoReadme()
    });

    return {
      language: 'go',
      files,
      packageInfo: {
        name: `${this.config.packageName}-go`,
        version: this.config.version,
        size: files.reduce((acc, file) => acc + file.content.length, 0),
        dependencies: ['net/http', 'encoding/json']
      }
    };
  }

  /**
   * Generate Java SDK
   */
  private async generateJavaSDK(): Promise<GeneratedSDK> {
    const files: SDKFile[] = [];

    // Main client file
    files.push({
      path: 'src/main/java/com/bmad/packages/PackageClient.java',
      type: 'source',
      content: this.generateJavaClient()
    });

    // Types
    if (this.config.includeTypes) {
      files.push({
        path: 'src/main/java/com/bmad/packages/types/Package.java',
        type: 'source',
        content: this.generateJavaTypes()
      });
    }

    // Authentication
    if (this.config.includeAuth) {
      files.push({
        path: 'src/main/java/com/bmad/packages/auth/AuthManager.java',
        type: 'source',
        content: this.generateJavaAuth()
      });
    }

    // Maven configuration
    files.push({
      path: 'pom.xml',
      type: 'config',
      content: this.generateJavaPom()
    });

    // Example usage
    if (this.config.includeExamples) {
      files.push({
        path: 'src/examples/java/BasicUsage.java',
        type: 'example',
        content: this.generateJavaExample()
      });
    }

    // README
    files.push({
      path: 'README.md',
      type: 'documentation',
      content: this.generateJavaReadme()
    });

    return {
      language: 'java',
      files,
      packageInfo: {
        name: `${this.config.packageName}-java`,
        version: this.config.version,
        size: files.reduce((acc, file) => acc + file.content.length, 0),
        dependencies: ['okhttp', 'gson']
      }
    };
  }

  /**
   * Generate C# SDK
   */
  private async generateCSharpSDK(): Promise<GeneratedSDK> {
    const files: SDKFile[] = [];

    // Main client file
    files.push({
      path: 'BmadPackages/PackageClient.cs',
      type: 'source',
      content: this.generateCSharpClient()
    });

    // Types
    if (this.config.includeTypes) {
      files.push({
        path: 'BmadPackages/Types/Package.cs',
        type: 'source',
        content: this.generateCSharpTypes()
      });
    }

    // Authentication
    if (this.config.includeAuth) {
      files.push({
        path: 'BmadPackages/Auth/AuthManager.cs',
        type: 'source',
        content: this.generateCSharpAuth()
      });
    }

    // Project file
    files.push({
      path: 'BmadPackages.csproj',
      type: 'config',
      content: this.generateCSharpProject()
    });

    // Example usage
    if (this.config.includeExamples) {
      files.push({
        path: 'Examples/BasicUsage.cs',
        type: 'example',
        content: this.generateCSharpExample()
      });
    }

    // README
    files.push({
      path: 'README.md',
      type: 'documentation',
      content: this.generateCSharpReadme()
    });

    return {
      language: 'csharp',
      files,
      packageInfo: {
        name: `${this.config.packageName}-csharp`,
        version: this.config.version,
        size: files.reduce((acc, file) => acc + file.content.length, 0),
        dependencies: ['Newtonsoft.Json', 'System.Net.Http']
      }
    };
  }

  /**
   * Write SDK files to disk
   */
  public async writeSDKToDisk(sdk: GeneratedSDK): Promise<string> {
    const outputPath = path.join(this.config.outputDir, sdk.language);

    // Create output directory
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    // Write all files
    for (const file of sdk.files) {
      const filePath = path.join(outputPath, file.path);
      const fileDir = path.dirname(filePath);

      if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir, { recursive: true });
      }

      fs.writeFileSync(filePath, file.content, 'utf8');
    }

    console.log(`📁 ${sdk.language} SDK written to: ${outputPath}`);
    return outputPath;
  }

  // TypeScript SDK Generation Methods

  private generateTypeScriptClient(): string {
    return `/**
 * BMAD Package Registry TypeScript SDK
 * Generated SDK for BMAD Package Management API
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { AuthManager } from './auth';
import {
  PackageInfo,
  PackageQuery,
  PackageSearchResult,
  DependencyGraph,
  AnalyticsEvent,
  ApiResponse
} from './types';

export interface ClientConfig {
  baseUrl: string;
  apiVersion?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export class PackageRegistryClient {
  private http: AxiosInstance;
  private auth: AuthManager;
  private baseUrl: string;

  constructor(config: ClientConfig) {
    this.baseUrl = config.baseUrl;
    this.auth = new AuthManager(config);

    this.http = axios.create({
      baseURL: \`\${config.baseUrl}\${config.apiVersion || '/api/v1'}\`,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      }
    });

    // Add auth interceptor
    this.http.interceptors.request.use(
      (config) => this.auth.addAuthHeaders(config)
    );
  }

  /**
   * Search for packages
   */
  async searchPackages(query: PackageQuery): Promise<PackageSearchResult> {
    const response = await this.http.post<ApiResponse<PackageSearchResult>>('/discovery/search', query);
    return response.data.data!;
  }

  /**
   * Get package details
   */
  async getPackage(packageId: string): Promise<PackageInfo> {
    const response = await this.http.get<ApiResponse<PackageInfo>>(\`/packages/\${packageId}\`);
    return response.data.data!;
  }

  /**
   * Install a package
   */
  async installPackage(packageId: string, version?: string): Promise<any> {
    const response = await this.http.post<ApiResponse<any>>(\`/packages/\${packageId}/install\`, { version });
    return response.data.data!;
  }

  /**
   * Get dependency graph
   */
  async getDependencyGraph(packageId: string, depth?: number): Promise<DependencyGraph> {
    const response = await this.http.get<ApiResponse<DependencyGraph>>(\`/dependencies/graph/\${packageId}\`, {
      params: { depth }
    });
    return response.data.data!;
  }

  /**
   * Record analytics event
   */
  async recordEvent(event: AnalyticsEvent): Promise<void> {
    await this.http.post('/analytics/events', event);
  }

  /**
   * Get package recommendations
   */
  async getRecommendations(packageId: string, limit?: number): Promise<PackageInfo[]> {
    const response = await this.http.get<ApiResponse<PackageInfo[]>>(\`/discovery/recommendations/\${packageId}\`, {
      params: { limit }
    });
    return response.data.data!;
  }

  /**
   * Authenticate with API
   */
  async authenticate(token: string): Promise<void> {
    this.auth.setToken(token);
  }
}

export default PackageRegistryClient;`;
  }

  private generateTypeScriptTypes(): string {
    return `/**
 * BMAD Package Registry TypeScript Types
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    version: string;
    requestId: string;
    pagination?: PaginationMeta;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PackageInfo {
  id: string;
  name: string;
  version: string;
  description?: string;
  author: string;
  tags: string[];
  category: string;
  license: string;
  repository?: string;
  homepage?: string;
  downloadUrl: string;
  publishedAt: string;
  updatedAt: string;
  dependencies: PackageDependency[];
  stats: PackageStats;
}

export interface PackageDependency {
  name: string;
  version: string;
  type: 'runtime' | 'development' | 'peer' | 'optional';
  optional: boolean;
}

export interface PackageStats {
  downloadCount: number;
  installCount: number;
  popularityScore: number;
  dependentCount: number;
}

export interface PackageQuery {
  terms?: string[];
  filters: QueryFilter[];
  sorting: SortCriteria[];
  pagination: PaginationOptions;
  faceting?: FacetingOptions;
}

export interface QueryFilter {
  field: string;
  operator: string;
  value: any;
}

export interface SortCriteria {
  field: string;
  direction: 'asc' | 'desc';
  priority: number;
}

export interface PaginationOptions {
  offset: number;
  limit: number;
  cursor?: string;
}

export interface FacetingOptions {
  enabled: boolean;
  fields: string[];
  maxValues: number;
  minCount: number;
}

export interface PackageSearchResult {
  packages: PackageInfo[];
  pagination: PaginationMeta;
  facets?: Record<string, FacetValue[]>;
  total: number;
}

export interface FacetValue {
  value: string;
  count: number;
}

export interface DependencyGraph {
  root: string;
  nodes: DependencyNode[];
  edges: DependencyEdge[];
  resolved: boolean;
  conflicts: DependencyConflict[];
}

export interface DependencyNode {
  id: string;
  package: PackageInfo;
  level: number;
  resolved: boolean;
}

export interface DependencyEdge {
  from: string;
  to: string;
  type: string;
  version: string;
}

export interface DependencyConflict {
  package: string;
  conflictingVersions: string[];
  severity: 'warning' | 'error' | 'fatal';
}

export interface AnalyticsEvent {
  type: string;
  timestamp: string;
  packageId?: string;
  version?: string;
  userId?: string;
  sessionId: string;
  metadata?: Record<string, any>;
}`;
  }

  private generateTypeScriptAuth(): string {
    return `/**
 * BMAD Package Registry Authentication
 */

import { AxiosRequestConfig } from 'axios';

export interface AuthConfig {
  baseUrl: string;
  apiVersion?: string;
}

export class AuthManager {
  private token: string | null = null;
  private config: AuthConfig;

  constructor(config: AuthConfig) {
    this.config = config;
  }

  setToken(token: string): void {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken(): void {
    this.token = null;
  }

  addAuthHeaders(config: AxiosRequestConfig): AxiosRequestConfig {
    if (this.token) {
      config.headers = {
        ...config.headers,
        Authorization: \`Bearer \${this.token}\`
      };
    }
    return config;
  }

  isAuthenticated(): boolean {
    return this.token !== null;
  }
}`;
  }

  private generateTypeScriptPackageJson(): string {
    return JSON.stringify({
      name: `${this.config.packageName}-typescript`,
      version: this.config.version,
      description: 'TypeScript SDK for BMAD Package Registry API',
      main: 'dist/index.js',
      types: 'dist/index.d.ts',
      scripts: {
        build: 'tsc',
        test: 'jest',
        prepublishOnly: 'npm run build'
      },
      dependencies: {
        axios: '^0.27.0'
      },
      devDependencies: {
        typescript: '^4.7.0',
        '@types/node': '^18.0.0',
        jest: '^28.0.0',
        '@types/jest': '^28.0.0'
      },
      files: ['dist/**/*'],
      repository: {
        type: 'git',
        url: 'https://github.com/bmad/package-registry-sdk-typescript'
      },
      keywords: ['bmad', 'packages', 'sdk', 'typescript'],
      license: 'MIT'
    }, null, 2);
  }

  private generateTsConfig(): string {
    return JSON.stringify({
      compilerOptions: {
        target: 'es2018',
        module: 'commonjs',
        lib: ['es2018'],
        outDir: './dist',
        rootDir: './src',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        declaration: true,
        declarationMap: true,
        sourceMap: true
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist', '**/*.test.ts']
    }, null, 2);
  }

  private generateTypeScriptExample(): string {
    return `/**
 * BMAD Package Registry TypeScript SDK Example
 */

import { PackageRegistryClient } from '../src/client';

async function main() {
  // Initialize client
  const client = new PackageRegistryClient({
    baseUrl: '${this.config.apiBaseUrl}',
    timeout: 30000
  });

  try {
    // Search for packages
    const searchResult = await client.searchPackages({
      terms: ['security'],
      filters: [],
      sorting: [{ field: 'popularity', direction: 'desc', priority: 1 }],
      pagination: { offset: 0, limit: 10 }
    });

    console.log('Found packages:', searchResult.packages.length);

    // Get first package details
    if (searchResult.packages.length > 0) {
      const pkg = await client.getPackage(searchResult.packages[0].id);
      console.log('Package details:', pkg);

      // Get recommendations
      const recommendations = await client.getRecommendations(pkg.id, 5);
      console.log('Recommendations:', recommendations);

      // Get dependency graph
      const graph = await client.getDependencyGraph(pkg.id, 3);
      console.log('Dependencies:', graph.nodes.length);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error);`;
  }

  private generateTypeScriptReadme(): string {
    return `# BMAD Package Registry TypeScript SDK

Official TypeScript/JavaScript SDK for the BMAD Package Registry API.

## Installation

\`\`\`bash
npm install ${this.config.packageName}-typescript
\`\`\`

## Quick Start

\`\`\`typescript
import { PackageRegistryClient } from '${this.config.packageName}-typescript';

const client = new PackageRegistryClient({
  baseUrl: '${this.config.apiBaseUrl}'
});

// Search for packages
const results = await client.searchPackages({
  terms: ['security'],
  filters: [],
  sorting: [{ field: 'popularity', direction: 'desc', priority: 1 }],
  pagination: { offset: 0, limit: 10 }
});

console.log(results.packages);
\`\`\`

## Authentication

\`\`\`typescript
// Set authentication token
await client.authenticate('your-api-token');
\`\`\`

## API Reference

### Search Packages
\`\`\`typescript
await client.searchPackages(query)
\`\`\`

### Get Package Details
\`\`\`typescript
await client.getPackage(packageId)
\`\`\`

### Install Package
\`\`\`typescript
await client.installPackage(packageId, version)
\`\`\`

### Get Recommendations
\`\`\`typescript
await client.getRecommendations(packageId, limit)
\`\`\`

### Get Dependency Graph
\`\`\`typescript
await client.getDependencyGraph(packageId, depth)
\`\`\`

## License

MIT License - see LICENSE file for details.
`;
  }

  // JavaScript SDK Generation Methods (similar structure)

  private generateJavaScriptClient(): string {
    return `/**
 * BMAD Package Registry JavaScript SDK
 */

const axios = require('axios');
const { AuthManager } = require('./auth');

class PackageRegistryClient {
  constructor(config) {
    this.baseUrl = config.baseUrl;
    this.auth = new AuthManager(config);

    this.http = axios.create({
      baseURL: \`\${config.baseUrl}\${config.apiVersion || '/api/v1'}\`,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      }
    });

    // Add auth interceptor
    this.http.interceptors.request.use(
      (config) => this.auth.addAuthHeaders(config)
    );
  }

  async searchPackages(query) {
    const response = await this.http.post('/discovery/search', query);
    return response.data.data;
  }

  async getPackage(packageId) {
    const response = await this.http.get(\`/packages/\${packageId}\`);
    return response.data.data;
  }

  async installPackage(packageId, version) {
    const response = await this.http.post(\`/packages/\${packageId}/install\`, { version });
    return response.data.data;
  }

  async getDependencyGraph(packageId, depth) {
    const response = await this.http.get(\`/dependencies/graph/\${packageId}\`, {
      params: { depth }
    });
    return response.data.data;
  }

  async recordEvent(event) {
    await this.http.post('/analytics/events', event);
  }

  async getRecommendations(packageId, limit) {
    const response = await this.http.get(\`/discovery/recommendations/\${packageId}\`, {
      params: { limit }
    });
    return response.data.data;
  }

  async authenticate(token) {
    this.auth.setToken(token);
  }
}

module.exports = { PackageRegistryClient };`;
  }

  private generateJavaScriptAuth(): string {
    return `/**
 * BMAD Package Registry Authentication
 */

class AuthManager {
  constructor(config) {
    this.token = null;
    this.config = config;
  }

  setToken(token) {
    this.token = token;
  }

  getToken() {
    return this.token;
  }

  clearToken() {
    this.token = null;
  }

  addAuthHeaders(config) {
    if (this.token) {
      config.headers = {
        ...config.headers,
        Authorization: \`Bearer \${this.token}\`
      };
    }
    return config;
  }

  isAuthenticated() {
    return this.token !== null;
  }
}

module.exports = { AuthManager };`;
  }

  private generateJavaScriptPackageJson(): string {
    return JSON.stringify({
      name: `${this.config.packageName}-javascript`,
      version: this.config.version,
      description: 'JavaScript SDK for BMAD Package Registry API',
      main: 'src/client.js',
      scripts: {
        test: 'jest'
      },
      dependencies: {
        axios: '^0.27.0'
      },
      devDependencies: {
        jest: '^28.0.0'
      },
      repository: {
        type: 'git',
        url: 'https://github.com/bmad/package-registry-sdk-javascript'
      },
      keywords: ['bmad', 'packages', 'sdk', 'javascript'],
      license: 'MIT'
    }, null, 2);
  }

  private generateJavaScriptTypes(): string {
    return `// Type definitions for BMAD Package Registry JavaScript SDK

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PackageInfo {
  id: string;
  name: string;
  version: string;
  description?: string;
  author: string;
  tags: string[];
  category: string;
  license: string;
}

export interface PackageQuery {
  terms?: string[];
  filters: any[];
  sorting: any[];
  pagination: {
    offset: number;
    limit: number;
  };
}

export class PackageRegistryClient {
  constructor(config: { baseUrl: string; apiVersion?: string; timeout?: number });
  searchPackages(query: PackageQuery): Promise<any>;
  getPackage(packageId: string): Promise<PackageInfo>;
  authenticate(token: string): Promise<void>;
}`;
  }

  private generateJavaScriptExample(): string {
    return `/**
 * BMAD Package Registry JavaScript SDK Example
 */

const { PackageRegistryClient } = require('../src/client');

async function main() {
  // Initialize client
  const client = new PackageRegistryClient({
    baseUrl: '${this.config.apiBaseUrl}',
    timeout: 30000
  });

  try {
    // Search for packages
    const searchResult = await client.searchPackages({
      terms: ['security'],
      filters: [],
      sorting: [{ field: 'popularity', direction: 'desc', priority: 1 }],
      pagination: { offset: 0, limit: 10 }
    });

    console.log('Found packages:', searchResult.packages.length);

    // Get first package details
    if (searchResult.packages.length > 0) {
      const pkg = await client.getPackage(searchResult.packages[0].id);
      console.log('Package details:', pkg);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error);`;
  }

  private generateJavaScriptReadme(): string {
    return `# BMAD Package Registry JavaScript SDK

Official JavaScript SDK for the BMAD Package Registry API.

## Installation

\`\`\`bash
npm install ${this.config.packageName}-javascript
\`\`\`

## Quick Start

\`\`\`javascript
const { PackageRegistryClient } = require('${this.config.packageName}-javascript');

const client = new PackageRegistryClient({
  baseUrl: '${this.config.apiBaseUrl}'
});

// Search for packages
const results = await client.searchPackages({
  terms: ['security'],
  filters: [],
  sorting: [{ field: 'popularity', direction: 'desc', priority: 1 }],
  pagination: { offset: 0, limit: 10 }
});

console.log(results.packages);
\`\`\`

## License

MIT License`;
  }

  // Python SDK Generation Methods

  private generatePythonInit(): string {
    return `"""
BMAD Package Registry Python SDK
"""

from .client import PackageRegistryClient
from .types import PackageInfo, PackageQuery, ApiResponse

__version__ = "${this.config.version}"
__all__ = ["PackageRegistryClient", "PackageInfo", "PackageQuery", "ApiResponse"]`;
  }

  private generatePythonClient(): string {
    return `"""
BMAD Package Registry Python Client
"""

import requests
from typing import Optional, Dict, Any, List
from .types import PackageInfo, PackageQuery, ApiResponse, DependencyGraph
from .auth import AuthManager


class PackageRegistryClient:
    def __init__(self, config: Dict[str, Any]):
        self.base_url = config["base_url"]
        self.api_version = config.get("api_version", "/api/v1")
        self.timeout = config.get("timeout", 30)
        self.auth = AuthManager(config)

        self.session = requests.Session()
        self.session.headers.update({
            "Content-Type": "application/json",
            **config.get("headers", {})
        })

    def _make_request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        """Make HTTP request with authentication"""
        url = f"{self.base_url}{self.api_version}{endpoint}"

        # Add auth headers
        headers = self.auth.get_auth_headers()
        if headers:
            kwargs.setdefault("headers", {}).update(headers)

        response = self.session.request(
            method, url, timeout=self.timeout, **kwargs
        )
        response.raise_for_status()
        return response.json()

    def search_packages(self, query: PackageQuery) -> Dict[str, Any]:
        """Search for packages"""
        return self._make_request("POST", "/discovery/search", json=query)["data"]

    def get_package(self, package_id: str) -> PackageInfo:
        """Get package details"""
        return self._make_request("GET", f"/packages/{package_id}")["data"]

    def install_package(self, package_id: str, version: Optional[str] = None) -> Dict[str, Any]:
        """Install a package"""
        data = {"version": version} if version else {}
        return self._make_request("POST", f"/packages/{package_id}/install", json=data)["data"]

    def get_dependency_graph(self, package_id: str, depth: Optional[int] = None) -> DependencyGraph:
        """Get dependency graph"""
        params = {"depth": depth} if depth else {}
        return self._make_request("GET", f"/dependencies/graph/{package_id}", params=params)["data"]

    def record_event(self, event: Dict[str, Any]) -> None:
        """Record analytics event"""
        self._make_request("POST", "/analytics/events", json=event)

    def get_recommendations(self, package_id: str, limit: Optional[int] = None) -> List[PackageInfo]:
        """Get package recommendations"""
        params = {"limit": limit} if limit else {}
        return self._make_request("GET", f"/discovery/recommendations/{package_id}", params=params)["data"]

    def authenticate(self, token: str) -> None:
        """Set authentication token"""
        self.auth.set_token(token)`;
  }

  private generatePythonTypes(): string {
    return `"""
BMAD Package Registry Python Types
"""

from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime


@dataclass
class ApiResponse:
    success: bool
    data: Optional[Any] = None
    error: Optional[Dict[str, Any]] = None
    meta: Optional[Dict[str, Any]] = None


@dataclass
class PackageInfo:
    id: str
    name: str
    version: str
    author: str
    tags: List[str]
    category: str
    license: str
    description: Optional[str] = None
    repository: Optional[str] = None
    homepage: Optional[str] = None
    download_url: Optional[str] = None
    published_at: Optional[str] = None
    updated_at: Optional[str] = None


@dataclass
class PackageDependency:
    name: str
    version: str
    type: str
    optional: bool = False


@dataclass
class PackageQuery:
    terms: Optional[List[str]] = None
    filters: List[Dict[str, Any]] = None
    sorting: List[Dict[str, Any]] = None
    pagination: Dict[str, int] = None
    faceting: Optional[Dict[str, Any]] = None

    def __post_init__(self):
        if self.filters is None:
            self.filters = []
        if self.sorting is None:
            self.sorting = []
        if self.pagination is None:
            self.pagination = {"offset": 0, "limit": 10}


@dataclass
class DependencyNode:
    id: str
    package: PackageInfo
    level: int
    resolved: bool


@dataclass
class DependencyEdge:
    from_node: str
    to_node: str
    type: str
    version: str


@dataclass
class DependencyGraph:
    root: str
    nodes: List[DependencyNode]
    edges: List[DependencyEdge]
    resolved: bool
    conflicts: List[Dict[str, Any]] = None

    def __post_init__(self):
        if self.conflicts is None:
            self.conflicts = []`;
  }

  private generatePythonAuth(): string {
    return `"""
BMAD Package Registry Python Authentication
"""

from typing import Optional, Dict, Any


class AuthManager:
    def __init__(self, config: Dict[str, Any]):
        self.token: Optional[str] = None
        self.config = config

    def set_token(self, token: str) -> None:
        """Set authentication token"""
        self.token = token

    def get_token(self) -> Optional[str]:
        """Get current authentication token"""
        return self.token

    def clear_token(self) -> None:
        """Clear authentication token"""
        self.token = None

    def get_auth_headers(self) -> Dict[str, str]:
        """Get authentication headers"""
        if self.token:
            return {"Authorization": f"Bearer {self.token}"}
        return {}

    def is_authenticated(self) -> bool:
        """Check if client is authenticated"""
        return self.token is not None`;
  }

  private generatePythonSetup(): string {
    return `from setuptools import setup, find_packages

setup(
    name="${this.config.packageName.replace(/-/g, '_')}_python",
    version="${this.config.version}",
    description="Python SDK for BMAD Package Registry API",
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    author="BMAD Package Management Team",
    author_email="packages@bmad.com",
    url="https://github.com/bmad/package-registry-sdk-python",
    packages=find_packages(),
    install_requires=[
        "requests>=2.25.0",
        "typing-extensions>=3.7.4"
    ],
    python_requires=">=3.7",
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
    ],
    keywords="bmad packages sdk python",
)`;
  }

  private generatePythonExample(): string {
    return `#!/usr/bin/env python3
"""
BMAD Package Registry Python SDK Example
"""

import asyncio
from bmad_packages import PackageRegistryClient


async def main():
    # Initialize client
    client = PackageRegistryClient({
        "base_url": "${this.config.apiBaseUrl}",
        "timeout": 30
    })

    try:
        # Search for packages
        search_result = client.search_packages({
            "terms": ["security"],
            "filters": [],
            "sorting": [{"field": "popularity", "direction": "desc", "priority": 1}],
            "pagination": {"offset": 0, "limit": 10}
        })

        print(f"Found packages: {len(search_result['packages'])}")

        # Get first package details
        if search_result["packages"]:
            pkg = client.get_package(search_result["packages"][0]["id"])
            print(f"Package details: {pkg}")

            # Get recommendations
            recommendations = client.get_recommendations(pkg["id"], 5)
            print(f"Recommendations: {len(recommendations)}")

    except Exception as error:
        print(f"Error: {error}")


if __name__ == "__main__":
    asyncio.run(main())`;
  }

  private generatePythonReadme(): string {
    return `# BMAD Package Registry Python SDK

Official Python SDK for the BMAD Package Registry API.

## Installation

\`\`\`bash
pip install ${this.config.packageName.replace(/-/g, '_')}_python
\`\`\`

## Quick Start

\`\`\`python
from bmad_packages import PackageRegistryClient

client = PackageRegistryClient({
    "base_url": "${this.config.apiBaseUrl}"
})

# Search for packages
results = client.search_packages({
    "terms": ["security"],
    "filters": [],
    "sorting": [{"field": "popularity", "direction": "desc", "priority": 1}],
    "pagination": {"offset": 0, "limit": 10}
})

print(results["packages"])
\`\`\`

## Authentication

\`\`\`python
# Set authentication token
client.authenticate("your-api-token")
\`\`\`

## License

MIT License`;
  }

  // Go SDK Generation Methods

  private generateGoClient(): string {
    return `// BMAD Package Registry Go SDK
package bmadpackages

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"
)

// ClientConfig represents the client configuration
type ClientConfig struct {
	BaseURL    string
	APIVersion string
	Timeout    time.Duration
	Headers    map[string]string
}

// Client represents the BMAD Package Registry client
type Client struct {
	baseURL    string
	apiVersion string
	httpClient *http.Client
	auth       *AuthManager
}

// NewClient creates a new client instance
func NewClient(config ClientConfig) *Client {
	if config.APIVersion == "" {
		config.APIVersion = "/api/v1"
	}
	if config.Timeout == 0 {
		config.Timeout = 30 * time.Second
	}

	return &Client{
		baseURL:    config.BaseURL,
		apiVersion: config.APIVersion,
		httpClient: &http.Client{Timeout: config.Timeout},
		auth:       NewAuthManager(config),
	}
}

// SearchPackages searches for packages
func (c *Client) SearchPackages(query PackageQuery) (*PackageSearchResult, error) {
	var result APIResponse
	err := c.makeRequest("POST", "/discovery/search", query, &result)
	if err != nil {
		return nil, err
	}

	var searchResult PackageSearchResult
	data, _ := json.Marshal(result.Data)
	json.Unmarshal(data, &searchResult)
	return &searchResult, nil
}

// GetPackage gets package details
func (c *Client) GetPackage(packageID string) (*PackageInfo, error) {
	var result APIResponse
	err := c.makeRequest("GET", fmt.Sprintf("/packages/%s", packageID), nil, &result)
	if err != nil {
		return nil, err
	}

	var pkg PackageInfo
	data, _ := json.Marshal(result.Data)
	json.Unmarshal(data, &pkg)
	return &pkg, nil
}

// InstallPackage installs a package
func (c *Client) InstallPackage(packageID, version string) (interface{}, error) {
	payload := map[string]string{"version": version}
	var result APIResponse
	err := c.makeRequest("POST", fmt.Sprintf("/packages/%s/install", packageID), payload, &result)
	if err != nil {
		return nil, err
	}
	return result.Data, nil
}

// Authenticate sets the authentication token
func (c *Client) Authenticate(token string) {
	c.auth.SetToken(token)
}

// makeRequest makes an HTTP request
func (c *Client) makeRequest(method, endpoint string, payload interface{}, result interface{}) error {
	url := c.baseURL + c.apiVersion + endpoint

	var body io.Reader
	if payload != nil {
		jsonData, err := json.Marshal(payload)
		if err != nil {
			return err
		}
		body = bytes.NewBuffer(jsonData)
	}

	req, err := http.NewRequest(method, url, body)
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")

	// Add auth headers
	c.auth.AddAuthHeaders(req)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("API error: %s", resp.Status)
	}

	return json.NewDecoder(resp.Body).Decode(result)
}`;
  }

  private generateGoTypes(): string {
    return `package bmadpackages

import "time"

// APIResponse represents a generic API response
type APIResponse struct {
	Success bool        \`json:"success"\`
	Data    interface{} \`json:"data,omitempty"\`
	Error   *APIError   \`json:"error,omitempty"\`
	Meta    *APIMeta    \`json:"meta,omitempty"\`
}

// APIError represents an API error
type APIError struct {
	Code    string      \`json:"code"\`
	Message string      \`json:"message"\`
	Details interface{} \`json:"details,omitempty"\`
}

// APIMeta represents API metadata
type APIMeta struct {
	Timestamp  string           \`json:"timestamp"\`
	Version    string           \`json:"version"\`
	RequestID  string           \`json:"requestId"\`
	Pagination *PaginationMeta  \`json:"pagination,omitempty"\`
}

// PaginationMeta represents pagination metadata
type PaginationMeta struct {
	Page       int  \`json:"page"\`
	Limit      int  \`json:"limit"\`
	Total      int  \`json:"total"\`
	TotalPages int  \`json:"totalPages"\`
	HasNext    bool \`json:"hasNext"\`
	HasPrev    bool \`json:"hasPrev"\`
}

// PackageInfo represents package information
type PackageInfo struct {
	ID          string              \`json:"id"\`
	Name        string              \`json:"name"\`
	Version     string              \`json:"version"\`
	Description *string             \`json:"description,omitempty"\`
	Author      string              \`json:"author"\`
	Tags        []string            \`json:"tags"\`
	Category    string              \`json:"category"\`
	License     string              \`json:"license"\`
	Repository  *string             \`json:"repository,omitempty"\`
	Homepage    *string             \`json:"homepage,omitempty"\`
	DownloadURL *string             \`json:"downloadUrl,omitempty"\`
	PublishedAt *time.Time          \`json:"publishedAt,omitempty"\`
	UpdatedAt   *time.Time          \`json:"updatedAt,omitempty"\`
	Stats       *PackageStats       \`json:"stats,omitempty"\`
}

// PackageStats represents package statistics
type PackageStats struct {
	DownloadCount   int     \`json:"downloadCount"\`
	InstallCount    int     \`json:"installCount"\`
	PopularityScore float64 \`json:"popularityScore"\`
	DependentCount  int     \`json:"dependentCount"\`
}

// PackageQuery represents a package search query
type PackageQuery struct {
	Terms      []string           \`json:"terms,omitempty"\`
	Filters    []QueryFilter      \`json:"filters"\`
	Sorting    []SortCriteria     \`json:"sorting"\`
	Pagination PaginationOptions  \`json:"pagination"\`
	Faceting   *FacetingOptions   \`json:"faceting,omitempty"\`
}

// QueryFilter represents a search filter
type QueryFilter struct {
	Field    string      \`json:"field"\`
	Operator string      \`json:"operator"\`
	Value    interface{} \`json:"value"\`
}

// SortCriteria represents sorting criteria
type SortCriteria struct {
	Field     string \`json:"field"\`
	Direction string \`json:"direction"\`
	Priority  int    \`json:"priority"\`
}

// PaginationOptions represents pagination options
type PaginationOptions struct {
	Offset int     \`json:"offset"\`
	Limit  int     \`json:"limit"\`
	Cursor *string \`json:"cursor,omitempty"\`
}

// FacetingOptions represents faceting options
type FacetingOptions struct {
	Enabled   bool     \`json:"enabled"\`
	Fields    []string \`json:"fields"\`
	MaxValues int      \`json:"maxValues"\`
	MinCount  int      \`json:"minCount"\`
}

// PackageSearchResult represents search results
type PackageSearchResult struct {
	Packages   []PackageInfo          \`json:"packages"\`
	Pagination PaginationMeta         \`json:"pagination"\`
	Facets     map[string][]FacetValue \`json:"facets,omitempty"\`
	Total      int                    \`json:"total"\`
}

// FacetValue represents a facet value
type FacetValue struct {
	Value string \`json:"value"\`
	Count int    \`json:"count"\`
}`;
  }

  private generateGoAuth(): string {
    return `package bmadpackages

import "net/http"

// AuthManager manages authentication
type AuthManager struct {
	token  string
	config ClientConfig
}

// NewAuthManager creates a new auth manager
func NewAuthManager(config ClientConfig) *AuthManager {
	return &AuthManager{
		config: config,
	}
}

// SetToken sets the authentication token
func (a *AuthManager) SetToken(token string) {
	a.token = token
}

// GetToken gets the current token
func (a *AuthManager) GetToken() string {
	return a.token
}

// ClearToken clears the authentication token
func (a *AuthManager) ClearToken() {
	a.token = ""
}

// AddAuthHeaders adds authentication headers to request
func (a *AuthManager) AddAuthHeaders(req *http.Request) {
	if a.token != "" {
		req.Header.Set("Authorization", "Bearer "+a.token)
	}
}

// IsAuthenticated checks if client is authenticated
func (a *AuthManager) IsAuthenticated() bool {
	return a.token != ""
}`;
  }

  private generateGoMod(): string {
    return `module github.com/bmad/${this.config.packageName}-go

go 1.19

require (
	// Standard library only - no external dependencies required
)`;
  }

  private generateGoExample(): string {
    return `package main

import (
	"fmt"
	"log"
	"time"

	bmad "github.com/bmad/${this.config.packageName}-go"
)

func main() {
	// Initialize client
	client := bmad.NewClient(bmad.ClientConfig{
		BaseURL: "${this.config.apiBaseUrl}",
		Timeout: 30 * time.Second,
	})

	// Search for packages
	query := bmad.PackageQuery{
		Terms: []string{"security"},
		Filters: []bmad.QueryFilter{},
		Sorting: []bmad.SortCriteria{
			{Field: "popularity", Direction: "desc", Priority: 1},
		},
		Pagination: bmad.PaginationOptions{
			Offset: 0,
			Limit:  10,
		},
	}

	results, err := client.SearchPackages(query)
	if err != nil {
		log.Fatal("Error searching packages:", err)
	}

	fmt.Printf("Found %d packages\\n", len(results.Packages))

	// Get first package details
	if len(results.Packages) > 0 {
		pkg, err := client.GetPackage(results.Packages[0].ID)
		if err != nil {
			log.Fatal("Error getting package:", err)
		}
		fmt.Printf("Package: %s@%s\\n", pkg.Name, pkg.Version)
	}
}`;
  }

  private generateGoReadme(): string {
    return `# BMAD Package Registry Go SDK

Official Go SDK for the BMAD Package Registry API.

## Installation

\`\`\`bash
go get github.com/bmad/${this.config.packageName}-go
\`\`\`

## Quick Start

\`\`\`go
package main

import (
    "fmt"
    bmad "github.com/bmad/${this.config.packageName}-go"
)

func main() {
    client := bmad.NewClient(bmad.ClientConfig{
        BaseURL: "${this.config.apiBaseUrl}",
    })

    results, err := client.SearchPackages(bmad.PackageQuery{
        Terms: []string{"security"},
        Pagination: bmad.PaginationOptions{
            Offset: 0,
            Limit:  10,
        },
    })

    if err != nil {
        panic(err)
    }

    fmt.Printf("Found %d packages\\n", len(results.Packages))
}
\`\`\`

## License

MIT License`;
  }

  // Java SDK Generation Methods (abbreviated)

  private generateJavaClient(): string {
    return `package com.bmad.packages;

import java.io.IOException;
import java.util.concurrent.CompletableFuture;
import com.google.gson.Gson;
import okhttp3.*;

public class PackageClient {
    private final String baseUrl;
    private final OkHttpClient httpClient;
    private final Gson gson;
    private final AuthManager auth;

    public PackageClient(String baseUrl) {
        this.baseUrl = baseUrl + "/api/v1";
        this.httpClient = new OkHttpClient();
        this.gson = new Gson();
        this.auth = new AuthManager();
    }

    public CompletableFuture<PackageSearchResult> searchPackages(PackageQuery query) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String json = gson.toJson(query);
                RequestBody body = RequestBody.create(
                    MediaType.get("application/json"), json);

                Request request = new Request.Builder()
                    .url(baseUrl + "/discovery/search")
                    .post(body)
                    .build();

                try (Response response = httpClient.newCall(request).execute()) {
                    String responseBody = response.body().string();
                    ApiResponse<PackageSearchResult> apiResponse =
                        gson.fromJson(responseBody, ApiResponse.class);
                    return apiResponse.getData();
                }
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        });
    }

    public void authenticate(String token) {
        auth.setToken(token);
    }
}`;
  }

  private generateJavaTypes(): string {
    return `package com.bmad.packages.types;

import java.util.List;
import java.util.Map;

public class Package {
    private String id;
    private String name;
    private String version;
    private String description;
    private String author;
    private List<String> tags;
    private String category;
    private String license;

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }

    // ... other getters and setters
}

public class ApiResponse<T> {
    private boolean success;
    private T data;
    private ApiError error;
    private ApiMeta meta;

    // Getters and setters
    public boolean isSuccess() { return success; }
    public T getData() { return data; }
    public ApiError getError() { return error; }
    public ApiMeta getMeta() { return meta; }
}`;
  }

  private generateJavaAuth(): string {
    return `package com.bmad.packages.auth;

import okhttp3.Request;

public class AuthManager {
    private String token;

    public void setToken(String token) {
        this.token = token;
    }

    public String getToken() {
        return token;
    }

    public Request.Builder addAuthHeaders(Request.Builder builder) {
        if (token != null) {
            builder.addHeader("Authorization", "Bearer " + token);
        }
        return builder;
    }

    public boolean isAuthenticated() {
        return token != null;
    }
}`;
  }

  private generateJavaPom(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.bmad</groupId>
    <artifactId>${this.config.packageName}-java</artifactId>
    <version>${this.config.version}</version>
    <packaging>jar</packaging>

    <name>BMAD Package Registry Java SDK</name>
    <description>Java SDK for BMAD Package Registry API</description>
    <url>https://github.com/bmad/package-registry-sdk-java</url>

    <properties>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <dependency>
            <groupId>com.squareup.okhttp3</groupId>
            <artifactId>okhttp</artifactId>
            <version>4.10.0</version>
        </dependency>
        <dependency>
            <groupId>com.google.code.gson</groupId>
            <artifactId>gson</artifactId>
            <version>2.9.0</version>
        </dependency>
    </dependencies>
</project>`;
  }

  private generateJavaExample(): string {
    return `import com.bmad.packages.PackageClient;
import com.bmad.packages.types.PackageQuery;

public class BasicUsage {
    public static void main(String[] args) {
        PackageClient client = new PackageClient("${this.config.apiBaseUrl}");

        PackageQuery query = new PackageQuery();
        query.setTerms(new String[]{"security"});
        query.setPagination(new PaginationOptions(0, 10));

        client.searchPackages(query)
            .thenAccept(results -> {
                System.out.println("Found " + results.getPackages().size() + " packages");
            })
            .exceptionally(throwable -> {
                System.err.println("Error: " + throwable.getMessage());
                return null;
            });
    }
}`;
  }

  private generateJavaReadme(): string {
    return `# BMAD Package Registry Java SDK

Official Java SDK for the BMAD Package Registry API.

## Installation

Add to your \`pom.xml\`:

\`\`\`xml
<dependency>
    <groupId>com.bmad</groupId>
    <artifactId>${this.config.packageName}-java</artifactId>
    <version>${this.config.version}</version>
</dependency>
\`\`\`

## Quick Start

\`\`\`java
PackageClient client = new PackageClient("${this.config.apiBaseUrl}");

PackageQuery query = new PackageQuery();
query.setTerms(new String[]{"security"});

client.searchPackages(query)
    .thenAccept(results -> {
        System.out.println("Found packages: " + results.getPackages().size());
    });
\`\`\`

## License

MIT License`;
  }

  // C# SDK Generation Methods (abbreviated)

  private generateCSharpClient(): string {
    return `using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using BmadPackages.Types;
using BmadPackages.Auth;

namespace BmadPackages
{
    public class PackageClient
    {
        private readonly HttpClient httpClient;
        private readonly string baseUrl;
        private readonly AuthManager auth;

        public PackageClient(string baseUrl)
        {
            this.baseUrl = baseUrl + "/api/v1";
            this.httpClient = new HttpClient();
            this.auth = new AuthManager();

            httpClient.DefaultRequestHeaders.Add("Content-Type", "application/json");
        }

        public async Task<PackageSearchResult> SearchPackagesAsync(PackageQuery query)
        {
            var json = JsonConvert.SerializeObject(query);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var request = new HttpRequestMessage(HttpMethod.Post, baseUrl + "/discovery/search")
            {
                Content = content
            };

            auth.AddAuthHeaders(request);

            var response = await httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var responseJson = await response.Content.ReadAsStringAsync();
            var apiResponse = JsonConvert.DeserializeObject<ApiResponse<PackageSearchResult>>(responseJson);
            return apiResponse.Data;
        }

        public void Authenticate(string token)
        {
            auth.SetToken(token);
        }
    }
}`;
  }

  private generateCSharpTypes(): string {
    return `using System;
using System.Collections.Generic;

namespace BmadPackages.Types
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public T Data { get; set; }
        public ApiError Error { get; set; }
        public ApiMeta Meta { get; set; }
    }

    public class ApiError
    {
        public string Code { get; set; }
        public string Message { get; set; }
        public object Details { get; set; }
    }

    public class Package
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Version { get; set; }
        public string Description { get; set; }
        public string Author { get; set; }
        public List<string> Tags { get; set; }
        public string Category { get; set; }
        public string License { get; set; }
    }

    public class PackageQuery
    {
        public List<string> Terms { get; set; }
        public List<object> Filters { get; set; } = new List<object>();
        public List<object> Sorting { get; set; } = new List<object>();
        public PaginationOptions Pagination { get; set; } = new PaginationOptions();
    }

    public class PaginationOptions
    {
        public int Offset { get; set; } = 0;
        public int Limit { get; set; } = 10;
        public string Cursor { get; set; }
    }

    public class PackageSearchResult
    {
        public List<Package> Packages { get; set; }
        public PaginationMeta Pagination { get; set; }
        public int Total { get; set; }
    }

    public class PaginationMeta
    {
        public int Page { get; set; }
        public int Limit { get; set; }
        public int Total { get; set; }
        public int TotalPages { get; set; }
        public bool HasNext { get; set; }
        public bool HasPrev { get; set; }
    }
}`;
  }

  private generateCSharpAuth(): string {
    return `using System.Net.Http;

namespace BmadPackages.Auth
{
    public class AuthManager
    {
        private string token;

        public void SetToken(string token)
        {
            this.token = token;
        }

        public string GetToken()
        {
            return token;
        }

        public void ClearToken()
        {
            token = null;
        }

        public void AddAuthHeaders(HttpRequestMessage request)
        {
            if (!string.IsNullOrEmpty(token))
            {
                request.Headers.Authorization =
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
            }
        }

        public bool IsAuthenticated()
        {
            return !string.IsNullOrEmpty(token);
        }
    }
}`;
  }

  private generateCSharpProject(): string {
    return `<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>net6.0</TargetFramework>
    <PackageId>${this.config.packageName}-csharp</PackageId>
    <Version>${this.config.version}</Version>
    <Authors>BMAD Package Management Team</Authors>
    <Description>C# SDK for BMAD Package Registry API</Description>
    <PackageProjectUrl>https://github.com/bmad/package-registry-sdk-csharp</PackageProjectUrl>
    <RepositoryUrl>https://github.com/bmad/package-registry-sdk-csharp</RepositoryUrl>
    <PackageTags>bmad;packages;sdk;csharp</PackageTags>
    <PackageLicenseExpression>MIT</PackageLicenseExpression>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Newtonsoft.Json" Version="13.0.1" />
  </ItemGroup>

</Project>`;
  }

  private generateCSharpExample(): string {
    return `using System;
using System.Threading.Tasks;
using BmadPackages;
using BmadPackages.Types;

class Program
{
    static async Task Main(string[] args)
    {
        var client = new PackageClient("${this.config.apiBaseUrl}");

        try
        {
            var query = new PackageQuery
            {
                Terms = new List<string> { "security" },
                Pagination = new PaginationOptions { Offset = 0, Limit = 10 }
            };

            var results = await client.SearchPackagesAsync(query);
            Console.WriteLine($"Found {results.Packages.Count} packages");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}`;
  }

  private generateCSharpReadme(): string {
    return `# BMAD Package Registry C# SDK

Official C# SDK for the BMAD Package Registry API.

## Installation

\`\`\`bash
dotnet add package ${this.config.packageName}-csharp
\`\`\`

## Quick Start

\`\`\`csharp
using BmadPackages;
using BmadPackages.Types;

var client = new PackageClient("${this.config.apiBaseUrl}");

var query = new PackageQuery
{
    Terms = new List<string> { "security" },
    Pagination = new PaginationOptions { Offset = 0, Limit = 10 }
};

var results = await client.SearchPackagesAsync(query);
Console.WriteLine($"Found {results.Packages.Count} packages");
\`\`\`

## License

MIT License`;
  }

  // Documentation Generation

  private async generateDocumentation(sdks: GeneratedSDK[]): Promise<void> {
    const docContent = this.generateCrossLanguageDoc(sdks);

    const docFile: SDKFile = {
      path: 'SDK_OVERVIEW.md',
      type: 'documentation',
      content: docContent
    };

    // Write documentation to output directory
    const docPath = path.join(this.config.outputDir, docFile.path);
    fs.writeFileSync(docPath, docFile.content, 'utf8');

    console.log('📚 Cross-language documentation generated');
  }

  private generateCrossLanguageDoc(sdks: GeneratedSDK[]): string {
    return `# BMAD Package Registry SDK Collection

This document provides an overview of all available SDKs for the BMAD Package Registry API.

## Available SDKs

${sdks.map(sdk => `
### ${sdk.language.charAt(0).toUpperCase() + sdk.language.slice(1)} SDK

**Package Name:** \`${sdk.packageInfo.name}\`
**Version:** \`${sdk.packageInfo.version}\`
**Size:** ${Math.round(sdk.packageInfo.size / 1024)} KB
**Dependencies:** ${sdk.packageInfo.dependencies.join(', ')}
**Files Generated:** ${sdk.files.length}

`).join('')}

## Quick Start Examples

### TypeScript/JavaScript
\`\`\`typescript
import { PackageRegistryClient } from '${this.config.packageName}-typescript';

const client = new PackageRegistryClient({
  baseUrl: '${this.config.apiBaseUrl}'
});

const results = await client.searchPackages({
  terms: ['security'],
  pagination: { offset: 0, limit: 10 }
});
\`\`\`

### Python
\`\`\`python
from bmad_packages import PackageRegistryClient

client = PackageRegistryClient({
    "base_url": "${this.config.apiBaseUrl}"
})

results = client.search_packages({
    "terms": ["security"],
    "pagination": {"offset": 0, "limit": 10}
})
\`\`\`

### Go
\`\`\`go
import bmad "github.com/bmad/${this.config.packageName}-go"

client := bmad.NewClient(bmad.ClientConfig{
    BaseURL: "${this.config.apiBaseUrl}",
})

results, err := client.SearchPackages(bmad.PackageQuery{
    Terms: []string{"security"},
    Pagination: bmad.PaginationOptions{Offset: 0, Limit: 10},
})
\`\`\`

### Java
\`\`\`java
PackageClient client = new PackageClient("${this.config.apiBaseUrl}");

PackageQuery query = new PackageQuery();
query.setTerms(new String[]{"security"});

client.searchPackages(query).thenAccept(results -> {
    System.out.println("Found packages: " + results.getPackages().size());
});
\`\`\`

### C#
\`\`\`csharp
var client = new PackageClient("${this.config.apiBaseUrl}");

var query = new PackageQuery
{
    Terms = new List<string> { "security" },
    Pagination = new PaginationOptions { Offset = 0, Limit = 10 }
};

var results = await client.SearchPackagesAsync(query);
\`\`\`

## Common API Operations

All SDKs support the following operations:

1. **Search Packages** - Search for packages with filters and sorting
2. **Get Package Details** - Retrieve detailed package information
3. **Install Package** - Install packages with version constraints
4. **Get Dependency Graph** - Analyze package dependencies
5. **Get Recommendations** - Get package recommendations
6. **Record Events** - Track analytics events
7. **Authentication** - Authenticate with API tokens

## Error Handling

All SDKs implement consistent error handling:

- Network errors are wrapped in SDK-specific exceptions
- API errors return structured error responses
- Rate limiting and timeout handling is built-in
- Retry logic can be configured per SDK

## Authentication

All SDKs support Bearer token authentication:

\`\`\`
client.authenticate("your-api-token")
\`\`\`

## Support

For questions or issues with any SDK:

- Create an issue in the respective SDK repository
- Contact the BMAD Package Management Team
- Check the API documentation at ${this.config.apiBaseUrl}/docs

## License

All SDKs are released under the MIT License.
`;
  }

  // Helper Methods

  private generateDefaultAPISpec(): any {
    return {
      openapi: '3.0.0',
      info: {
        title: 'BMAD Package Registry API',
        version: this.config.version
      },
      paths: {}
    };
  }
}

/**
 * Create SDK generator instance
 */
export function createSDKGenerator(config: SDKConfig, apiSpec?: any): SDKGenerator {
  return new SDKGenerator(config, apiSpec);
}

/**
 * Generate all SDKs with default configuration
 */
export async function generateAllSDKs(
  baseConfig: Partial<SDKConfig>,
  outputDir?: string
): Promise<GeneratedSDK[]> {
  const config: SDKConfig = {
    apiBaseUrl: 'http://localhost:3000',
    version: '1.0.0',
    packageName: 'bmad-packages',
    outputDir: outputDir || './generated-sdks',
    languages: ['typescript', 'javascript', 'python', 'go'],
    includeAuth: true,
    includeTypes: true,
    includeExamples: true,
    ...baseConfig
  };

  const generator = new SDKGenerator(config);
  const sdks = await generator.generateAll();

  // Write all SDKs to disk
  for (const sdk of sdks) {
    await generator.writeSDKToDisk(sdk);
  }

  return sdks;
}

// Export types
export type { SDKConfig, SDKLanguage, GeneratedSDK, SDKFile };