import { CONFIG } from '../lib/config.js';
import { logger } from '../lib/logger.js';
import { getInstalledVersion, isBmadInstalled } from '../lib/utils.js';

export function versionCommand() {
  console.log(`bmad-cyber CLI v${CONFIG.VERSION}`);

  if (isBmadInstalled()) {
    const installedVersion = getInstalledVersion();
    if (installedVersion) {
      console.log(`Installed framework: v${installedVersion}`);
    } else {
      console.log('Installed framework: version unknown');
    }
  } else {
    console.log('No BMAD-CYBER installation detected in current directory');
  }
}
