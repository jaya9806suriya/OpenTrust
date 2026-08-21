import fs from 'fs';
import path from 'path';

export interface StaticFinding {
  id: string;
  title: string;
  category: 'Dynamic Execution' | 'Process Spawning' | 'Credential Access' | 'Network' | 'Obfuscation' | 'File System';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  location: string;
  line: number;
  snippet: string;
  ruleId: string;
  description: string;
  remediation: string;
}

export interface DependencyInfo {
  name: string;
  version?: string;
  suspicious: boolean;
  reason?: string;
}

export interface StaticInspectionResult {
  findings: StaticFinding[];
  filesScanned: number;
  dependenciesTotal: number;
  dependenciesVulnerable: number;
  dependenciesList: DependencyInfo[];
  license: string;
  licenseStatus: 'Permissive - Cleared for Use' | 'Restrictive - Review Required' | 'No License Detected';
}

// Suspicious patterns to scan across Python, JS, TS
const PATTERN_RULES = [
  {
    regex: /\b(eval\s*\(|exec\s*\(|compile\s*\([^,]+,[^,]+,\s*['"]exec['"]\))/i,
    title: 'Arbitrary Code Execution via eval()/exec()',
    category: 'Dynamic Execution' as const,
    severity: 'High' as const,
    ruleId: 'OT-STATIC-001',
    description: 'Dynamic execution functions can execute untrusted strings at runtime, bypassing static sandboxing controls.',
    remediation: 'Replace dynamic evaluation with explicit parsing or safe functional evaluation.'
  },
  {
    regex: /\b(subprocess\.(run|Popen|call|check_output)|os\.system|child_process\.(exec|execSync|spawn|spawnSync))\s*\(/i,
    title: 'Subprocess & Shell Command Spawning',
    category: 'Process Spawning' as const,
    severity: 'High' as const,
    ruleId: 'OT-STATIC-002',
    description: 'Direct invocation of operating system shell commands can lead to command injection or unauthorized host privilege escalation.',
    remediation: 'Use sanitized API bindings or disallow shell execution in untrusted modules.'
  },
  {
    regex: /\b(os\.getenv|os\.environ|process\.env)\s*(\[|\.get\s*\()\s*['"](AWS_|SECRET|TOKEN|API_KEY|SSH|PASSWORD|PRIVATE_KEY)/i,
    title: 'Environment Credential Harvesting',
    category: 'Credential Access' as const,
    severity: 'High' as const,
    ruleId: 'OT-STATIC-003',
    description: 'The code specifically searches for environment variables containing secrets, tokens, or cloud access keys.',
    remediation: 'Ensure third-party utilities do not directly read sensitive parent process credentials.'
  },
  {
    regex: /\b(socket\.socket|socket\.connect|net\.connect|http\.request|requests\.(post|get|put)|urllib\.request)\s*\(/i,
    title: 'Outbound Network Socket Connection',
    category: 'Network' as const,
    severity: 'Medium' as const,
    ruleId: 'OT-STATIC-004',
    description: 'The module opens raw outbound network sockets or HTTP requests during load or utility operations.',
    remediation: 'Verify whether external network egress is expected and whitelist verified endpoints.'
  },
  {
    regex: /\b(base64\.b64decode|Buffer\.from\([^,]+,\s*['"]base64['"]\))\s*\(/i,
    title: 'Base64 Encoded Payload Deobfuscation',
    category: 'Obfuscation' as const,
    severity: 'Medium' as const,
    ruleId: 'OT-STATIC-005',
    description: 'Base64 decoding followed by runtime execution is a common evasion technique used to mask malicious payloads.',
    remediation: 'Avoid deploying obfuscated payloads in open source packages.'
  },
  {
    regex: /\b(open\s*\([^)]*(\.ssh|id_rsa|\/etc\/passwd|\/etc\/shadow))/i,
    title: 'Sensitive Host File System Access',
    category: 'File System' as const,
    severity: 'Critical' as const,
    ruleId: 'OT-STATIC-006',
    description: 'Direct attempt to read host authentication files, private SSH keys, or system credentials.',
    remediation: 'Block package installation and sandbox execution immediately.'
  }
];

const KNOWN_SUSPICIOUS_PACKAGES = [
  'request', // typosquat of requests
  'colourama', // typosquat of colorama
  'discord-selfbot',
  'setup-tools', // typosquat of setuptools
  'crypto-helper-internal'
];

export async function runStaticInspection(
  workspacePath: string,
  fileList: string[]
): Promise<StaticInspectionResult> {
  const findings: StaticFinding[] = [];
  let filesScanned = 0;
  const dependenciesList: DependencyInfo[] = [];

  for (const relFile of fileList) {
    const fullPath = path.join(workspacePath, relFile);
    if (!fs.existsSync(fullPath)) continue;

    // Skip test fixtures or mock files from high false-positive flagging
    const isTestFixture = relFile.includes('tests/') || relFile.includes('test/') || relFile.includes('docs/');

    const ext = path.extname(relFile).toLowerCase();
    const isCode = ['.py', '.js', '.ts', '.jsx', '.tsx', '.sh', '.bash'].includes(ext);

    if (isCode) {
      filesScanned++;
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');

        lines.forEach((lineText, lineIdx) => {
          // Skip pure comment lines
          const trimmed = lineText.trim();
          if (trimmed.startsWith('#') || trimmed.startsWith('//') || trimmed.startsWith('*')) return;

          for (const rule of PATTERN_RULES) {
            if (rule.regex.test(lineText)) {
              // If it's a test file, lower severity or skip minor network calls
              if (isTestFixture && (rule.category === 'Network' || rule.category === 'Process Spawning')) {
                continue;
              }

              findings.push({
                id: `FND-${findings.length + 1}-${rule.ruleId}`,
                title: rule.title,
                category: rule.category,
                severity: rule.severity,
                location: `${relFile}:${lineIdx + 1}`,
                line: lineIdx + 1,
                snippet: lineText.trim().slice(0, 140),
                ruleId: rule.ruleId,
                description: rule.description,
                remediation: rule.remediation
              });
            }
          }
        });
      } catch (err) {
        console.warn(`Error scanning file ${relFile}:`, err);
      }
    }

    // Parse Requirements.txt or pyproject.toml
    if (relFile.toLowerCase().endsWith('requirements.txt') || relFile.toLowerCase().includes('requirements')) {
      try {
        const reqContent = fs.readFileSync(fullPath, 'utf8');
        const reqLines = reqContent.split('\n');
        for (const line of reqLines) {
          const trimmed = line.trim().split('#')[0].split(/[==|>=|<=|<|>|~=]/)[0].trim();
          if (trimmed && !trimmed.startsWith('-') && !trimmed.startsWith('[')) {
            const isSus = KNOWN_SUSPICIOUS_PACKAGES.includes(trimmed.toLowerCase());
            dependenciesList.push({
              name: trimmed,
              suspicious: isSus,
              reason: isSus ? 'Matches known typo-squatting or high-risk package pattern' : undefined
            });
          }
        }
      } catch (e) {
        console.warn('Error reading requirements.txt', e);
      }
    }

    // Parse package.json
    if (relFile.toLowerCase().endsWith('package.json')) {
      try {
        const pkgContent = fs.readFileSync(fullPath, 'utf8');
        const pkg = JSON.parse(pkgContent);
        const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
        for (const dep of Object.keys(allDeps)) {
          const isSus = KNOWN_SUSPICIOUS_PACKAGES.some(p => dep.toLowerCase().includes(p));
          dependenciesList.push({
            name: dep,
            version: allDeps[dep],
            suspicious: isSus,
            reason: isSus ? 'Suspicious package signature' : undefined
          });
        }
      } catch (e) {
        console.warn('Error reading package.json', e);
      }
    }
  }

  // Detect License
  let license = 'Unknown';
  let licenseStatus: StaticInspectionResult['licenseStatus'] = 'No License Detected';

  const licenseFile = fileList.find(f => f.toUpperCase().includes('LICENSE'));
  if (licenseFile) {
    try {
      const licText = fs.readFileSync(path.join(workspacePath, licenseFile), 'utf8');
      if (/MIT/i.test(licText)) {
        license = 'MIT';
        licenseStatus = 'Permissive - Cleared for Use';
      } else if (/Apache/i.test(licText)) {
        license = 'Apache-2.0';
        licenseStatus = 'Permissive - Cleared for Use';
      } else if (/BSD/i.test(licText)) {
        license = 'BSD-3-Clause';
        licenseStatus = 'Permissive - Cleared for Use';
      } else if (/GPL/i.test(licText)) {
        license = 'GPL-3.0';
        licenseStatus = 'Restrictive - Review Required';
      } else {
        license = 'Custom / Proprietary';
        licenseStatus = 'Restrictive - Review Required';
      }
    } catch {
      license = 'Unknown';
    }
  }

  const vulnerableDeps = dependenciesList.filter(d => d.suspicious).length;

  return {
    findings,
    filesScanned,
    dependenciesTotal: dependenciesList.length,
    dependenciesVulnerable: vulnerableDeps,
    dependenciesList,
    license,
    licenseStatus
  };
}
