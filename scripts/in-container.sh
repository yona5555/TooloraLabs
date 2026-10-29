#!/usr/bin/env bash
# Runs a command in the Linux container that matches CI (tests/container/Dockerfile): local audits, locks and
# preview generation must use it, because the same page renders differently on macOS.
# Default: linux/arm64, native on Apple silicon, for iteration (the same audit gave identical finding counts on
# arm64 and amd64, .audit/arm64-before.txt vs sample-amd64.txt). --ci-parity: linux/amd64 (x86_64) like the CI
# runner, through Rosetta (colima start --vm-type vz --vz-rosetta), several times slower; it fails if the
# container is not x86_64. CI (x86_64) stays the final authority. The repository is mounted at /repo;
# node_modules and the Next.js build folders live in Docker volumes, one set per architecture (native modules
# differ), so the macOS install and the dev server's .next are never touched. Fails (never falls back to macOS)
# if Docker is not running.
#   scripts/in-container.sh npm ci                 (once per architecture, and after package-lock.json changes)
#   scripts/in-container.sh npm run test:desktop-lock
#   scripts/in-container.sh --ci-parity npm run test:desktop-lock
set -euo pipefail
platform=linux/arm64 arch=arm64 uname_m=aarch64
if [ "${1:-}" = --ci-parity ]; then platform=linux/amd64 arch=amd64 uname_m=x86_64; shift; fi
root=$(cd "$(dirname "$0")/.." && pwd)
docker info > /dev/null 2>&1 || { echo "in-container: Docker is not running (colima start). Nothing was run on macOS instead." >&2; exit 1; }
pw=$(node -p "require('$root/package-lock.json').packages['node_modules/playwright'].version")
node=$(tr -d '[:space:]' < "$root/.nvmrc")
[[ "$node" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || { echo "in-container: .nvmrc must hold an exact Node version (x.y.z), the one CI uses; found '$node'." >&2; exit 1; }
image="toolora-ci:$arch-pw$pw-node$node-$(cksum < "$root/tests/container/Dockerfile" | cut -d" " -f1)"
if ! docker image inspect "$image" > /dev/null 2>&1; then
  docker buildx build -q --load --platform "$platform" -t "$image" --build-arg "PLAYWRIGHT_VERSION=$pw" --build-arg "NODE_VERSION=$node" "$root/tests/container" > /dev/null
fi
vols=()
for d in node_modules apps/web/node_modules packages/core/node_modules packages/sdk/node_modules packages/tools/node_modules apps/web/.next apps/web/.next-lock; do
  vols+=(-v "toolora-$arch-$(tr '/.' '--' <<<"$d"):/repo/$d")
done
# The audit/lock settings given on the host reach the command (LOCALES=ar scripts/in-container.sh ...).
envs=()
for v in BASE LOCALES WIDTHS THEMES MIN JOBS SHARD OUT VERBOSE PROGRESS SHOW PHONE_BASE CI RUNS RESULTS RESUME; do
  [ -n "${!v+x}" ] && envs+=(-e "$v")
done
tty=(); [ -t 0 ] && [ -t 1 ] && tty=(-it)
run=(docker run --rm --platform "$platform" --init --ipc=host --shm-size=2g -v "$root:/repo" "${vols[@]}" ${envs[@]+"${envs[@]}"} -w /repo "$image")
[ "$("${run[@]}" uname -m)" = "$uname_m" ] || { echo "in-container: the container does not run $uname_m ($platform; for --ci-parity: colima start --vm-type vz --vz-rosetta). Nothing was run." >&2; exit 1; }
exec "${run[@]:0:2}" ${tty[@]+"${tty[@]}"} "${run[@]:2}" "$@"
