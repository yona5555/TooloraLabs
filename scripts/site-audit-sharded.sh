#!/usr/bin/env bash
# The local site-audit runner (inside the Linux container: scripts/in-container.sh scripts/site-audit-sharded.sh
# 3107 .audit/<name>). One fixture server (the .next-lock build), then the audit in parallel shards sized from a
# measurement: a calibration run (2 tool pages, one worker) gives the memory and the CPU one worker uses (browser,
# audit and its share of the server), and the shard count is the most that keeps the container under 80% of its
# memory and its cores busy without oversubscribing them (5 memory-sized shards on 6 cores ran 4x slower per page).
#   <outdir>/sizing.txt        the measurement and the chosen shard count
#   <outdir>/shard-<i>.log     one progress line per page view (+ the shard's own table), shard-<i>.json its OUT
#   <outdir>/progress.log      the progress lines of every shard, merged as they happen (a hang = no new line)
#   <outdir>/inventory.json/.txt  the merged inventory (site-audit.mjs --merge); exit 1 on any finding
# Usage: scripts/site-audit-sharded.sh <port> <outdir> [path-filter ...]   (env LOCALES, WIDTHS, THEMES as the audit)
set -euo pipefail
port=$1 out=$2; shift 2
mkdir -p "$out"; out=$(cd "$out" && pwd)
rm -f "$out"/shard-*.json "$out"/shard-*.log "$out"/inventory.* "$out"/calibration.*; : > "$out/progress.log"
NEXT_DIST_DIR=.next-lock NODE_OPTIONS="--import=$PWD/tests/fixtures/offline-fetch.mjs" TZ=UTC NEXT_TELEMETRY_DISABLED=1 \
  scripts/test-server.sh start "$port" apps/web
trap 'scripts/test-server.sh stop "$port"' EXIT
export BASE="http://localhost:$port"

# Memory one worker adds: the container's peak during a one-worker run on two heavy tool pages (cgroup v2).
cg=/sys/fs/cgroup
before=$(cat "$cg/memory.current")
cpu0=$(awk '/^usage_usec/ {print $2}' "$cg/cpu.stat") t0=$(date +%s%N)
status=0
(cd apps/web && JOBS=1 OUT="$out/calibration.json" node scripts/site-audit.mjs /tools/mortgage-calculator /tools/scientific-calculator) > "$out/calibration.log" 2>&1 || status=$?
[ -s "$out/calibration.json" ] || { echo "site-audit-sharded: the calibration run crashed (exit $status, $out/calibration.log)" >&2; exit 2; }
per_worker=$(( $(cat "$cg/memory.peak") - before ))
# CPU one worker keeps busy, in milli-cores: CPU time / wall time of the calibration
cpu_worker=$(( ($(awk '/^usage_usec/ {print $2}' "$cg/cpu.stat") - cpu0) * 1000 / (($(date +%s%N) - t0) / 1000) ))
limit=$(cat "$cg/memory.max")
[ "$limit" = max ] && limit=$(( $(awk '/^MemTotal/ {print $2}' /proc/meminfo) * 1024 ))
cores=$(nproc)
by_memory=$(( (limit * 8 / 10 - before) / per_worker ))
by_cpu=$(( cores * 1000 / cpu_worker ))
shards=$(( by_memory < by_cpu ? by_memory : by_cpu ))
(( shards < 1 )) && shards=1
mib() { echo "$(( $1 / 1048576 )) MiB"; }
printf 'memory limit %s, before the audit %s, one worker %s -> %s by memory (80%% cap %s); one worker %s.%03d cores of %s -> %s by CPU; %s shards\n' \
  "$(mib "$limit")" "$(mib "$before")" "$(mib "$per_worker")" "$by_memory" "$(mib $(( limit * 8 / 10 )))" \
  $((cpu_worker / 1000)) $((cpu_worker % 1000)) "$cores" "$by_cpu" "$shards" | tee "$out/sizing.txt"

pids=()
for i in $(seq 1 "$shards"); do
  (cd apps/web && SHARD="$i/$shards" JOBS=1 PROGRESS="$out/progress.log" OUT="$out/shard-$i.json" node scripts/site-audit.mjs "$@") > "$out/shard-$i.log" 2>&1 &
  pids+=($!)
done
crashed=0
for i in "${!pids[@]}"; do
  wait "${pids[$i]}" || true # exit 1 = findings; a crash is a missing OUT file, checked below
  [ -s "$out/shard-$((i + 1)).json" ] || { echo "site-audit-sharded: shard $((i + 1)) crashed ($out/shard-$((i + 1)).log)" >&2; crashed=1; }
done
(( crashed )) && exit 2
status=0
(cd apps/web && OUT="$out/inventory.json" node scripts/site-audit.mjs --merge "$out"/shard-*.json) > "$out/inventory.txt" 2>&1 || status=$?
head -1 "$out/inventory.txt"
exit "$status"
