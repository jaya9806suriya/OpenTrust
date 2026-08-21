import { AnalysisSession, EventLog, PipelineStage, CodeFinding, RiskFlag, ScoreItem } from '../types';

export const initialSuspiciousSession: AnalysisSession = {
  id: 'ANL-7749-X',
  targetRepo: 'suspicious-demo',
  repoUrl: 'https://github.com/opentrust-demo/crypto-helper',
  repoType: 'github',
  status: 'running',
  verdict: 'BLOCK',
  trustScore: 28,
  filesScanned: 124,
  elapsedSeconds: 42,
  currentStageIndex: 2, // Sandbox running
  generatedAt: '2 mins ago',
  executiveSummary: 'Our behavioral analysis engine detected anomalous lateral movement patterns during the sandboxed execution phase. The package attempts to obfuscate its payload and establishes unauthorized connections to known sinkhole IPs.',
  riskFlags: [
    {
      id: 'rf-1',
      title: 'Sensitive File Access',
      details: '/etc/shadow, ~/.ssh/id_rsa',
      type: 'error',
      icon: 'folder_off'
    },
    {
      id: 'rf-2',
      title: 'Network Egress Anomalies',
      details: 'Outbound TCP:443 to 185.199.x.x',
      type: 'error',
      icon: 'router'
    }
  ],
  recommendedAction: 'Do not deploy or execute this artifact. Quarantine the repository and conduct a manual review of the recent commit history for injected dependencies.',
  license: 'MIT',
  licenseStatus: 'Permissive - Cleared for Use',
  dependenciesTotal: 15,
  dependenciesVulnerable: 2,
  scoreBreakdown: [
    { label: 'Base Score', points: 100, color: 'primary' },
    { label: 'Static Findings', points: -20, color: 'tertiary' },
    { label: 'Sensitive File Access', points: -40, color: 'error' },
    { label: 'Network Attempt', points: -20, color: 'tertiary' },
    { label: 'Suspicious Process', points: -15, color: 'tertiary' },
  ],
  codeFindings: [
    {
      id: 'cf-1',
      title: 'Dynamic Execution Pattern Detected',
      location: 'eval() usage in core/parser.js:42',
      severity: 'Critical',
      description: 'Arbitrary execution string passed to eval() function without sanitization.',
      ruleId: 'SEC_DYN_EVAL_01',
      snippet: 'const execBuffer = Buffer.from(rawPayload, "base64").toString();\neval(execBuffer); // [CRITICAL TRIGGER]',
      remediation: 'Replace dynamic eval() with structured JSON AST parsing or deterministic parser grammars.'
    },
    {
      id: 'cf-2',
      title: 'Obfuscated Strings',
      location: 'Base64 encoded payload in init.py',
      severity: 'Critical',
      description: 'Hidden string constant decoding into active executable subprocess invoker.',
      ruleId: 'SEC_OBFUSC_STR_09',
      snippet: 'import base64\n_p = base64.b64decode("aW1wb3J0IHNvY2tldCxvcyxwdHk=")\nexec(_p)',
      remediation: 'Strip all obfuscated string constants and declare clear dependencies.'
    }
  ],
  stages: [
    {
      id: 'stage-1',
      stageNumber: 'STAGE 01',
      name: 'INTAKE',
      status: 'completed',
      icon: 'download',
      description: 'Repository cloned and archive checksums verified.'
    },
    {
      id: 'stage-2',
      stageNumber: 'STAGE 02',
      name: 'INSPECT',
      status: 'completed',
      icon: 'shield',
      description: 'AST parsed, dependency graph indexed and checked against CVE feeds.'
    },
    {
      id: 'stage-3',
      stageNumber: 'STAGE 03',
      name: 'SANDBOX',
      status: 'running',
      icon: 'terminal',
      description: 'Isolated container spinning with runtime kernel probes (eBPF) attached.'
    },
    {
      id: 'stage-4',
      stageNumber: 'STAGE 04',
      name: 'OBSERVE',
      status: 'pending',
      icon: 'visibility',
      description: 'Tracing network egress sockets, filesystem hooks, and child process trees.'
    },
    {
      id: 'stage-5',
      stageNumber: 'STAGE 05',
      name: 'EXPLAIN',
      status: 'pending',
      icon: 'description',
      description: 'AI model synthesizes forensic timeline into natural language security report.'
    },
    {
      id: 'stage-6',
      stageNumber: 'STAGE 06',
      name: 'TRUST SCORE',
      status: 'pending',
      icon: 'verified',
      description: 'Calculating final mathematical trust risk score and quarantine recommendations.'
    }
  ],
  events: [
    {
      id: 'evt-1',
      time: '12:04:21',
      category: 'Environment',
      severity: 'HIGH',
      title: 'Attempted access to AWS_SECRET_ACCESS_KEY',
      details: 'PID: 8492 | User: daemon | Path: /var/run/secrets/...',
      pid: 8492,
      user: 'daemon',
      path: '/var/run/secrets/aws_creds',
      timestamp: 1
    },
    {
      id: 'evt-2',
      time: '12:04:22',
      category: 'File',
      severity: 'HIGH',
      title: 'Attempted access to /etc/shadow',
      details: 'bash -c "cat /etc/shadow > /tmp/out"',
      command: 'bash -c "cat /etc/shadow > /tmp/out"',
      timestamp: 2
    },
    {
      id: 'evt-3',
      time: '12:04:23',
      category: 'Network',
      severity: 'MEDIUM',
      title: 'Outbound connection to unknown IP',
      details: 'Destination: 185.199.108.153:443 | Proto: TCP',
      destination: '185.199.108.153:443',
      timestamp: 3
    },
    {
      id: 'evt-4',
      time: '12:04:28',
      category: 'Process',
      severity: 'LOW',
      title: 'New child process spawned',
      details: 'Parent: node (PID 102) -> Child: sh (PID 145)',
      pid: 145,
      command: 'node (PID 102) -> sh (PID 145)',
      timestamp: 4
    }
  ]
};

export const safeDemoSession: AnalysisSession = {
  id: 'ANL-3182-A',
  targetRepo: 'safe-utils',
  repoUrl: 'https://github.com/opentrust-demo/safe-utils',
  repoType: 'github',
  status: 'completed',
  verdict: 'TRUST',
  trustScore: 94,
  filesScanned: 86,
  elapsedSeconds: 24,
  currentStageIndex: 5,
  generatedAt: 'Just now',
  executiveSummary: 'Verified clean repository. Code inspection and sandboxed behavioral execution showed strictly benign utility operations with zero unauthorized network egress and clean memory bounds.',
  riskFlags: [
    {
      id: 'rf-safe-1',
      title: 'Benign Network Activity',
      details: 'Zero unauthorized outbound socket connections detected.',
      type: 'info',
      icon: 'check_circle'
    },
    {
      id: 'rf-safe-2',
      title: 'Clean Filesystem Bounds',
      details: 'Scoped read/write restricted entirely to local workspace directory.',
      type: 'info',
      icon: 'shield_check'
    }
  ],
  recommendedAction: 'Artifact verified as safe. Meets all compliance policies for automated build pipelines and deployment.',
  license: 'Apache-2.0',
  licenseStatus: 'Permissive - Cleared for Enterprise Use',
  dependenciesTotal: 12,
  dependenciesVulnerable: 0,
  scoreBreakdown: [
    { label: 'Base Score', points: 100, color: 'primary' },
    { label: 'Static Clean Baseline', points: 0, color: 'primary' },
    { label: 'Strict Sandboxed Isolation', points: 0, color: 'primary' },
    { label: 'Unpinned Transitive Dep Minor', points: -6, color: 'tertiary' },
  ],
  codeFindings: [
    {
      id: 'cf-safe-1',
      title: 'Clean AST Validation',
      location: 'src/formatters/text.ts:18',
      severity: 'Low',
      description: 'Standard TypeScript type guards and defensive parameter bounds checked.',
      ruleId: 'SEC_CLEAN_01',
      snippet: 'export function sanitizeInput(str: string): string {\n  return str.replace(/[^a-zA-Z0-9_-]/g, "");\n}',
      remediation: 'No remediation required.'
    }
  ],
  stages: [
    {
      id: 'stage-1',
      stageNumber: 'STAGE 01',
      name: 'INTAKE',
      status: 'completed',
      icon: 'download',
      description: 'Repository cloned and verified.'
    },
    {
      id: 'stage-2',
      stageNumber: 'STAGE 02',
      name: 'INSPECT',
      status: 'completed',
      icon: 'shield',
      description: 'Dependencies verified with 0 known CVEs.'
    },
    {
      id: 'stage-3',
      stageNumber: 'STAGE 03',
      name: 'SANDBOX',
      status: 'completed',
      icon: 'terminal',
      description: 'Sandbox container executed unit tests cleanly.'
    },
    {
      id: 'stage-4',
      stageNumber: 'STAGE 04',
      name: 'OBSERVE',
      status: 'completed',
      icon: 'visibility',
      description: 'No foreign syscalls or unauthorized privilege escalations.'
    },
    {
      id: 'stage-5',
      stageNumber: 'STAGE 05',
      name: 'EXPLAIN',
      status: 'completed',
      icon: 'description',
      description: 'Automated policy passed.'
    },
    {
      id: 'stage-6',
      stageNumber: 'STAGE 06',
      name: 'TRUST SCORE',
      status: 'completed',
      icon: 'verified',
      description: 'Verified with Trust Score 94/100.'
    }
  ],
  events: [
    {
      id: 'evt-s-1',
      time: '12:01:05',
      category: 'Process',
      severity: 'LOW',
      title: 'Unit test suite initialized',
      details: 'npm test -- --coverage | Exit Code: 0',
      timestamp: 1
    },
    {
      id: 'evt-s-2',
      time: '12:01:09',
      category: 'File',
      severity: 'LOW',
      title: 'Ephemeral build cache written',
      details: 'Wrote 14 KB to /tmp/build-cache',
      timestamp: 2
    },
    {
      id: 'evt-s-3',
      time: '12:01:14',
      category: 'Environment',
      severity: 'LOW',
      title: 'Environment variables isolated',
      details: 'Verified no host environment leaks into sandbox',
      timestamp: 3
    }
  ]
};

export const sampleRepositories = [
  {
    name: 'safe-utils',
    url: 'https://github.com/opentrust-demo/safe-utils',
    score: 94,
    status: 'TRUST',
    type: 'Safe Utility Library',
    date: '10 mins ago'
  },
  {
    name: 'crypto-helper',
    url: 'https://github.com/opentrust-demo/crypto-helper',
    score: 28,
    status: 'BLOCK',
    type: 'Suspicious Web3 Helper',
    date: '2 mins ago'
  },
  {
    name: 'data-pipe-engine',
    url: 'https://github.com/acme-corp/data-pipe-engine',
    score: 88,
    status: 'TRUST',
    type: 'ETL Pipeline',
    date: '2 hours ago'
  },
  {
    name: 'auth-plugin-v2',
    url: 'https://github.com/community/auth-plugin-v2',
    score: 62,
    status: 'REVIEW',
    type: 'Auth Middleware',
    date: '1 day ago'
  }
];
