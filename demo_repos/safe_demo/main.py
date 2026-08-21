"""
OpenTrust Safe Demo: Clean Data Processing Tool
Reads a CSV data file, computes metrics, and outputs summary statistics.
No credential theft, no subprocess spawning, no unwhitelisted network socket attempts.
"""

import os
from csv_parser import parse_csv_metrics

def main():
    print("[SafeDemo] Initializing data processor...")
    current_dir = os.path.dirname(os.path.abspath(__file__))
    csv_file = os.path.join(current_dir, "data.csv")
    
    if os.path.exists(csv_file):
        summary = parse_csv_metrics(csv_file)
        print(f"[SafeDemo] Successfully processed {summary['rows']} rows.")
        print(f"[SafeDemo] Total Volume: {summary['total']}")
        print(f"[SafeDemo] Average: {summary['average']:.2f}")
    else:
        print("[SafeDemo] Sample data generated and analyzed cleanly.")
    
    print("[SafeDemo] Execution complete. Status: Clean.")

if __name__ == "__main__":
    main()
