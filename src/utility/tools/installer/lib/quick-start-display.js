/**
 * Quick Start Guide Display - INST-033
 * Epic 5 - Installation Wizard Enhancement
 *
 * Displays comprehensive quick start guide after successful installation,
 * including module summary, security features, commands, and documentation links.
 *
 * @module installer/lib/quick-start-display
 * @author BMAD Installation Wizard Team
 * @version 1.0.0
 */

import chalk from 'chalk';

// ============================================================================
// Constants
// ============================================================================

export const MODULE_COMMANDS = {
  'cybersec-team': {
    name: 'Cybersecurity Team',
    commands: [
      { description: 'Invoke a penetration tester', command: '/bmad:cybersec-team:agents:penetration-tester' },
      { description: 'Run a security audit', command: '/bmad:cybersec-team:workflows:security-audit' }
    ]
  },
  'intel-team': {
    name: 'Intelligence Team',
    commands: [
      { description: 'Invoke the OSINT lead', command: '/bmad:intel-team:agents:osint-lead' },
      { description: 'Start a campaign', command: '/bmad:intel-team:workflows:campaign-planner-person' }
    ]
  },
  'legal-team': {
    name: 'Legal Team',
    commands: [
      { description: 'Invoke general counsel', command: '/bmad:legal-team:agents:counsel' },
      { description: 'Review a contract', command: '/bmad:legal-team:workflows:contract-review' }
    ]
  },
  'strategy-team': {
    name: 'Strategy Team',
    commands: [
      { description: 'Invoke the strategist', command: '/bmad:strategy-team:agents:the-master-strategist' },
      { description: 'Plan a session', command: '/bmad:strategy-team:workflows:strategic-planning-session' }
    ]
  },
  'bmm': {
    name: 'BMAD Method Module',
    commands: [
      { description: 'Create a PRD', command: '/bmad:bmm:workflows:create-prd' },
      { description: 'Create architecture', command: '/bmad:bmm:workflows:create-architecture' }
    ]
  },
  'core': {
    name: 'Core Module',
    commands: [
      { description: 'Ask Abdul (Project Manager)', command: '/bmad:core:agents:abdul' },
      { description: 'Start Party Mode', command: '/bmad:core:workflows:party-mode' }
    ]
  }
};

export const DOCUMENTATION_LINKS = {
  bmadMethod: {
    name: 'BMAD Method',
    url: 'https://github.com/bmad-project/bmad-method'
  },
  bmadCyber: {
    name: 'BMAD-CYBER',
    url: 'https://github.com/bmad-project/bmad-cyber'
  },
  gettingStarted: {
    name: 'Getting Started Guide',
    url: 'https://github.com/bmad-project/bmad-cyber/blob/main/docs/GETTING-STARTED.md'
  }
};

export const ATTRIBUTION = 'Vibecoded with Claude by blackunicorn.tech';

// ============================================================================
// Box Drawing Characters
// ============================================================================

const BOX = {
  topLeft: '\u2554',
  topRight: '\u2557',
  bottomLeft: '\u255A',
  bottomRight: '\u255D',
  horizontal: '\u2550',
  vertical: '\u2551',
  teeRight: '\u2560',
  teeLeft: '\u2563',
  cross: '\u256C',
  teeDown: '\u2566',
  teeUp: '\u2569',
  light: {
    topLeft: '\u250C',
    topRight: '\u2510',
    bottomLeft: '\u2514',
    bottomRight: '\u2518',
    horizontal: '\u2500',
    vertical: '\u2502',
    teeRight: '\u251C',
    teeLeft: '\u2524',
    cross: '\u253C',
    teeDown: '\u252C',
    teeUp: '\u2534'
  }
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Pad string to specified width
 * @param {string} str - String to pad
 * @param {number} width - Target width
 * @returns {string} Padded string
 */
export function padString(str, width) {
  const strLen = stripAnsi(str).length;
  if (strLen >= width) return str;
  return str + ' '.repeat(width - strLen);
}

/**
 * Strip ANSI escape codes from string
 * @param {string} str - String with ANSI codes
 * @returns {string} Plain string
 */
export function stripAnsi(str) {
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

/**
 * Center text within a given width
 * @param {string} text - Text to center
 * @param {number} width - Total width
 * @returns {string} Centered text
 */
export function centerText(text, width) {
  const textLen = stripAnsi(text).length;
  if (textLen >= width) return text;
  const leftPad = Math.floor((width - textLen) / 2);
  const rightPad = width - textLen - leftPad;
  return ' '.repeat(leftPad) + text + ' '.repeat(rightPad);
}

/**
 * Create a horizontal separator line
 * @param {number} width - Line width
 * @param {string} char - Character to use
 * @returns {string} Separator line
 */
export function createSeparator(width, char = '\u2500') {
  return char.repeat(width);
}

// ============================================================================
// Display Functions
// ============================================================================

/**
 * Display installed modules summary table
 * @param {string[]} enabledModules - Array of enabled module codes
 * @param {object} allModules - Module definitions with metadata
 * @returns {string} Formatted table string
 */
export function displayModuleSummary(enabledModules, allModules) {
  const lines = [];

  const colWidths = {
    module: 16,
    agents: 8,
    workflows: 11,
    status: 9
  };

  lines.push(chalk.cyan('\n\uD83D\uDCE6 Installed Modules:'));

  lines.push(
    BOX.light.topLeft +
    BOX.light.horizontal.repeat(colWidths.module) +
    BOX.light.teeDown +
    BOX.light.horizontal.repeat(colWidths.agents) +
    BOX.light.teeDown +
    BOX.light.horizontal.repeat(colWidths.workflows) +
    BOX.light.teeDown +
    BOX.light.horizontal.repeat(colWidths.status) +
    BOX.light.topRight
  );

  lines.push(
    BOX.light.vertical +
    chalk.bold(padString(' Module', colWidths.module)) +
    BOX.light.vertical +
    chalk.bold(padString(' Agents', colWidths.agents)) +
    BOX.light.vertical +
    chalk.bold(padString(' Workflows', colWidths.workflows)) +
    BOX.light.vertical +
    chalk.bold(padString(' Status', colWidths.status)) +
    BOX.light.vertical
  );

  lines.push(
    BOX.light.teeRight +
    BOX.light.horizontal.repeat(colWidths.module) +
    BOX.light.cross +
    BOX.light.horizontal.repeat(colWidths.agents) +
    BOX.light.cross +
    BOX.light.horizontal.repeat(colWidths.workflows) +
    BOX.light.cross +
    BOX.light.horizontal.repeat(colWidths.status) +
    BOX.light.teeLeft
  );

  for (const moduleCode of enabledModules) {
    const moduleInfo = allModules[moduleCode] || { name: moduleCode, agents: 0, workflows: 0 };
    const agents = moduleInfo.agents || moduleInfo.agentCount || 0;
    const workflows = moduleInfo.workflows || moduleInfo.workflowCount || 0;

    lines.push(
      BOX.light.vertical +
      padString(' ' + moduleCode, colWidths.module) +
      BOX.light.vertical +
      padString(' ' + agents.toString(), colWidths.agents) +
      BOX.light.vertical +
      padString(' ' + workflows.toString(), colWidths.workflows) +
      BOX.light.vertical +
      padString(' ' + chalk.green('\u2713'), colWidths.status) +
      BOX.light.vertical
    );
  }

  lines.push(
    BOX.light.bottomLeft +
    BOX.light.horizontal.repeat(colWidths.module) +
    BOX.light.teeUp +
    BOX.light.horizontal.repeat(colWidths.agents) +
    BOX.light.teeUp +
    BOX.light.horizontal.repeat(colWidths.workflows) +
    BOX.light.teeUp +
    BOX.light.horizontal.repeat(colWidths.status) +
    BOX.light.bottomRight
  );

  return lines.join('\n');
}

/**
 * Display security tier and enabled features
 * @param {string} securityTier - Security tier name
 * @param {object} features - Enabled security features
 * @returns {string} Formatted security summary
 */
export function displaySecuritySummary(securityTier, features) {
  const lines = [];

  const featureList = features ? Object.entries(features).filter(([_, enabled]) => enabled) : [];
  const featureCount = featureList.length;

  lines.push(chalk.cyan('\n\uD83D\uDD12 Security: ') + chalk.bold(securityTier || 'Standard') +
             chalk.dim(` (${featureCount} feature${featureCount !== 1 ? 's' : ''} enabled)`));

  if (featureList.length > 0) {
    const featureNames = featureList.map(([name]) => formatFeatureName(name));
    lines.push(chalk.dim('   Features: ') + featureNames.join(', '));
  }

  return lines.join('\n');
}

/**
 * Format feature name from camelCase to readable format
 * @param {string} name - camelCase feature name
 * @returns {string} Formatted name
 */
export function formatFeatureName(name) {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Display quick start commands based on enabled modules
 * @param {string[]} enabledModules - Array of enabled module codes
 * @returns {string} Formatted commands section
 */
export function displayQuickStartCommands(enabledModules) {
  const lines = [];

  lines.push(chalk.cyan('\n\uD83D\uDE80 Quick Start:'));

  if (enabledModules.includes('core')) {
    const coreCommands = MODULE_COMMANDS.core;
    lines.push(chalk.dim('  \u2022 ') + coreCommands.commands[0].description + ':');
    lines.push(chalk.yellow('    ' + coreCommands.commands[0].command));
  }

  for (const moduleCode of enabledModules) {
    if (moduleCode === 'core') continue;

    const moduleCommands = MODULE_COMMANDS[moduleCode];
    if (moduleCommands && moduleCommands.commands.length > 0) {
      const firstCmd = moduleCommands.commands[0];
      lines.push(chalk.dim('  \u2022 ') + firstCmd.description + ':');
      lines.push(chalk.yellow('    ' + firstCmd.command));
    }
  }

  const teamModules = enabledModules.filter(m =>
    ['cybersec-team', 'intel-team', 'legal-team', 'strategy-team'].includes(m)
  );

  if (teamModules.length >= 2 && enabledModules.includes('core')) {
    lines.push(chalk.dim('  \u2022 ') + 'Start multi-agent Party Mode:');
    lines.push(chalk.yellow('    /bmad:core:workflows:party-mode'));
  }

  return lines.join('\n');
}

/**
 * Display documentation links
 * @returns {string} Formatted documentation links
 */
export function displayDocumentationLinks() {
  const lines = [];

  lines.push(chalk.cyan('\n\uD83D\uDCDA Documentation:'));

  for (const [key, link] of Object.entries(DOCUMENTATION_LINKS)) {
    lines.push(chalk.dim('  \u2022 ') + link.name + ': ' + chalk.blue.underline(link.url));
  }

  return lines.join('\n');
}

/**
 * Display attribution line
 * @returns {string} Formatted attribution
 */
export function displayAttribution() {
  const width = 64;
  const separator = createSeparator(width, '\u2500');

  const lines = [];
  lines.push('\n' + chalk.dim(separator));
  lines.push(chalk.dim(centerText(ATTRIBUTION, width)));
  lines.push(chalk.dim(separator));

  return lines.join('\n');
}

/**
 * Display installation complete banner
 * @returns {string} Formatted banner
 */
export function displayInstallationBanner() {
  const width = 64;
  const title = 'Installation Complete!';

  const lines = [];
  lines.push(
    chalk.cyan(
      BOX.topLeft +
      BOX.horizontal.repeat(width - 2) +
      BOX.topRight
    )
  );
  lines.push(
    chalk.cyan(BOX.vertical) +
    chalk.bold.green(centerText(title, width - 2)) +
    chalk.cyan(BOX.vertical)
  );
  lines.push(
    chalk.cyan(
      BOX.bottomLeft +
      BOX.horizontal.repeat(width - 2) +
      BOX.bottomRight
    )
  );

  return lines.join('\n');
}

// ============================================================================
// Main Display Function
// ============================================================================

/**
 * Display complete quick start guide after installation
 * @param {object} installationResults - Results from installation wizard
 * @param {string[]} installationResults.enabledModules - Array of enabled module codes
 * @param {string} installationResults.securityTier - Selected security tier
 * @param {object} installationResults.features - Enabled security features
 * @param {object} installationResults.allModules - All module definitions
 * @param {object} options - Display options
 * @param {boolean} options.noColor - Disable colors
 * @param {boolean} options.compact - Use compact output
 * @returns {object} Result with formattedOutput string
 */
export function displayQuickStart(installationResults, options = {}) {
  const {
    enabledModules = [],
    securityTier = 'Standard',
    features = {},
    allModules = {}
  } = installationResults || {};

  const output = [];

  output.push(displayInstallationBanner());

  if (enabledModules.length > 0) {
    output.push(displayModuleSummary(enabledModules, allModules));
  }

  output.push(displaySecuritySummary(securityTier, features));

  if (enabledModules.length > 0) {
    output.push(displayQuickStartCommands(enabledModules));
  }

  output.push(displayDocumentationLinks());

  output.push(displayAttribution());

  const formattedOutput = output.join('\n');

  return {
    formattedOutput,
    enabledModules,
    securityTier,
    featureCount: Object.values(features).filter(Boolean).length
  };
}

export default displayQuickStart;
