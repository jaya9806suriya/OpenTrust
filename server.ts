import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  startZipAnalysis,
  startDemoAnalysis,
  startCustomRepoAnalysis,
  getSession,
  getAllSessions
} from './server/services/pipelineManager';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Multer memory storage for ZIP file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max
});

// Lazy initialize Gemini client
let aiInstance: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in the environment.');
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    activeWorkspaces: getAllSessions().length
  });
});

// ==========================================
// 🚀 REAL OPENTRUST SECURITY ENGINE API
// ==========================================

// 1. Real ZIP Upload & Analysis Intake
app.post('/api/analyze/upload-zip', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No ZIP file provided in upload.' });
    }

    const session = await startZipAnalysis(req.file.buffer, req.file.originalname);
    res.json({
      success: true,
      analysisId: session.id,
      repoName: session.targetRepo,
      filesScanned: session.filesScanned,
      status: session.status
    });
  } catch (error: any) {
    console.error('Error in upload-zip:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to process ZIP intake.' });
  }
});

// 2. Start Analysis (Demo or Custom GitHub Repo)
app.post('/api/analyze/start', async (req: Request, res: Response) => {
  try {
    const { repoUrl, demoType } = req.body;

    let session;
    if (demoType === 'safe' || demoType === 'suspicious') {
      session = await startDemoAnalysis(demoType);
    } else if (repoUrl) {
      session = await startCustomRepoAnalysis(repoUrl);
    } else {
      session = await startDemoAnalysis('suspicious');
    }

    res.json({
      success: true,
      analysisId: session.id,
      repoName: session.targetRepo,
      status: session.status,
      filesScanned: session.filesScanned
    });
  } catch (error: any) {
    console.error('Error in analyze/start:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Poll Pipeline Status
app.get('/api/analyze/:id/status', (req: Request, res: Response) => {
  const session = getSession(req.params.id);
  if (!session) {
    return res.status(404).json({ success: false, error: 'Analysis session not found.' });
  }

  res.json({
    success: true,
    id: session.id,
    targetRepo: session.targetRepo,
    repoType: session.repoType,
    status: session.status,
    currentStageIndex: session.currentStageIndex,
    currentStageName: session.currentStageName,
    stages: session.stages,
    elapsedSeconds: session.elapsedSeconds,
    filesScanned: session.filesScanned,
    error: session.error
  });
});

// 4. Get Real Static Inspection Findings
app.get('/api/analyze/:id/findings', (req: Request, res: Response) => {
  const session = getSession(req.params.id);
  if (!session) {
    return res.status(404).json({ success: false, error: 'Analysis session not found.' });
  }

  res.json({
    success: true,
    findings: session.staticResult?.findings || [],
    filesScanned: session.staticResult?.filesScanned || session.filesScanned,
    dependenciesTotal: session.staticResult?.dependenciesTotal || 0,
    dependenciesVulnerable: session.staticResult?.dependenciesVulnerable || 0,
    dependenciesList: session.staticResult?.dependenciesList || [],
    license: session.staticResult?.license || 'Unknown',
    licenseStatus: session.staticResult?.licenseStatus || 'No License Detected'
  });
});

// 5. Get Real Behavioral Sandbox Events
app.get('/api/analyze/:id/events', (req: Request, res: Response) => {
  const session = getSession(req.params.id);
  if (!session) {
    return res.status(404).json({ success: false, error: 'Analysis session not found.' });
  }

  res.json({
    success: true,
    events: session.sandboxResult?.events || [],
    anomaliesDetected: session.sandboxResult?.anomaliesDetected || 0,
    executionTimeMs: session.sandboxResult?.executionTimeMs || 0
  });
});

// 6. Get Final Full Security Trust Report
app.get('/api/analyze/:id/report', (req: Request, res: Response) => {
  const session = getSession(req.params.id);
  if (!session) {
    return res.status(404).json({ success: false, error: 'Analysis session not found.' });
  }

  res.json({
    success: true,
    id: session.id,
    targetRepo: session.targetRepo,
    repoUrl: session.repoUrl,
    repoType: session.repoType,
    status: session.status,
    verdict: session.riskResult?.verdict || 'REVIEW',
    trustScore: session.riskResult?.trustScore ?? 50,
    scoreBreakdown: session.riskResult?.breakdown || [],
    riskFlags: session.riskResult?.riskFlags || [],
    executiveSummary: session.explanation?.executiveSummary || 'Audit completed.',
    recommendedAction: session.explanation?.recommendedAction || 'Review repository before production deployment.',
    behaviorAnalysis: session.explanation?.behaviorAnalysis || 'Telemetry captured.',
    filesScanned: session.filesScanned,
    elapsedSeconds: session.elapsedSeconds,
    license: session.staticResult?.license || 'MIT',
    licenseStatus: session.staticResult?.licenseStatus || 'Permissive - Cleared for Use',
    dependenciesTotal: session.staticResult?.dependenciesTotal || 0,
    dependenciesVulnerable: session.staticResult?.dependenciesVulnerable || 0,
    findings: session.staticResult?.findings || [],
    events: session.sandboxResult?.events || [],
    stages: session.stages
  });
});

// ==========================================
// 🛡️ SUPPORTING INTELLIGENCE UTILITIES
// ==========================================

// Google Search Grounding - Live Threat Intel & Vulnerability Search
app.post('/api/gemini/search-threat-intel', async (req: Request, res: Response) => {
  try {
    const { query, packageName, cveId } = req.body;
    const ai = getGenAI();

    const searchQuery = query || (cveId 
      ? `CVE security advisory vulnerability details for ${cveId} severity CVSS score mitigations`
      : `Latest cybersecurity threat intelligence, CVEs, supply chain attacks, malware advisories, and reputation for ${packageName}`);

    const prompt = `You are a Senior Threat Intelligence Analyst for OpenTrust cybersecurity platform.
Search the live web using Google Search for the following security inquiry:
Query: "${searchQuery}"

Provide a comprehensive, authoritative threat intelligence briefing with:
1. Executive Threat Summary
2. CVE IDs and CVSS v3/v4 severity ratings (if applicable)
3. Attack vectors, exploitation status (in-the-wild / PoC available), and indicators of compromise (IoCs)
4. Affected package versions and malicious typosquats (if npm/PyPI/cargo)
5. Official remediation steps, patched versions, and firewall/containment rules
6. Verifiable references and source links

Keep the analysis technical, precise, and actionable for security engineers.`;

    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.2,
      },
    });

    const text = response.text || 'No response generated.';
    const searchChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const searchSupports = response.candidates?.[0]?.groundingMetadata?.groundingSupports || [];
    const webSearchQueries = response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];

    res.json({
      success: true,
      intel: text,
      grounding: {
        sources: searchChunks,
        supports: searchSupports,
        webSearchQueries: webSearchQueries
      }
    });
  } catch (error: any) {
    console.error('Error in search-threat-intel:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch grounded threat intelligence.' 
    });
  }
});

// Live Voice & Interactive Copilot (Audio / Text dialogue)
app.post('/api/gemini/voice-copilot', async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory, context } = req.body;
    const ai = getGenAI();

    const systemInstruction = `You are "Aegis", the OpenTrust Voice AI Security Copilot.
You are speaking live to a Cybersecurity Analyst and DevSecOps Engineer.
Current context of repository scan:
Repository: ${context?.targetRepo || 'Active Target'}
Trust Score: ${context?.trustScore ?? 'Unknown'}/100
Verdict: ${context?.verdict || 'PENDING'}
Active Findings: ${context?.riskFlags ? JSON.stringify(context.riskFlags) : 'None'}

Guidelines:
- Keep answers concise, authoritative, and direct for voice listening.
- Explain technical threats clearly (e.g. reverse shell payloads, unauthorized egress, data exfiltration, dependency confusion).
- Recommend concrete actions (e.g. "Quarantine immediately", "Block outbound CIDR 198.51.100.0/24", "Regenerate compromised tokens").
- Maintain a calm, professional, elite security specialist persona.`;

    const formattedContents = [
      ...(conversationHistory || []).map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      })),
      {
        role: 'user',
        parts: [{ text: message }]
      }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.3,
      }
    });

    const replyText = response.text || "Security analysis updated.";

    res.json({
      success: true,
      reply: replyText
    });
  } catch (error: any) {
    console.error('Error in voice-copilot:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Download complete project ZIP endpoint
app.get('/api/download-zip', (req: Request, res: Response) => {
  const zipPath = path.join(process.cwd(), 'opentrust-source-code.zip');
  if (fs.existsSync(zipPath)) {
    res.download(zipPath, 'opentrust-source-code.zip');
  } else {
    res.status(404).json({ error: 'Source code ZIP is being generated. Please retry in a few seconds.' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`OpenTrust Server listening on http://localhost:${PORT} (or http://127.0.0.1:${PORT})`);
  });
}

startServer();
