#!/usr/bin/env bash
# Runs the performance budgets (apps/web/scripts/perf-budget.mjs: Lighthouse mobile, default throttling, 3 runs per
# page, median) against the production fixture build (.next-lock, live data from tests/fixtures/live) on a
# dedicated port, then stops only the server it started. Used by CI (job perf-budget, one shard per job) and
# locally inside the Linux container (scripts/in-container.sh scripts/perf-budget.sh 3108). One page at a time:
# Lighthouse's simulated throttling scales the CPU time it observes, so a parallel run would measure the load
# of the other runs, not the page.
#   scripts/perf-budget.sh <port> [path-filter ...]     env as perf-budget.mjs (SHARD, OUT, LOCALES, RUNS,
#   PROGRESS, RESULTS, RESUME). Needs `npm run build:desktop-lock` first. Its exit code is the gate's (no pipe).
set -euo pipefail
port=$1; shift
# file settings relative to where this script is called, not to apps/web where the gate runs
for v in OUT PROGRESS RESULTS RESUME; do
  [ -n "${!v:-}" ] || continue
  if [ "$v" = RESUME ]; then mkdir -p "${!v}"; export "$v=$(cd "${!v}" && pwd)"
  else mkdir -p "$(dirname "${!v}")"; export "$v=$(cd "$(dirname "${!v}")" && pwd)/$(basename "${!v}")"; fi
done
NEXT_DIST_DIR=.next-lock NODE_OPTIONS="--import=$PWD/tests/fixtures/offline-fetch.mjs" TZ=UTC NEXT_TELEMETRY_DISABLED=1 \
  scripts/test-server.sh start "$port" apps/web
status=0
(cd apps/web && BASE="http://localhost:$port" node scripts/perf-budget.mjs "$@") || status=$?
scripts/test-server.sh stop "$port"
exit "$status"
