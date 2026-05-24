#!/usr/bin/env bash
# Refresh the models from the current sources.
# Re-runs the Monte Carlo + sensitivity analysis and commits if outputs changed.
#
# Usage:  bash scripts/refresh.sh [MC_N] [SENS_N]
# Default: 10,000 MC trials, 1,500 sensitivity per variant.

set -euo pipefail

cd "$(dirname "$0")/.."

MC_N="${1:-10000}"
SENS_N="${2:-1500}"

echo "[refresh] $(date -u +%Y-%m-%dT%H:%M:%SZ)  starting refresh"
echo "[refresh] Monte Carlo:    N = ${MC_N}"
echo "[refresh] Sensitivity:    N per variant = ${SENS_N}"

node scripts/montecarlo.js  "${MC_N}"
node scripts/sensitivity.js "${SENS_N}"

if git diff --quiet -- assets/montecarlo-results.json assets/sensitivity.json; then
  echo "[refresh] No model output changes (within noise) — skipping commit."
  exit 0
fi

git add assets/montecarlo-results.json assets/sensitivity.json
git commit -m "Refresh: rerun MC (${MC_N}) + sensitivity (${SENS_N})

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
git push origin main
echo "[refresh] done"
