#!/usr/bin/env python3
"""
ReconLoop Ablation Benchmark Runner
Invokes the TypeScript ablation runner and prints the benchmark table.
"""
import subprocess
import sys
import os

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, '..'))
    ts_script = os.path.join(script_dir, 'run_benchmark.ts')

    print("Running ReconLoop Ablation Study via TypeScript Engine...")
    cmd = ["npx", "tsx", ts_script]
    res = subprocess.run(cmd, cwd=project_root)
    sys.exit(res.returncode)

if __name__ == '__main__':
    main()
