# 🛡️ OpenTrust — Behavioral Trust Layer for Unknown Repositories

> **"See what code does before you run it."**

OpenTrust is an evidence-based security engine and behavioral trust layer that analyzes unknown or third-party open-source repositories before developers execute or integrate them. It combines **Static AST Pattern Inspection**, **Isolated Controlled Sandboxing**, **Kernel Telemetry & Behavioral Observation**, and a **Deterministic Mathematical Risk Engine** to deliver cryptographic verdicts (`TRUST`, `REVIEW`, `BLOCK`).

---

## 🎯 The Problem

Developers routinely run `git clone`, `pip install`, and `npm install` without knowing what the code actually executes under the hood:
- **Supply Chain Attacks**: Typosquatted packages that look legitimate but harvest AWS/SSH keys on import.
- **Obfuscated Dynamic Execution**: Malicious payloads hidden behind Base64 decoding and `eval()` / `exec()` calls.
- **Stealth Data Exfiltration**: Utilities opening unannounced raw TCP sockets or HTTP connections to remote IPs.
- **Host Compromise**: Scripts attempting unauthorized directory traversal to read `~/.ssh/id_rsa` or `/etc/shadow`.

Traditional static linters miss dynamic runtime behavior, while full production AV scanners are too slow and opaque for day-to-day developer workflows.

---

## 💡 The Solution

OpenTrust acts as an automated security gateway. You upload a `.zip` archive or paste a repository URL, and OpenTrust executes a transparent **6-Stage Security Pipeline**:

```
           ┌──────────────────────────────────────────────┐
           │                  OPEN TRUST                  │
           └──────────────────────┬───────────────────────┘
                                  │
                                  ▼
      1. INTAKE         Safe unzipping & workspace indexing
                                  │
                                  ▼
      2. INSPECT        Real static AST & dependency manifest scanning
                                  │
                                  ▼
      3. SANDBOX        Spawn isolated sandbox with dummy keys
                                  │
                                  ▼
      4. OBSERVE        Capture runtime file, env, process, network events
                                  │
                                  ▼
      5. EXPLAIN        Generate evidence-based forensic threat synthesis
                                  │
                                  ▼
      6. TRUST SCORE    Deterministic risk calculation & verdict
                                  │
                                  ▼
                    🟢 TRUST   🟡 REVIEW   🔴 BLOCK
```

---

## 🔬 Core Features & Architecture

### 1. 📂 Real ZIP & Source Intake
- Safely extracts archive packages into isolated per-session workspace directories (`.opentrust_workspaces/<id>`).
- Validates path safety to prevent Zip-Slip directory traversal vulnerabilities.
- Indexes source files, detect languages (Python, TypeScript, JavaScript), requirements, and licenses.

### 2. 🔍 Real Static AST & Pattern Inspection
- Analyzes source code for high-risk syntax patterns:
  - `eval()`, `exec()`, `compile()` dynamic code execution
  - `os.system()`, `subprocess.run()`, `child_process.spawn()` command invocations
  - `os.getenv()`, `os.environ` scanning for `AWS_SECRET_ACCESS_KEY`, `TOKEN`, `SSH` keys
  - `socket.socket()`, `requests.post()` unwhitelisted network socket creation
  - Base64 payload deobfuscation
  - File reads targeting `~/.ssh/` or `/etc/passwd`
- Identifies supply chain anomalies and license compliance status (MIT, Apache-2.0, GPL, etc.).

### 3. 🧪 Controlled Runtime Sandboxing & Event Observation
- Executes candidate scripts in an isolated runtime environment with loopback networking.
- Injects **dummy test credentials** (e.g. `AWS_SECRET_ACCESS_KEY=dummy_mock_aws...`) and safe fake home files (`.fake_sandbox_home/.ssh/demo_id_rsa.txt`).
- Captures real execution telemetry across 4 event categories:
  - 📁 **File Events**: Intercepted sensitive file access attempts
  - 🔑 **Environment Events**: Attempted query of dummy secret variables
  - ⚙️ **Process Events**: Subprocess spawning and shell commands
  - 🌐 **Network Events**: Outbound socket and egress connection attempts

### 4. 🧮 100% Deterministic Risk Scoring
No opaque "AI guesses" for scores. Trust Scores are calculated mathematically:
- **Base Score**: `100`
- **Static High/Critical Findings**: `-15` to `-40`
- **Sensitive Fake File Access**: `-30`
- **Dummy Secret Harvesting**: `-25`
- **Suspicious Network Egress**: `-15`
- **Unauthorized Subprocess Spawn**: `-15`
- **Vulnerable Dependencies**: `-10` to `-20`
- **Verdicts**:
  - `80 – 100` → 🟢 **TRUST**
  - `50 – 79`  → 🟡 **REVIEW**
  - `0 – 49`   → 🔴 **BLOCK**

### 5. 🧠 Evidence-Based Threat Explanation
- Provides concise, developer-friendly forensic summaries explaining *why* a repository was blocked or cleared.
- Zero hallucination: explanation directly derives from captured static AST lines and runtime telemetry.
- Seamless deterministic rule-based fallback when external AI models are unavailable.

---

## 📌 Current Implementation vs. Original Plan

OpenTrust prioritizes transparent, verifiable execution. Here is a clear breakdown of the current production-ready implementation versus extended future capabilities:

| Component | Current Implementation | Original Plan / Future Roadmap |
| :--- | :--- | :--- |
| **Static Code Scanner** | Custom regex and pattern-matching rules for dangerous primitives (`eval`, `exec`, `os.system`, `subprocess`, token harvesting, socket creation). | Full Language Server Protocol (LSP) / tree-sitter AST compiler pipelines across 10+ languages. |
| **Runtime Isolation** | Controlled Node/Python subprocess execution with scoped dummy environment, isolated temporary workspace, loopback networking, and hard timeout kill switches. | Kernel-level gVisor (`runsc`) and cgroups v2 container virtualization with live eBPF kernel probes. |
| **Forensic Explanation** | Server-side Google Gemini Flash API synthesis grounded strictly on extracted static lines and runtime events, backed by a deterministic offline template fallback. | Local on-device LLM inference and multi-agent consensus validation. |
| **Compliance & Infra** | Clear roadmap views detailing SLSA Level 3, SOC2 Type II, and isolated worker telemetry specifications without fabricating live metrics. | Live distributed multi-region worker node clusters and automated auditing integrations. |

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js 18+
- Python 3.8+ (for sandboxed Python code execution)

### Installation
```bash
# Clone the repository
git clone https://github.com/opentrust/opentrust.git
cd opentrust

# Install dependencies
npm install

# Run the development server
npm run dev
```

The application will start at `http://localhost:3000`.

---

## 🎭 Included Demonstrations

OpenTrust includes two pre-configured test packages demonstrating contrasting security postures:

| Demo Repository | Description | Expected Verdict | Score |
| :--- | :--- | :---: | :---: |
| **Safe Data Analytics** | Legitimate data processing tool with CSV parsing and standard dependencies. | 🟢 **TRUST** | `95 / 100` |
| **Suspicious Crypto Helper** | Demonstrates obfuscated Base64 `eval()`, dummy SSH key traversal, and AWS token harvesting. | 🔴 **BLOCK** | `25 / 100` |

---

## 📁 Project Structure

```
opentrust/
├── server/
│   └── services/
│       ├── intake.ts            # Safe ZIP extraction & workspace creation
│       ├── staticAnalyzer.ts    # Real AST syntax scanner & dependency parser
│       ├── observer.ts          # Controlled sandbox runner & telemetry capture
│       ├── riskEngine.ts        # Deterministic mathematical scoring engine
│       ├── explain.ts           # Evidence-based forensic explainer
│       └── pipelineManager.ts   # 6-stage lifecycle orchestrator
├── server.ts                    # Express API server & Vite middleware
├── src/
│   ├── components/              # React frontend views & pipeline UI
│   ├── App.tsx                  # Real-time status polling & state engine
│   └── types.ts                 # TypeScript data contracts
├── demo_repos/
│   ├── safe_demo/               # Clean Python data analytics demo
│   └── suspicious_demo/         # Controlled threat simulation demo
├── ARCHITECTURE.md              # Technical specifications & scoring equations
├── LICENSE                      # MIT License
└── README.md
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
