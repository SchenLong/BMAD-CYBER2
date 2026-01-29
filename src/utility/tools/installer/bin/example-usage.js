/**
 * BMAD Installation System - Example Usage
 * Epic 3: Story 3.4 - Installation Templates & Configuration Examples
 *
 * This file demonstrates how to use the complete installation system
 * for BMAD specialized teams.
 *
 * @author BlackUnicorn.Tech
 * @version 1.0.0
 */

const BMADInstallationOrchestrator = require('../lib/core/bmad-installation-orchestrator');

/**
 * Example 1: Install a single team module
 */
async function installSingleTeam() {
    console.log('=== Example 1: Installing Cybersec Team ===\n');

    try {
        // Initialize the orchestrator
        const orchestrator = new BMADInstallationOrchestrator({
            bmadRoot: './_bmad',
            outputPath: './generated',
            enableValidation: true,
            enableVerification: true,
            enableBackup: true,
            strictMode: false
        });

        await orchestrator.initialize();

        // Install cybersec-team with custom configuration
        const result = await orchestrator.installTeamModule('cybersec-team', {
            environment: 'production',
            variables: new Map([
                ['SECURITY_FRAMEWORK', 'nist_cybersecurity_framework'],
                ['OUTPUT_FOLDER', '_bmad-output/cybersec-team'],
                ['ENABLE_ADVANCED_FEATURES', 'true']
            ]),
            generateInstallScript: true,
            backup: true
        });

        if (result.success) {
            console.log('✅ Installation completed successfully!');
            console.log(`   Session ID: ${result.sessionId}`);
            console.log(`   Duration: ${result.duration}ms`);
            console.log(`   Configuration Score: ${result.validation?.score || 'N/A'}/100`);
            console.log(`   Verification Status: ${result.verification?.success ? 'PASSED' : 'ISSUES FOUND'}`);

            // Show output files
            console.log('\n📁 Generated Files:');
            for (const file of result.outputFiles) {
                console.log(`   - ${file.path} (${file.type})`);
            }
        } else {
            console.error('❌ Installation failed:', result.error);
        }

    } catch (error) {
        console.error('💥 Error:', error.message);
    }
}

/**
 * Example 2: Bulk install all teams
 */
async function installAllTeams() {
    console.log('\n=== Example 2: Installing All Teams ===\n');

    try {
        const orchestrator = new BMADInstallationOrchestrator({
            enableValidation: true,
            enableVerification: false, // Skip verification for bulk install
            enableBackup: false
        });

        await orchestrator.initialize();

        const teams = ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'];
        const results = {};

        for (const teamCode of teams) {
            console.log(`Installing ${teamCode}...`);

            const result = await orchestrator.installTeamModule(teamCode, {
                environment: 'development',
                sequential: true, // Install dependencies sequentially
                continueOnFailure: true // Continue even if some dependencies fail
            });

            results[teamCode] = result;

            console.log(`${teamCode}: ${result.success ? '✅ Success' : '❌ Failed'}`);
            if (!result.success) {
                console.log(`   Error: ${result.error}`);
            }
        }

        // Summary
        const successful = Object.values(results).filter(r => r.success).length;
        console.log(`\n📊 Summary: ${successful}/${teams.length} teams installed successfully`);

    } catch (error) {
        console.error('💥 Error:', error.message);
    }
}

/**
 * Example 3: Generate configurations without installation
 */
async function generateConfigurationsOnly() {
    console.log('\n=== Example 3: Generate Configurations Only ===\n');

    try {
        const orchestrator = new BMADInstallationOrchestrator({
            outputPath: './example-configurations'
        });

        await orchestrator.initialize();

        // Generate configurations for different environments
        const environments = ['development', 'production', 'testing'];

        for (const environment of environments) {
            console.log(`Generating ${environment} configurations...`);

            const configurations = await orchestrator.generateAllTeamConfigurations({
                environment,
                generateInstallScript: true,
                backup: false
            });

            let successCount = 0;
            for (const [teamCode, result] of Object.entries(configurations)) {
                if (result.success) {
                    successCount++;
                    console.log(`  ✅ ${teamCode}: Generated successfully`);

                    // Show validation results if available
                    if (result.validation) {
                        console.log(`     Validation Score: ${result.validation.score}/100`);
                        if (result.validation.warnings.length > 0) {
                            console.log(`     Warnings: ${result.validation.warnings.length}`);
                        }
                    }
                } else {
                    console.log(`  ❌ ${teamCode}: ${result.error}`);
                }
            }

            console.log(`  Generated ${successCount}/4 team configurations for ${environment}\n`);
        }

        // Export configurations to files
        await orchestrator.exportConfigurations('./exported-configs', 'yaml');
        console.log('📁 Configurations exported to ./exported-configs');

    } catch (error) {
        console.error('💥 Error:', error.message);
    }
}

/**
 * Example 4: Validate existing installation
 */
async function validateExistingInstallation() {
    console.log('\n=== Example 4: Validate Existing Installation ===\n');

    try {
        const orchestrator = new BMADInstallationOrchestrator();
        await orchestrator.initialize();

        // Validate intel-team installation
        const result = await orchestrator.validateInstallation('intel-team', {
            environment: 'production',
            checkDependencies: true,
            checkPermissions: true
        });

        if (result.success) {
            console.log('📋 Validation Results:');
            console.log(`   Configuration Valid: ${result.validation.valid ? '✅' : '❌'}`);
            console.log(`   Configuration Score: ${result.validation.score}/100`);
            console.log(`   Post-Install Check: ${result.verification.success ? '✅' : '❌'}`);

            if (result.validation.errors.length > 0) {
                console.log('\n❌ Configuration Errors:');
                for (const error of result.validation.errors) {
                    console.log(`   - ${error.field}: ${error.message}`);
                }
            }

            if (result.validation.warnings.length > 0) {
                console.log('\n⚠️  Configuration Warnings:');
                for (const warning of result.validation.warnings) {
                    console.log(`   - ${warning.field}: ${warning.message}`);
                }
            }

            if (result.verification.issues.length > 0) {
                console.log('\n🔍 Verification Issues:');
                for (const issue of result.verification.issues) {
                    console.log(`   - [${issue.severity}] ${issue.name}: ${issue.message}`);
                }
            }

            console.log(`\nOverall Status: ${result.overall ? '✅ HEALTHY' : '⚠️  NEEDS ATTENTION'}`);

        } else {
            console.error('❌ Validation failed:', result.error);
        }

    } catch (error) {
        console.error('💥 Error:', error.message);
    }
}

/**
 * Example 5: Custom variable substitution
 */
async function customVariableSubstitution() {
    console.log('\n=== Example 5: Custom Variable Substitution ===\n');

    try {
        const orchestrator = new BMADInstallationOrchestrator();
        await orchestrator.initialize();

        // Install with custom variables
        const result = await orchestrator.installTeamModule('legal-team', {
            environment: 'production',
            variables: new Map([
                // Team-specific configuration
                ['JURISDICTION', 'multi_jurisdiction'],
                ['PRIMARY_LAW', 'united_states'],
                ['COMPLIANCE_LEVEL', 'high'],

                // Custom output structure
                ['OUTPUT_FOLDER', '/opt/bmad/legal-team'],
                ['BACKUP_FOLDER', '/opt/bmad/backups/legal'],

                // Integration settings
                ['ENABLE_CROSS_TEAM_WORKFLOWS', 'true'],
                ['STRATEGY_TEAM_INTEGRATION', 'enabled'],

                // Security settings
                ['ENCRYPTION_REQUIRED', 'true'],
                ['AUDIT_LOGGING', 'comprehensive']
            ]),
            mergeStrategy: 'smart', // Preserve existing customizations
            backup: true
        });

        if (result.success) {
            console.log('✅ Legal team installed with custom variables!');

            // Show the processed configuration with substituted variables
            const config = result.configuration;
            console.log('\n🔧 Applied Variables:');
            console.log(`   Jurisdiction: ${config.team_specific_config?.result || 'N/A'}`);
            console.log(`   Output Folder: ${config.output_folder?.result || 'N/A'}`);
            console.log(`   Security Level: ${config.security?.signature_required ? 'High' : 'Standard'}`);

        } else {
            console.error('❌ Installation failed:', result.error);
        }

    } catch (error) {
        console.error('💥 Error:', error.message);
    }
}

/**
 * Example 6: Monitor installation progress
 */
async function monitorInstallationProgress() {
    console.log('\n=== Example 6: Monitor Installation Progress ===\n');

    try {
        const orchestrator = new BMADInstallationOrchestrator();
        await orchestrator.initialize();

        // Start installation in background
        const installationPromise = orchestrator.installTeamModule('strategy-team', {
            environment: 'production'
        });

        // Monitor progress
        const monitorInterval = setInterval(() => {
            const activeSessions = orchestrator.getActiveSessions();

            for (const session of activeSessions) {
                const duration = Math.round(session.duration / 1000);
                console.log(`📊 ${session.teamCode} - Step: ${session.currentStep} - Duration: ${duration}s`);
            }

            if (activeSessions.length === 0) {
                clearInterval(monitorInterval);
            }
        }, 2000);

        // Wait for completion
        const result = await installationPromise;
        clearInterval(monitorInterval);

        console.log(`\n🎉 Installation ${result.success ? 'completed' : 'failed'}!`);

        // Show step details
        if (result.success) {
            console.log('\n📝 Step Summary:');
            const session = orchestrator.getSessionStatus(result.sessionId);
            for (const step of session.steps) {
                const duration = Math.round(step.duration / 1000);
                console.log(`   ${step.name}: ${step.status} (${duration}s)`);
            }
        }

    } catch (error) {
        console.error('💥 Error:', error.message);
    }
}

/**
 * Example 7: Environment-specific configurations
 */
async function environmentSpecificConfigurations() {
    console.log('\n=== Example 7: Environment-Specific Configurations ===\n');

    try {
        const orchestrator = new BMADInstallationOrchestrator();
        await orchestrator.initialize();

        const environments = {
            development: {
                debug: true,
                enableTesting: true,
                securityLevel: 'low',
                networkAccess: false
            },
            production: {
                debug: false,
                enableTesting: false,
                securityLevel: 'high',
                networkAccess: true
            },
            testing: {
                debug: true,
                enableTesting: true,
                securityLevel: 'medium',
                networkAccess: false,
                mockServices: true
            }
        };

        for (const [envName, envConfig] of Object.entries(environments)) {
            console.log(`\n🌍 ${envName.toUpperCase()} Environment:`);

            const result = await orchestrator.installTeamModule('cybersec-team', {
                environment: envName,
                variables: new Map(Object.entries(envConfig)),
                backup: false // Don't backup for examples
            });

            if (result.success) {
                console.log(`   ✅ Configuration generated`);
                console.log(`   📊 Validation Score: ${result.validation?.score || 'N/A'}/100`);

                // Show environment-specific settings
                const config = result.configuration;
                console.log(`   🔧 Debug Mode: ${config._metadata?.environment === 'development' ? 'ON' : 'OFF'}`);
                console.log(`   🔒 Security: ${config.security?.signature_required ? 'HIGH' : 'STANDARD'}`);
            } else {
                console.log(`   ❌ Failed: ${result.error}`);
            }
        }

    } catch (error) {
        console.error('💥 Error:', error.message);
    }
}

/**
 * Run all examples
 */
async function runAllExamples() {
    console.log('🚀 BMAD Installation System - Examples\n');
    console.log('=' .repeat(50));

    const examples = [
        { name: 'Single Team Installation', fn: installSingleTeam },
        { name: 'Bulk Team Installation', fn: installAllTeams },
        { name: 'Configuration Generation', fn: generateConfigurationsOnly },
        { name: 'Installation Validation', fn: validateExistingInstallation },
        { name: 'Custom Variables', fn: customVariableSubstitution },
        { name: 'Progress Monitoring', fn: monitorInstallationProgress },
        { name: 'Environment Configurations', fn: environmentSpecificConfigurations }
    ];

    for (let i = 0; i < examples.length; i++) {
        const example = examples[i];

        try {
            console.log(`\n📖 Running Example ${i + 1}: ${example.name}`);
            console.log('-'.repeat(40));
            await example.fn();

            if (i < examples.length - 1) {
                console.log('\n⏳ Waiting 2 seconds before next example...');
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        } catch (error) {
            console.error(`💥 Example ${i + 1} failed:`, error.message);
        }
    }

    console.log('\n🎉 All examples completed!');
    console.log('=' .repeat(50));
}

// Export examples for individual execution
module.exports = {
    installSingleTeam,
    installAllTeams,
    generateConfigurationsOnly,
    validateExistingInstallation,
    customVariableSubstitution,
    monitorInstallationProgress,
    environmentSpecificConfigurations,
    runAllExamples
};

// Run examples if this file is executed directly
if (require.main === module) {
    runAllExamples().catch(console.error);
}