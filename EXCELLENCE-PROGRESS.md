# EXCELLENCE pass — progress (branch wip/excellence; delete this file at merge)

Setup: main worktree ../TooloraLabs-main-wt (cloned node_modules), prod build .next-main on :3100,
shared fetch cache scripts/output/shared-fetch-cache. Lighthouse: scripts/output/lh.sh <port> <tag>.

## Lighthouse BEFORE (main, :3100, mobile)
ar 80 / LCP 5.05s · en 84 / 4.59s · ar bmi 71 / 5.85s · en mortgage 79 / 5.02s · ar sci 68 / 6.10s · en crypto 77 / 5.35s

| # | item | status |
|---|------|--------|
| 1 | mobile perf | font preloads removed (committed). inlineCss tried: worse (CLS 0.4-1.3, ar FCP +1s) — dropped. next/dynamic per-locale font tried: still preloads all — dropped |
| 2 | empty categories | committed; redirects verified 301 on prod build |
| 3 | desktop ads | committed 1b052975 (one shared layout, 3 in-content slots, ADS_ENABLED) |
| 4 | Σ logo | BLOCKED: approved Σ logo file not found (repo, Desktop, Downloads, Documents, artifacts) — need its file/name |
| 5 | quick digits | committed |
| 6 | console errors | committed: dev scan 0 errors en 390+1440 (GL ReadPixels = headless GL backend, 0 with --use-angle=metal). countdown #418 (ar) fixed: zone list sorted with runtime-default collation → localeCompare(…, locale) (committed 4421f0ce) |
| 7 | debt routes | committed: docs static done; [slug] route NOT dead (serves 4 live-data tools) — kept |
| 8 | chart axis ≥12px | PARTIAL, merged 8ec84db5: small labels main 11742 → 0 (axis-label-check.mjs, en 1440+390, prod :3101). Remaining: overlaps main 73 → 212, clipped 167 → 227 (diff per tool: scripts/output/axis-r1.txt vs axis-main.txt); worst @390 sci-notation 30, world-time 23, ohms 17, crypto 10 |
| 9 | rules contradiction | done |
| 10 | branch cleanup | remote delete of feat/tool-framework (0 unmerged) denied by permission — left to Yousef; others have unmerged commits |

Verify r1 (branch build :3101, before #418 fix): phone guard --ids 98 tools 0 failures; home-phone lock PASS; tap check 5 pages 0 blocked; desktop diff 14 tools x2: 0 except countdown 4 tick lines 1px (px2 rounding, <0.01px real) and ar weather 3 live-data lines.
