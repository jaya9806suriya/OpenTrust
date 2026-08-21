# 🏗️ OpenTrust — System Architecture & Design Specification

## Overview

OpenTrust is designed as a modular, defense-in-depth behavioral trust layer for evaluating untrusted source code. It rejects opaque heuristics in favor of verifiable evidence captured through static AST pattern matching and controlled runtime sandbox execution.

---

## Pipeline Execution Stages

```
[ INTAKE ] ──▶ [ INSPECT ] ──▶ [ SANDBOX ] ──▶ [ OBSERVE ] ──▶ [ EXPLAIN ] ──▶ [ TRUST SCORE ]
   │               │               │               │               │                 │
 Safe ZIP     Regex & AST      Controlled      Subprocess I/O  Forensic Threat   Deterministic
 Extraction   Pattern Rules    Subprocess      & Descriptor    Synthesis &       Score (0-100) &
 & Indexing   & Dependencies   with Dummy Keys Telemetry       Remediation       Verdict
```

### Stage 1: INTAKE (`server/services/intake.ts`)
- **Input**: Raw `.zip` buffer, Git clone URL, or local demo directory.
- **Security Check**: Path traversal validation (`Zip Slip` mitigation) and input sanitization (`^[A-Za-z0-9._-]+$`).
- **Output**: Unique workspace session (`.opentrust_workspaces/OT-<ID>`) with indexed file paths.

### Stage 2: INSPECT (`server/services/staticAnalyzer.ts`)
- **Engine**: Static pattern analyzer scanning for:
  - `eval()`, `exec()`, `compile()`
  - `subprocess.run()`, `os.system()`, `child_process.spawn()`
  - `os.getenv()`, `os.environ` searching for `AWS_SECRET_ACCESS_KEY`, `TOKEN`, `SSH_KEY`
  - `socket.socket()`, `requests.post()`
  - Base64 payload decoding
- **Manifests**: Dependency extraction from `requirements.txt` & `package.json`, plus license detection from `LICENSE` files.

### Stage 3 & 4: SANDBOX & OBSERVE (`server/services/observer.ts`)
- **Isolation**: Controlled subprocess execution with a scoped environment and a 3.5s hard timeout kill switch.
- **Environment**:
  - `fake_home/.ssh/demo_id_rsa.txt` containing non-secret verification headers.
  - `AWS_SECRET_ACCESS_KEY=dummy_mock_aws_secret_key_opentrust_sandbox`.
- **Event Categories**:
  - `FILE`: Host file traversal attempts.
  - `ENVIRONMENT`: Secret credential harvesting attempts.
  - `PROCESS`: Shell execution & subprocess launches.
  - `NETWORK`: Raw TCP socket connection attempts.

### Stage 5 & 6: EXPLAIN & TRUST SCORE (`server/services/riskEngine.ts`, `server/services/explain.ts`)
- **Deterministic Math**:
  $$\text{TrustScore} = \max(0, 100 - \Delta_{\text{static}} - \Delta_{\text{file}} - \Delta_{\text{env}} - \Delta_{\text{network}} - \Delta_{\text{process}} - \Delta_{\text{deps}})$$
- **Score Classification**:
  - $[80, 100]$: **TRUST** (Clean posture)
  - $[50, 79]$: **REVIEW** (Elevated privileges or minor anomalies)
  - $[0, 49]$: **BLOCK** (Hostile credential theft or unauthorized egress)

---

## REST API Specification

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/analyze/upload-zip` | Uploads multipart ZIP file and starts 6-stage pipeline |
| `POST` | `/api/analyze/start` | Starts analysis on safe/suspicious demo or GitHub repo |
| `GET` | `/api/analyze/:id/status` | Polls current stage index, elapsed time, and pipeline status |
| `GET` | `/api/analyze/:id/findings`| Returns static code findings and line-number context |
| `GET` | `/api/analyze/:id/events` | Returns runtime behavioral events and telemetry |
| `GET` | `/api/analyze/:id/report` | Returns final Trust Score, score breakdown, and verdict |
| `GET` | `/api/download-zip` | Downloads full application source code ZIP archive |
