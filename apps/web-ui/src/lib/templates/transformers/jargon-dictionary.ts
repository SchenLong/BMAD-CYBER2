/**
 * Jargon Dictionary
 * Story 7.2: Executive Brief Template
 *
 * Technical to business term translation dictionary.
 * Maps cybersecurity and technical jargon to business-friendly language.
 */

/**
 * Jargon translation entry
 */
export interface JargonEntry {
  /** Technical term or phrase */
  technical: string
  /** Business-friendly translation */
  business: string
  /** Category for organization */
  category: 'vulnerability' | 'security' | 'network' | 'compliance' | 'general' | 'encryption'
}

/**
 * Comprehensive jargon dictionary for executive-friendly content
 */
export const JARGON_DICTIONARY: JargonEntry[] = [
  // Vulnerabilities
  { technical: 'SQL injection', business: 'Database security weakness', category: 'vulnerability' },
  { technical: 'SQL injection vulnerability', business: 'Database security weakness', category: 'vulnerability' },
  { technical: 'XSS', business: 'Form input security issue', category: 'vulnerability' },
  { technical: 'Cross-site scripting', business: 'Form input security issue', category: 'vulnerability' },
  { technical: 'CSRF', business: 'Unauthorized action risk', category: 'vulnerability' },
  { technical: 'Cross-site request forgery', business: 'Unauthorized action risk', category: 'vulnerability' },
  { technical: 'RCE', business: 'Remote system control risk', category: 'vulnerability' },
  { technical: 'Remote code execution', business: 'Remote system control risk', category: 'vulnerability' },
  { technical: 'buffer overflow', business: 'Memory handling vulnerability', category: 'vulnerability' },
  { technical: 'zero-day', business: 'Unknown security flaw', category: 'vulnerability' },

  // Security
  { technical: 'authentication bypass', business: 'Access control weakness', category: 'security' },
  { technical: 'privilege escalation', business: 'Excessive access permissions', category: 'security' },
  { technical: 'RBAC', business: 'Access control settings', category: 'security' },
  { technical: 'Role-based access control', business: 'Access control settings', category: 'security' },
  { technical: 'MFA', business: 'Multi-step verification', category: 'security' },
  { technical: 'Multi-factor authentication', business: 'Multi-step verification', category: 'security' },
  { technical: '2FA', business: 'Two-step verification', category: 'security' },
  { technical: 'Two-factor authentication', business: 'Two-step verification', category: 'security' },
  { technical: 'SSO', business: 'Single login system', category: 'security' },
  { technical: 'Single sign-on', business: 'Single login system', category: 'security' },
  { technical: 'brute force', business: 'Repeated password attempts', category: 'security' },
  { technical: 'credential stuffing', business: 'Reusing leaked passwords', category: 'security' },

  // Network
  { technical: 'DDoS', business: 'Service overload attack', category: 'network' },
  { technical: 'Distributed denial of service', business: 'Service overload attack', category: 'network' },
  { technical: 'DoS', business: 'Service disruption', category: 'network' },
  { technical: 'Denial of service', business: 'Service disruption', category: 'network' },
  { technical: 'MITM', business: 'Data interception', category: 'network' },
  { technical: 'Man-in-the-middle', business: 'Data interception', category: 'network' },
  { technical: 'packet sniffing', business: 'Network data monitoring', category: 'network' },
  { technical: 'port scanning', business: 'Network access point discovery', category: 'network' },
  { technical: 'firewall rules', business: 'Network access filters', category: 'network' },
  { technical: 'ACL', business: 'Access list', category: 'network' },
  { technical: 'Access control list', business: 'Access list', category: 'network' },

  // Encryption
  { technical: 'TLS 1.2', business: 'Outdated encryption protocol', category: 'encryption' },
  { technical: 'TLS 1.3', business: 'Current encryption standard', category: 'encryption' },
  { technical: 'SSL', business: 'Outdated security protocol', category: 'encryption' },
  { technical: 'AES-256', business: 'Strong encryption standard', category: 'encryption' },
  { technical: 'encryption at rest', business: 'Stored data protection', category: 'encryption' },
  { technical: 'encryption in transit', business: 'Data transfer protection', category: 'encryption' },
  { technical: 'end-to-end encryption', business: 'Full message protection', category: 'encryption' },
  { technical: 'certificate', business: 'Digital identity verification', category: 'encryption' },
  { technical: 'PKI', business: 'Digital certificate system', category: 'encryption' },
  { technical: 'Public key infrastructure', business: 'Digital certificate system', category: 'encryption' },

  // Compliance
  { technical: 'GDPR', business: 'European privacy regulation', category: 'compliance' },
  { technical: 'HIPAA', business: 'Healthcare privacy regulation', category: 'compliance' },
  { technical: 'SOC 2', business: 'Security control standard', category: 'compliance' },
  { technical: 'PCI DSS', business: 'Payment card security standard', category: 'compliance' },
  { technical: 'NIST', business: 'US security standards framework', category: 'compliance' },
  { technical: 'ISO 27001', business: 'International security standard', category: 'compliance' },
  { technical: 'compliance gap', business: 'Regulatory shortfall', category: 'compliance' },
  { technical: 'audit trail', business: 'Activity record', category: 'compliance' },
  { technical: 'audit log', business: 'Activity record', category: 'compliance' },

  // General Technical
  { technical: 'API', business: 'System connection interface', category: 'general' },
  { technical: 'Application programming interface', business: 'System connection interface', category: 'general' },
  { technical: 'API rate limiting', business: 'Usage controls', category: 'general' },
  { technical: 'rate limiting', business: 'Usage limits', category: 'general' },
  { technical: 'endpoint', business: 'Device or connection point', category: 'general' },
  { technical: 'payload', business: 'Data content', category: 'general' },
  { technical: 'hash', business: 'Digital fingerprint', category: 'general' },
  { technical: 'SHA-256', business: 'Digital fingerprint method', category: 'general' },
  { technical: 'exfiltration', business: 'Unauthorized data transfer', category: 'general' },
  { technical: 'data breach', business: 'Unauthorized data access', category: 'general' },
  { technical: 'phishing', business: 'Deceptive emails', category: 'general' },
  { technical: 'spear phishing', business: 'Targeted deceptive emails', category: 'general' },
  { technical: 'malware', business: 'Harmful software', category: 'general' },
  { technical: 'ransomware', business: 'Data-holding software', category: 'general' },
  { technical: 'spyware', business: 'Monitoring software', category: 'general' },
  { technical: 'rootkit', business: 'Hidden access software', category: 'general' },
  { technical: 'backdoor', business: 'Hidden access method', category: 'general' },
  { technical: 'exploit', business: 'Vulnerability use', category: 'general' },
  { technical: 'vulnerability scan', business: 'Security weakness check', category: 'general' },
  { technical: 'penetration test', business: 'Authorized security testing', category: 'general' },
  { technical: 'pen test', business: 'Authorized security testing', category: 'general' },
  { technical: 'threat intelligence', business: 'Security threat information', category: 'general' },
  { technical: 'SIEM', business: 'Security monitoring system', category: 'general' },
  { technical: 'intrusion detection', business: 'Unauthorized access alert', category: 'general' },
  { technical: 'IDS', business: 'Unauthorized access alert system', category: 'general' },
  { technical: 'intrusion prevention', business: 'Unauthorized access blocking', category: 'general' },
  { technical: 'IPS', business: 'Unauthorized access blocking system', category: 'general' },
  { technical: 'patch management', business: 'Software update process', category: 'general' },
  { technical: 'vulnerability assessment', business: 'Security weakness evaluation', category: 'general' },
  { technical: 'attack surface', business: 'Exposure area', category: 'general' },
  { technical: 'attack vector', business: 'Attack method', category: 'general' },
  { technical: 'threat actor', business: 'Attacker', category: 'general' },
  { technical: 'APT', business: 'Persistent attacker', category: 'general' },
  { technical: 'Advanced persistent threat', business: 'Persistent attacker', category: 'general' },
  { technical: 'social engineering', business: 'People manipulation', category: 'general' },
  { technical: 'watering hole', business: 'Compromised trusted site', category: 'general' },
  { technical: 'supply chain attack', business: 'Vendor-related attack', category: 'general' },
]

/**
 * Acronym expansion dictionary
 * Expands common acronyms on first use
 */
export const ACRONYM_EXPANSIONS: Record<string, string> = {
  'SQL': 'Structured Query Language',
  'XSS': 'Cross-Site Scripting',
  'CSRF': 'Cross-Site Request Forgery',
  'RCE': 'Remote Code Execution',
  'RBAC': 'Role-Based Access Control',
  'MFA': 'Multi-Factor Authentication',
  '2FA': 'Two-Factor Authentication',
  'SSO': 'Single Sign-On',
  'DDoS': 'Distributed Denial of Service',
  'DoS': 'Denial of Service',
  'MITM': 'Man-In-The-Middle',
  'TLS': 'Transport Layer Security',
  'SSL': 'Secure Sockets Layer',
  'AES': 'Advanced Encryption Standard',
  'PKI': 'Public Key Infrastructure',
  'GDPR': 'General Data Protection Regulation',
  'HIPAA': 'Health Insurance Portability and Accountability Act',
  'SOC': 'Service Organization Control',
  'PCI': 'Payment Card Industry',
  'DSS': 'Data Security Standard',
  'NIST': 'National Institute of Standards and Technology',
  'ISO': 'International Organization for Standardization',
  'API': 'Application Programming Interface',
  'SHA': 'Secure Hash Algorithm',
  'SIEM': 'Security Information and Event Management',
  'IDS': 'Intrusion Detection System',
  'IPS': 'Intrusion Prevention System',
  'APT': 'Advanced Persistent Threat',
}

/**
 * Find a jargon translation for a technical term
 * @param technical - The technical term to translate
 * @returns The business-friendly translation or undefined if not found
 */
export function findTranslation(technical: string): string | undefined {
  const normalized = technical.toLowerCase()
  return JARGON_DICTIONARY.find((entry) =>
    entry.technical.toLowerCase() === normalized
  )?.business
}

/**
 * Find all jargon translations in text
 * @param text - The text to search for jargon
 * @returns Map of original terms to their translations
 */
export function findAllTranslations(text: string): Map<string, string> {
  const translations = new Map<string, string>()

  for (const entry of JARGON_DICTIONARY) {
    const regex = new RegExp(`\\b${entry.technical}\\b`, 'gi')
    if (regex.test(text)) {
      translations.set(entry.technical, entry.business)
    }
  }

  return translations
}

/**
 * Get acronym expansion
 * @param acronym - The acronym to expand
 * @returns The expanded form or undefined if not found
 */
export function expandAcronym(acronym: string): string | undefined {
  return ACRONYM_EXPANSIONS[acronym.toUpperCase()]
}
