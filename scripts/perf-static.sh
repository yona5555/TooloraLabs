#!/usr/bin/env bash
# Runs the deterministic performance budgets (apps/web/scripts/perf-static.mjs) against the production fixture build
# (.next-lock, live data from tests/fixtures/live) on a dedicated port, then stops only the server it started.
#   scripts/perf-static.sh <port>     env as perf-static.mjs. Needs `npm run build:desktop-lock` first.
set -euo pipefail
port=$1
for v in OUT PAGES; do
  [ -n "${!v:-}" ] || continue
  mkdir -p "$(dirname "${!v}")"; export "$v=$(cd "$(dirname "${!v}")" && pwd)/$(basename "${!v}")"
done
NEXT_DIST_DIR=.next-lock NODE_OPTIONS="--import=$PWD/tests/fixtures/offline-fetch.mjs" TZ=UTC NEXT_TELEMETRY_DISABLED=1 \
  scripts/test-server.sh start "$port" apps/web
status=0
(cd apps/web && BASE="http://localhost:$port" node scripts/perf-static.mjs) || status=$?
scripts/test-server.sh stop "$port"
exit "$status"
