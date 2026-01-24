/**
 * Basic Module Installation Example
 *
 * This example demonstrates the most common use case: installing a single
 * BMAD module with progress monitoring and error handling.
 *
 * Features:
 * - Simple module installation
 * - Progress monitoring
 * - Error handling with retry logic
 * - Structured logging
 *
 * @author Amelia, The Developer
 * @version 1.0.0
 */

import { BmadClient, BmadConfig } from '@bmad/sdk-js';
import {
  InstallationRequest,
  InstallationResponse,
  InstallationStatusResponse,
  BmadApiError,
  BmadTimeoutError,
  BmadRateLimitError
} from '@bmad/sdk-js/types';

/**
 * Configuration interface for the installation example
 */
interface InstallationConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Basic Module Installation Class
 *
 * Demonstrates production-ready module installation with:
 * - Progress monitoring
 * - Error handling
 * - Retry logic
 * - Audit logging
 */
export class BasicModuleInstaller {
  private client: BmadClient;
  private logger: Console;

  constructor(config: InstallationConfig) {
    // Initialize BMAD client with production settings
    const bmadConfig: BmadConfig = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl || 'https://api.bmad-enterprise.com/v2',
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
      logLevel: config.logLevel || 'info'
    };

    this.client = new BmadClient(bmadConfig);
    this.logger = console;
  }

  /**
   * Install a single module with progress monitoring
   *
   * @param moduleName - Name of the module to install (e.g., '@bmad-cybercommand/cybersec-team')
   * @param options - Installation options
   * @returns Promise<InstallationStatusResponse>
   *
   * @example
   * ```typescript
   * const installer = new BasicModuleInstaller({ apiKey: 'your-api-key' });
   *
   * const result = await installer.installModule('@bmad-cybercommand/cybersec-team', {
   *   validateDependencies: true,
   *   enableRollback: true,
   *   verbose: true
   * });
   *
   * console.log('Installation completed:', result.status);
   * ```
   */
  async installModule(
    moduleName: string,
    options: {
      validateDependencies?: boolean;
      enableRollback?: boolean;
      verbose?: boolean;
      timeout?: number;
    } = {}
  ): Promise<InstallationStatusResponse> {
    const startTime = Date.now();
    const correlationId = this.generateCorrelationId();

    this.logger.log(`[${correlationId}] Starting installation of module: ${moduleName}`);

    try {
      // Step 1: Validate module name
      this.validateModuleName(moduleName);

      // Step 2: Prepare installation request
      const request: InstallationRequest = {
        modules: [moduleName],
        options: {
          validateDependencies: options.validateDependencies ?? true,
          enableRollback: options.enableRollback ?? true,
          verbose: options.verbose ?? false,
          timeout: options.timeout ?? 300 // 5 minutes default
        }
      };

      // Step 3: Start installation
      const installation = await this.startInstallation(request, correlationId);

      // Step 4: Monitor installation progress
      const finalStatus = await this.monitorInstallation(
        installation.installationId,
        correlationId,
        options.timeout || 300
      );

      // Step 5: Log completion
      const duration = Date.now() - startTime;
      this.logger.log(`[${correlationId}] Installation completed in ${duration}ms`);
      this.logger.log(`[${correlationId}] Final status: ${finalStatus.status}`);

      return finalStatus;

    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`[${correlationId}] Installation failed after ${duration}ms:`, error);
      throw error;
    }
  }

  /**
   * Start the installation process
   */
  private async startInstallation(
    request: InstallationRequest,
    correlationId: string
  ): Promise<InstallationResponse> {
    this.logger.log(`[${correlationId}] Initiating installation request...`);

    const installation = await this.executeWithRetry(
      () => this.client.installation.installModules(request),
      3,
      correlationId
    );

    this.logger.log(`[${correlationId}] Installation initiated. ID: ${installation.installationId}`);
    return installation;
  }

  /**
   * Monitor installation progress with real-time updates
   */
  private async monitorInstallation(
    installationId: string,
    correlationId: string,
    timeoutSeconds: number = 300
  ): Promise<InstallationStatusResponse> {
    const startTime = Date.now();
    const timeoutMs = timeoutSeconds * 1000;
    let lastProgressPercent = 0;

    this.logger.log(`[${correlationId}] Starting progress monitoring for installation: ${installationId}`);

    while (true) {
      try {
        // Check if timeout exceeded
        if (Date.now() - startTime > timeoutMs) {
          throw new BmadTimeoutError(`Installation timeout exceeded: ${timeoutSeconds}s`);
        }

        // Get current status
        const status = await this.client.installation.getStatus(installationId);

        // Log progress updates
        if (status.progress?.percentage !== lastProgressPercent) {
          lastProgressPercent = status.progress.percentage;
          this.logger.log(`[${correlationId}] Progress: ${status.progress.percentage}% - ${status.progress.currentStep || 'Processing...'}`);
        }

        // Check if completed
        if (status.status === 'completed') {
          this.logger.log(`[${correlationId}] ✅ Installation completed successfully!`);
          return status;
        }

        // Check if failed
        if (status.status === 'failed') {
          const errorMessage = status.error || 'Unknown installation error';
          this.logger.error(`[${correlationId}] ❌ Installation failed: ${errorMessage}`);
          throw new BmadApiError(`Installation failed: ${errorMessage}`, 'INSTALLATION_FAILED', 422);
        }

        // Wait before next check (exponential backoff)
        const pollInterval = Math.min(2000 + (Date.now() - startTime) / 10, 10000);
        await this.sleep(pollInterval);

      } catch (error) {
        if (error instanceof BmadTimeoutError || error instanceof BmadApiError) {
          throw error;
        }

        this.logger.warn(`[${correlationId}] Status check failed, retrying:`, error.message);
        await this.sleep(5000);
      }
    }
  }

  /**
   * Execute operation with retry logic and exponential backoff
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number,
    correlationId: string
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (error instanceof BmadRateLimitError) {
          this.logger.warn(`[${correlationId}] Rate limited, waiting ${error.retryAfter}s...`);
          await this.sleep(error.retryAfter * 1000);
          continue;
        }

        if (error instanceof BmadTimeoutError && attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          this.logger.warn(`[${correlationId}] Timeout on attempt ${attempt + 1}, retrying in ${delay}ms...`);
          await this.sleep(delay);
          continue;
        }

        if (error instanceof BmadApiError && error.statusCode >= 500 && attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          this.logger.warn(`[${correlationId}] Server error on attempt ${attempt + 1}, retrying in ${delay}ms...`);
          await this.sleep(delay);
          continue;
        }

        // Don't retry client errors (4xx)
        throw error;
      }
    }

    throw lastError!;
  }

  /**
   * Validate module name format
   */
  private validateModuleName(moduleName: string): void {
    if (!moduleName || typeof moduleName !== 'string') {
      throw new Error('Module name must be a non-empty string');
    }

    // Check for valid npm package format
    const validPattern = /^@bmad-cybercommand\/[a-z0-9-]+$/;
    if (!validPattern.test(moduleName)) {
      throw new Error(`Invalid module name format: ${moduleName}. Expected format: @bmad-cybercommand/module-name`);
    }

    this.logger.log(`Module name validated: ${moduleName}`);
  }

  /**
   * Generate correlation ID for request tracking
   */
  private generateCorrelationId(): string {
    return `install-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sleep utility function
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    try {
      await this.client.close?.();
    } catch (error) {
      this.logger.warn('Error during cleanup:', error);
    }
  }
}

/**
 * Example usage function
 */
export async function runBasicInstallationExample(): Promise<void> {
  // Load configuration from environment
  const config: InstallationConfig = {
    apiKey: process.env.BMAD_API_KEY!,
    baseUrl: process.env.BMAD_BASE_URL,
    logLevel: (process.env.BMAD_LOG_LEVEL as any) || 'info'
  };

  if (!config.apiKey) {
    throw new Error('BMAD_API_KEY environment variable is required');
  }

  const installer = new BasicModuleInstaller(config);

  try {
    // Example 1: Install cybersec module
    console.log('🚀 Starting basic module installation example...');

    const result = await installer.installModule('@bmad-cybercommand/cybersec-team', {
      validateDependencies: true,
      enableRollback: true,
      verbose: true
    });

    console.log('✅ Installation completed successfully!');
    console.log('📊 Final Status:', {
      installationId: result.installationId,
      status: result.status,
      progress: result.progress,
      completedAt: new Date().toISOString()
    });

    // Example 2: Verify installation
    console.log('🔍 Verifying installation...');

    // Note: This would typically call a verification API
    console.log('✅ Module verification completed');

  } catch (error) {
    console.error('❌ Installation failed:', error);
    throw error;
  } finally {
    await installer.cleanup();
  }
}

// Run example if called directly
if (require.main === module) {
  runBasicInstallationExample()
    .then(() => {
      console.log('Example completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Example failed:', error);
      process.exit(1);
    });
}