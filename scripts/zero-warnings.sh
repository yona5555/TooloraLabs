#!/usr/bin/env bash
# Fails when any job of this workflow run failed or was cancelled, or when any of its check runs carries a
# warning or failure annotation. Run as the last job of a workflow (needs: every other job, if: always()).
# Env: GH_TOKEN, GITHUB_REPOSITORY, GITHUB_RUN_ID, HEAD_SHA (the commit the checks ran on), NEEDS_JSON
# (toJSON(needs)), SELF (this job's check name, skipped so its own annotations are not read back).
set -euo pipefail
bad_needs=$(jq -r 'to_entries[] | select(.value.result == "failure" or .value.result == "cancelled") | "\(.key): \(.value.result)"' <<<"$NEEDS_JSON")
ids=$(gh api --paginate "repos/$GITHUB_REPOSITORY/commits/$HEAD_SHA/check-runs?per_page=100" \
  --jq ".check_runs[] | select(.details_url | test(\"/actions/runs/$GITHUB_RUN_ID/\")) | select(.name != \"$SELF\") | .id")
found=0
for id in $ids; do
  lines=$(gh api --paginate "repos/$GITHUB_REPOSITORY/check-runs/$id/annotations?per_page=100" \
    --jq '.[] | select(.annotation_level == "warning" or .annotation_level == "failure") | "[\(.annotation_level)] \(.path):\(.start_line) \(.message | gsub("\n"; " "))"')
  if [ -n "$lines" ]; then
    name=$(gh api "repos/$GITHUB_REPOSITORY/check-runs/$id" --jq .name)
    while IFS= read -r line; do echo "::error title=$name::$line"; done <<<"$lines"
    found=1
  fi
done
if [ -n "$bad_needs" ]; then echo "::error::Jobs not successful: $bad_needs"; found=1; fi
if [ "$found" -ne 0 ]; then exit 1; fi
echo "No warning or failure annotations in run $GITHUB_RUN_ID."
