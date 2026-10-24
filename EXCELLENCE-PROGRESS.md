# EXCELLENCE pass — progress (branch wip/excellence; delete this file at merge)

Setup: main worktree ../TooloraLabs-main-wt (cloned node_modules), prod build .next-main on :3100,
shared fetch cache scripts/output/shared-fetch-cache. Lighthouse: scripts/output/lh.sh <port> <tag>.

## Lighthouse BEFORE (main, :3100, mobile)
ar 80 / LCP 5.05s · en 84 / 4.59s · ar bmi 71 / 5.85s · en mortgage 79 / 5.02s · ar sci 68 / 6.10s · en crypto 77 / 5.35s

| # | item | status |
|---|------|--------|
| 1 | mobile perf | font preloads removed (committed). inlineCss tried: worse (CLS 0.4-1.3, ar FCP +1s) — dropped. next/dynamic per-locale font tried: still preloads all — dropped |
| 2 | empty categories | committed; redirects verified 301 on prod build |
| 3 | desktop ads | todo |
| 4 | Σ logo | todo |
| 5 | quick digits | committed |
| 6 | console errors | committed: dev scan 0 errors en 390+1440 (GL ReadPixels = headless GL backend, 0 with --use-angle=metal). countdown #418 prod ar: check |
| 7 | debt routes | committed: docs static done; [slug] route NOT dead (serves 4 live-data tools) — kept |
| 8 | chart axis ≥12px | todo |
| 9 | rules contradiction | done |
| 10 | branch cleanup | remote delete of feat/tool-framework (0 unmerged) denied by permission — left to Yousef; others have unmerged commits |
