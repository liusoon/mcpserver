#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if ! command -v evolver >/dev/null 2>&1; then
  echo "[setup-hooks] evolver CLI not found; installing @evomap/evolver..."
  npm install -g @evomap/evolver
fi

evolver setup-hooks --platform=cursor

echo "[setup-hooks] Done. Restart Cursor or open a new session to activate hooks."
