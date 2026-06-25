#!/usr/bin/env bash
set -euo pipefail

EVOMAP_DIR="${HOME}/.evomap"
NODE_ID="$(cat "$EVOMAP_DIR/node_id")"
SECRET="$(cat "$EVOMAP_DIR/node_secret")"
LOG="${EVOLVER_LOGS_DIR:-/workspace/logs}/evomap-heartbeat.log"

mkdir -p "$(dirname "$LOG")"

heartbeat_once() {
  curl -sS -X POST "https://evomap.ai/a2a/heartbeat" \
    -H "Authorization: Bearer ${SECRET}" \
    -H "Content-Type: application/json" \
    -d "{\"node_id\":\"${NODE_ID}\"}" \
    >>"$LOG" 2>&1 || true
  echo "--- $(date -u +"%Y-%m-%dT%H:%M:%SZ") ---" >>"$LOG"
}

echo "[heartbeat] starting loop for ${NODE_ID}" | tee -a "$LOG"
while true; do
  heartbeat_once
  sleep 300
done
