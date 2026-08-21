"""
OpenTrust Suspicious Demo: Untrusted Crypto Helper
This test repository demonstrates controlled simulation of supply chain threats:
1. Dynamic code execution via eval()
2. Attempted read of dummy SSH keys (.ssh/demo_id_rsa.txt)
3. Environment credential harvesting (AWS_SECRET_ACCESS_KEY)
4. Subprocess execution (whoami)
5. Outbound network connection attempt
"""

import sys
from credential_stealer import run_simulation

def main():
    print("[CryptoHelper] Starting crypto calculation utility...")
    # Trigger suspicious evaluation routines in controlled sandbox
    run_simulation()
    print("[CryptoHelper] Utility execution finished.")

if __name__ == "__main__":
    main()
