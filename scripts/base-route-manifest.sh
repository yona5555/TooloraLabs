#!/usr/bin/env bash
# Fetches main's route manifest (artifact route-manifest of the latest successful CI push run on main) for
# scripts/route-manifest.mjs affected. Whenever it is not available this writes no file, prints why and exits 0:
# route-manifest.mjs then marks every page affected, which measures more, never less.
#   scripts/base-route-manifest.sh <out.json>     env: GH_TOKEN, GITHUB_REPOSITORY
set -uo pipefail
out=$1
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
unavailable() {
  rm -f "$out"
  echo "No base route manifest: $1. Every page is marked affected."
  if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then echo "No base route manifest: $1. Every page is marked affected." >> "$GITHUB_STEP_SUMMARY"; fi
  exit 0
}
repo="repos/$GITHUB_REPOSITORY/actions"
run=$(gh api "$repo/workflows/ci.yml/runs?branch=main&event=push&status=success&per_page=1" --jq '.workflow_runs[0].id // empty') \
  || unavailable "the runs of main could not be listed"
[ -n "$run" ] || unavailable "main has no successful CI run"
artifact=$(gh api "$repo/runs/$run/artifacts?name=route-manifest" --jq '[.artifacts[] | select(.expired == false)][0].id // empty') \
  || unavailable "the artifacts of run $run could not be listed"
[ -n "$artifact" ] || unavailable "run $run has no unexpired route-manifest artifact"
gh api "$repo/artifacts/$artifact/zip" > "$tmp/manifest.zip" || unavailable "artifact $artifact could not be downloaded"
unzip -p "$tmp/manifest.zip" route-manifest.json > "$tmp/route-manifest.json" 2>/dev/null || unavailable "artifact $artifact is not a readable zip of route-manifest.json"
jq -e '.routes | type == "object"' "$tmp/route-manifest.json" > /dev/null 2>&1 || unavailable "artifact $artifact holds no valid manifest"
mv "$tmp/route-manifest.json" "$out"
echo "Base route manifest: artifact $artifact of main run $run."
