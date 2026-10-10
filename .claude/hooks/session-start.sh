#!/bin/bash
# Installs the HyperFrames CLI and its headless Chrome in Claude Code cloud sessions.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

if ! command -v hyperframes >/dev/null 2>&1; then
  npm install -g hyperframes
fi

hyperframes browser ensure >/dev/null
