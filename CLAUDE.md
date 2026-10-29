# TooloraLabs — Claude Code Instructions (auto-loaded every session)
Keep this file short to save credits.

## Reference files
Read `docs/RULES-SUMMARY.md` (compact, always applies) for the project basics, visual rules §37–44,
and standing lessons. Read a specific section of TooloraLabs-Claude-Instructions.md only when a task
needs it; never load the whole file. Same for ROADMAP.md and docs/claude/full-project-handbook.md.
Auto-loaded from .claude/rules/ on top of this: working-with-yousef.md, core-principles.md and
financial-neutrality.md (always), and visuals.md / i18n.md / packages.md / testing.md / live-data.md /
category-order.md / print-export.md (path-triggered — see each file's own header).
On demand: docs/ARCHITECTURE.md — Mermaid architecture diagram + pending architecture notes.
TooloraLabs-Claude-Instructions.md is a historical archive; the binding rules are this file and .claude/rules/. Never read it (~216 KB) or ROADMAP.md in full: grep -n '^## ' then read only the needed section.

## قواعد لا تُخالَف
- Never report a result you did not verify with a test or measurement.
- Every task ends with: push the branch, open a PR, enable auto-merge (gh pr merge --auto --merge --delete-branch), report the PR URL, and stop. Never wait for CI, never poll, never ask Yousef to paste follow-up lines for CI. Progress files are deleted in the PR itself, before merge.
- Auto-merge is always the LAST step, enabled only after git ls-remote confirms the pushed HEAD. Baseline approvals use the label flow; required lock checks fail while an approve label is present.
- Never regenerate or overwrite approved work in bulk; change only what is broken, one item at a time. (Tool-card previews: approved images are locked in `apps/web/public/tool-previews/approved.json`; `npm run previews -- <slug>` skips them, `--force <slug>` redoes one; `npm run test:cards` checks the served cards.)
- Every final report MUST end with: 'Context: <percent>% — <advice>'. Above 50% the advice is 'run /clear now'.
- Details matter: clipping, cropping, stale cache and wrong elements are bugs. Check them before saying done.
- Performance numbers: the only official metric is Lighthouse mobile (CLI, default throttling), 3 runs per page, median, on a production build. Any other timing method may be used only to compare two builds and must be labelled as such in the report.
- Never kill a process you did not start, and never kill by port (no lsof/fuser/pkill/kill on a port's PIDs):
  stop only what you started, by its own PID. Test servers use a dedicated port (3109 desktop-lock, 3110 CI
  via scripts/test-server.sh), checked free first; if it is taken, fail with a clear message. Port 3001 is
  Yousef's dev server: never stop or restart it unless asked.
  No script defaults to a port: every audit/lock/preview script takes an explicit BASE/--base/--port
  (scripts/lib/require-base.mjs) or starts its own server on its dedicated free port.
- Never use /loop, ScheduleWakeup, scheduled wakeups, sleep/until/polling loops or any other waiting mechanism.
  Run each command once, write its output to a file, and read that file once.
- Zero warnings: any CI annotation, deprecation, build, lint or console warning is fixed immediately at the root. A report that mentions a warning without fixing it is not accepted.

## Hard rules
- All user-facing text (progress notes, questions, reports) is in Modern Standard Arabic only, even when the command or task is written in English. Code, commands, file names and identifiers stay in English. Never write in any other language.
- If a request is ambiguous, state your understanding in one line and wait. Never re-ask something already answered.
- Explain every terminal command in one sentence; translate terminal options to Arabic and give the option number.
- Never take or review screenshots (no Playwright screenshots, no image review), to save quota. Yousef reviews pages himself in the browser. At the end of any visual task, give him the list of page URLs to review (e.g. http://localhost:3001/ar/tools/<slug>). Reading values from the DOM via Playwright is still allowed when needed.
- If you cannot find what was asked for, say so plainly; never invent a fix. Apply a general rule to every element, no exceptions.
- git pull before work; work on a task branch and commit + push it after each finished part (main is protected: PR + green build, home-phone-lock, desktop-lock; GitHub auto-merges). No force push, no reset --hard.
- Before each commit, once: lint, tsc, tests, build.
- packages/core|sdk|tools are pure logic: no window/document/DOM.
- Desktop layout is LOCKED (approved 2026-10-26): `npm run test:desktop-lock` (1440px, every tool + /, /tools, /categories, /docs, en+ar) must pass; rewrite its baseline (`baseline:desktop-lock -- --approve`, CI label `approve-desktop-baseline`) only with Yousef's approval. The label makes CI's regenerate-baselines job write the Linux baseline, remove the label and push it as the GitHub App (normal PR run, auto-merge proceeds); no manual commit.
- Any new UI text goes into all 6 locales (en, ar, es, fr, de, hi) with 1:1 keys.
- Tool route: /{locale}/tools/{slug}.
- Never print secrets in any output, report, command or log: API keys, tokens, passwords, webhook/IPN secrets, private keys, connection strings, or values from .env* files. Refer to them by variable NAME only and mask the value (e.g. METALPRICE_API_KEY=****). Never cat or echo .env* files. Never commit secrets.

## Gates and platform parity
- Every gate proves itself: `npm run test:gates-self-test` (CI `gates-self-test`, required) runs each gate on a broken
  fixture in tests/gates/ and fails if any gate passes it. A new gate gets a canary in the same PR.
- Every workflow runs bash with pipefail; never pipe a gate's output (`node scripts/workflow-shell.mjs`).
- Fonts are self-hosted only (apps/web/lib/fonts.ts); no system family in source (`npm run test:system-fonts`).
- Audits, locks and previews run in the Linux container (`scripts/in-container.sh [--ci-parity] <cmd>`, colima on the Mac);
  never report macOS results for them. Local audit runs use `scripts/site-audit-sharded.sh`; `site-audit` (CI, required)
  must stay at 0 on every criterion.
- Speed is a hard gate: `perf-budget` (CI, required; `scripts/perf-budget.sh`, Lighthouse mobile, 3 runs, median, production
  build) fails any indexable page (en + ar) with LCP > 2.5s, TBT > 200ms, CLS > 0.1, Performance < 90 or JS over budget.
- Required PR checks finish within 15 minutes: on a PR, site-audit and perf-budget measure only the pages whose route
  fingerprint changed (`scripts/route-manifest.mjs`, CI job `affected`: chunks, prerendered HTML/RSC, server bundle,
  fixtures, gate scripts; a shared chunk marks every page using it). The daily scheduled CI run on main measures every
  page; main-health opens an issue when it fails.
- Local iteration runs natively on arm64 (`scripts/in-container.sh <cmd>`); `--ci-parity` runs linux/amd64 like CI,
  which stays the final authority.

## Supply chain
- Required checks on main (strict): build, home-phone-lock, desktop-lock, site-audit, gates-self-test, perf-budget, audit, Analyze (javascript-typescript),
  Analyze (actions), zero-warnings, audit-zero-warnings, codeql-zero-warnings (the last three run scripts/zero-warnings.sh).
- Dependabot (weekly, Mon 06:00 Riyadh, 7-day cooldown; security updates immediate): minor/patch and security
  minor/patch get auto-merge (dependabot-automerge.yml, App token) and merge only after every required check
  passes. Majors are never auto-merged: labelled major-update, reviewed one at a time.
- pr-autoupdate.yml: after each push to main, every auto-merge PR that is behind main is updated
  (Dependabot: rebase; others: merge). A conflict is logged in the run summary and skipped.
- Scorecard: https://scorecard.dev/viewer/?uri=github.com/yona5555/TooloraLabs (+ Security → Code scanning).
  SBOM: artifact sbom-cyclonedx (90 days) on each SBOM workflow run on main.

## Adding rules
When Yousef says "add this rule", add it to the right file in docs/claude/ (or here if it is a hard rule), then commit + push.
