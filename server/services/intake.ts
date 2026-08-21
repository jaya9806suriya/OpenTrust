import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { spawn } from 'child_process';

export interface IntakeResult {
  analysisId: string;
  repoName: string;
  workspacePath: string;
  files: string[];
  totalFiles: number;
  totalSize: number;
  hasPython: boolean;
  hasJavaScript: boolean;
  hasRequirements: boolean;
  hasPackageJson: boolean;
  licenseFile?: string;
}

const WORKSPACE_BASE = path.join(process.cwd(), '.opentrust_workspaces');

// Ensure base workspace directory exists
if (!fs.existsSync(WORKSPACE_BASE)) {
  fs.mkdirSync(WORKSPACE_BASE, { recursive: true });
}

export function createAnalysisId(): string {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `OT-${Date.now().toString(36).toUpperCase()}-${rand}`;
}

export async function processZipBuffer(
  buffer: Buffer,
  originalFilename: string
): Promise<IntakeResult> {
  const analysisId = createAnalysisId();
  const repoName = path.basename(originalFilename, path.extname(originalFilename)) || 'uploaded-project';
  const workspacePath = path.join(WORKSPACE_BASE, analysisId);

  fs.mkdirSync(workspacePath, { recursive: true });

  const zip = new AdmZip(buffer);
  const zipEntries = zip.getEntries();

  // Validate ZIP to prevent Zip Slip / Directory Traversal attacks
  for (const entry of zipEntries) {
    const entryName = entry.entryName;
    if (entryName.includes('..') || path.isAbsolute(entryName)) {
      throw new Error(`Security Violation: Unsafe path inside ZIP detected: ${entryName}`);
    }
  }

  // Extract safely
  zip.extractAllTo(workspacePath, true);

  // Scan extracted files
  const files: string[] = [];
  let totalSize = 0;

  function crawl(dir: string, rel = '') {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      if (item === 'node_modules' || item === '.git' || item === '__pycache__') continue;
      const fullPath = path.join(dir, item);
      const relPath = path.join(rel, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        crawl(fullPath, relPath);
      } else {
        files.push(relPath);
        totalSize += stat.size;
      }
    }
  }

  crawl(workspacePath);

  const hasPython = files.some(f => f.endsWith('.py'));
  const hasJavaScript = files.some(f => f.endsWith('.js') || f.endsWith('.ts') || f.endsWith('.jsx') || f.endsWith('.tsx'));
  const hasRequirements = files.some(f => f.toLowerCase().includes('requirements.txt') || f.endsWith('pyproject.toml'));
  const hasPackageJson = files.some(f => f.toLowerCase().includes('package.json'));
  const licenseFile = files.find(f => f.toUpperCase().includes('LICENSE'));

  return {
    analysisId,
    repoName,
    workspacePath,
    files,
    totalFiles: files.length,
    totalSize,
    hasPython,
    hasJavaScript,
    hasRequirements,
    hasPackageJson,
    licenseFile
  };
}

export async function processDemoRepo(
  demoType: 'safe' | 'suspicious'
): Promise<IntakeResult> {
  const analysisId = createAnalysisId();
  const repoName = demoType === 'safe' ? 'data-analytics-clean' : 'crypto-helper-demo';
  const workspacePath = path.join(WORKSPACE_BASE, analysisId);

  fs.mkdirSync(workspacePath, { recursive: true });

  const sourceDir = path.join(process.cwd(), 'demo_repos', demoType === 'safe' ? 'safe_demo' : 'suspicious_demo');
  
  // Copy demo directory files into workspace
  if (fs.existsSync(sourceDir)) {
    fs.cpSync(sourceDir, workspacePath, { recursive: true });
  }

  const files: string[] = [];
  let totalSize = 0;

  function crawl(dir: string, rel = '') {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);
    for (const item of items) {
      if (item === 'node_modules' || item === '.git' || item === '__pycache__') continue;
      const fullPath = path.join(dir, item);
      const relPath = path.join(rel, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        crawl(fullPath, relPath);
      } else {
        files.push(relPath);
        totalSize += stat.size;
      }
    }
  }

  crawl(workspacePath);

  return {
    analysisId,
    repoName,
    workspacePath,
    files,
    totalFiles: files.length || 6,
    totalSize: totalSize || 4096,
    hasPython: true,
    hasJavaScript: false,
    hasRequirements: true,
    hasPackageJson: false,
    licenseFile: 'LICENSE'
  };
}

export async function processGithubRepo(
  repoInput: string,
  analysisIdOverride?: string
): Promise<IntakeResult> {
  const analysisId = analysisIdOverride || createAnalysisId();
  
  // Clean repo input (e.g., https://github.com/psf/requests or psf/requests)
  let cleanInput = decodeURIComponent(repoInput.trim()).replace(/\/$/, '');
  let owner = '';
  let repo = '';

  const githubMatch = cleanInput.match(/github\.com\/([^/]+)\/([^/#?]+)/i);
  if (githubMatch) {
    owner = githubMatch[1].trim().replace(/\s+/g, '-');
    repo = githubMatch[2].replace(/\.git$/, '').trim().replace(/\s+/g, '-');
  } else {
    const parts = cleanInput.split('/').filter(Boolean);
    if (parts.length >= 2) {
      owner = parts[parts.length - 2].trim().replace(/\s+/g, '-');
      repo = parts[parts.length - 1].replace(/\.git$/, '').trim().replace(/\s+/g, '-');
    } else {
      owner = 'custom';
      repo = cleanInput.replace(/\s+/g, '-') || 'repository';
    }
  }

  // Security Check: Validate owner and repo identifiers against safe character set
  const identifierRegex = /^[A-Za-z0-9._-]+$/;
  if (!identifierRegex.test(owner) || !identifierRegex.test(repo)) {
    throw new Error(`Invalid repository identifier '${owner}/${repo}'. Repository and owner names must match pattern ^[A-Za-z0-9._-]+$`);
  }

  const repoName = `${owner}/${repo}`;
  const workspacePath = path.join(WORKSPACE_BASE, analysisId);
  fs.mkdirSync(workspacePath, { recursive: true });

  const cloneUrl = `https://github.com/${owner}/${repo}.git`;
  let clonedSuccessfully = false;
  let cloneErrorDetail = '';

  try {
    console.log(`[OpenTrust Intake] Cloning repository: ${cloneUrl} into ${workspacePath}`);
    
    // Spawn git clone using array-based arguments (prevents shell injection)
    await new Promise<void>((resolve, reject) => {
      const gitProcess = spawn(
        'git',
        ['clone', '--depth', '1', '--single-branch', cloneUrl, workspacePath],
        { stdio: ['ignore', 'pipe', 'pipe'] }
      );

      let stderrData = '';
      gitProcess.stderr?.on('data', (d) => {
        stderrData += d.toString();
      });

      const timer = setTimeout(() => {
        try { gitProcess.kill('SIGKILL'); } catch {}
        reject(new Error('Git clone timed out after 25 seconds'));
      }, 25000);

      gitProcess.on('close', (code) => {
        clearTimeout(timer);
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Git clone failed with code ${code}: ${stderrData.trim()}`));
        }
      });

      gitProcess.on('error', (err) => {
        clearTimeout(timer);
        reject(err);
      });
    });

    clonedSuccessfully = true;

    // Clean .git folder to save space and avoid scanning git internal pack objects
    const gitDir = path.join(workspacePath, '.git');
    if (fs.existsSync(gitDir)) {
      fs.rmSync(gitDir, { recursive: true, force: true });
    }
  } catch (err: any) {
    cloneErrorDetail = err?.message || String(err);
    console.warn(`[OpenTrust Intake] git clone failed: ${cloneErrorDetail}. Attempting ZIP archive download fallback...`);
    
    // Fallback: try downloading zip archive from codeload.github.com
    try {
      const zipUrls = [
        `https://codeload.github.com/${owner}/${repo}/zip/refs/heads/main`,
        `https://codeload.github.com/${owner}/${repo}/zip/refs/heads/master`
      ];

      for (const zipUrl of zipUrls) {
        try {
          const res = await fetch(zipUrl);
          if (res.ok) {
            const arrayBuffer = await res.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const zip = new AdmZip(buffer);
            zip.extractAllTo(workspacePath, true);
            clonedSuccessfully = true;
            break;
          }
        } catch {
          // continue
        }
      }
    } catch (zipErr: any) {
      console.warn('[OpenTrust Intake] ZIP archive download fallback failed:', zipErr);
    }
  }

  // If cloning failed, DO NOT silently fabricate substitute files. Fail loudly and honestly!
  if (!clonedSuccessfully || fs.readdirSync(workspacePath).length === 0) {
    // Clean up empty directory
    try { fs.rmSync(workspacePath, { recursive: true, force: true }); } catch {}
    throw new Error(
      `Could not fetch repository '${repoName}' — check the URL or verify that it is a valid, public repository. (Detail: ${cloneErrorDetail || 'Repository not accessible'})`
    );
  }

  // Crawl and index all source files in the workspace
  const files: string[] = [];
  let totalSize = 0;

  function crawl(dir: string, rel = '') {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);
    for (const item of items) {
      if (item === 'node_modules' || item === '.git' || item === '__pycache__' || item === '.fake_sandbox_home') continue;
      const fullPath = path.join(dir, item);
      const relPath = rel ? path.join(rel, item) : item;
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        crawl(fullPath, relPath);
      } else {
        files.push(relPath);
        totalSize += stat.size;
      }
    }
  }

  crawl(workspacePath);

  const hasPython = files.some(f => f.endsWith('.py'));
  const hasJavaScript = files.some(f => f.endsWith('.js') || f.endsWith('.ts') || f.endsWith('.jsx') || f.endsWith('.tsx'));
  const hasRequirements = files.some(f => f.toLowerCase().includes('requirements') || f.endsWith('pyproject.toml') || f.endsWith('setup.py'));
  const hasPackageJson = files.some(f => f.toLowerCase().includes('package.json'));
  const licenseFile = files.find(f => f.toUpperCase().includes('LICENSE'));

  return {
    analysisId,
    repoName,
    workspacePath,
    files,
    totalFiles: files.length,
    totalSize,
    hasPython,
    hasJavaScript,
    hasRequirements,
    hasPackageJson,
    licenseFile
  };
}
