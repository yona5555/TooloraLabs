#!/usr/bin/env bash
# Runs the site audit (apps/web/scripts/site-audit.mjs) against the fixture build (.next-lock, live data from
# tests/fixtures/live) on a dedicated port, then stops only the server it started. Used by CI (job site-audit,
# one shard per job) and locally inside the Linux container (scripts/in-container.sh scripts/site-audit.sh).
#   scripts/site-audit.sh <port> [path-filter ...]     env as site-audit.mjs (SHARD, OUT, LOCALES, WIDTHS, THEMES)
# Needs `npm run build:desktop-lock` first. Its exit code is the audit's (no pipe after it).
set -euo pipefail
port=$1; shift
# OUT relative to where this script is called, not to apps/web where the audit runs
if [ -n "${OUT:-}" ]; then mkdir -p "$(dirname "$OUT")"; OUT="$(cd "$(dirname "$OUT")" && pwd)/$(basename "$OUT")"; export OUT; fi
NEXT_DIST_DIR=.next-lock NODE_OPTIONS="--import=$PWD/tests/fixtures/offline-fetch.mjs" TZ=UTC NEXT_TELEMETRY_DISABLED=1 \
  scripts/test-server.sh start "$port" apps/web
status=0
(cd apps/web && BASE="http://localhost:$port" node scripts/site-audit.mjs "$@") || status=$?
scripts/test-server.sh stop "$port"
exit "$status"
