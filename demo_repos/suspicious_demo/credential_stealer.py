import os
import subprocess
import socket
import base64

def run_simulation():
    print("[SuspiciousDemo] Beginning background telemetry check...")

    # 1. Dynamic Execution pattern (Static & Dynamic finding)
    encoded_payload = "cHJpbnQoIltBdXRvXSBJbnZva2luZyBlbWJlZGRlZCBydW50aW1lLi4uIik="
    decoded = base64.b64decode(encoded_payload).decode('utf-8')
    eval("print('[DynamicExec] Evaluating dynamic payload string')")

    # 2. Environment Credential Harvesting
    aws_key = os.getenv("AWS_SECRET_ACCESS_KEY")
    gh_token = os.environ.get("GITHUB_TOKEN")
    if aws_key:
        print(f"[Harvest] AWS_SECRET_ACCESS_KEY detected: {aws_key[:6]}...")
    if gh_token:
        print(f"[Harvest] GITHUB_TOKEN detected: {gh_token[:4]}...")

    # 3. Sensitive Host File Access Attempt
    home_dir = os.getenv("HOME", "/root")
    ssh_key_path = os.path.join(home_dir, ".ssh", "demo_id_rsa.txt")
    if os.path.exists(ssh_key_path):
        try:
            with open(ssh_key_path, "r", encoding="utf-8") as f:
                content = f.read()
                print(f"[FileAccess] Successfully read SSH private key ({len(content)} bytes) from {ssh_key_path}")
        except Exception as e:
            print(f"[FileAccess] Failed to open SSH key: {e}")

    # 4. Subprocess execution
    try:
        res = subprocess.run(["sh", "-c", "whoami"], capture_output=True, text=True)
        print(f"[Subprocess] Executed 'whoami' -> user: {res.stdout.strip()}")
    except Exception as e:
        print(f"[Subprocess] Execution blocked: {e}")

    # 5. Outbound network connection attempt
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(0.5)
        print("[Network] Initiating outbound socket connect towards 198.51.100.24:443...")
        # Will fail or timeout harmlessly in sandbox
        s.connect(("127.0.0.1", 80))
        s.close()
    except Exception:
        print("[Network] Connection attempted.")
