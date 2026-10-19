# TooloraLabs — Claude Code Instructions (auto-loaded every session)
Keep this file short to save credits. Details live in docs/claude/; read only the file the task needs.

## Reference files
Auto-loaded from .claude/rules/:
- working-with-yousef.md — always: style, "command" mode, credit economy, Git
- visuals.md — apps/web/components/**, apps/web/app/**: page structure, chart library, indicators
- i18n.md — apps/web/messages/**: locales, Arabic, key parity
- packages.md — packages/**: pure-logic constraint, tsc/test commands
- testing.md — test/check scripts: efficient testing, fixed technical errors
- live-data.md — apps/web/components/tools/**, apps/web/lib/**: real free keyless data, data limits, display currency
- category-order.md — the one site-wide section order (single source: CATEGORY_ORDER in data/categories.ts)
On demand: docs/claude/full-project-handbook.md — architecture, roles, general rules index, pending tasks
Never read TooloraLabs-Claude-Instructions.md (~216 KB) or ROADMAP.md in full: grep -n '^## ' then read only the needed section.

## قواعد لا تُخالَف
- Never report a result you did not verify with a test or measurement.
- Never regenerate or overwrite approved work in bulk; change only what is broken, one item at a time. (Tool-card previews: approved images are locked in `apps/web/public/tool-previews/approved.json`; `npm run previews -- <slug>` skips them, `--force <slug>` redoes one; `npm run test:cards` checks the served cards.)
- Every final report MUST end with: 'Context: <percent>% — <advice>'. Above 50% the advice is 'run /clear now'.
- Details matter: clipping, cropping, stale cache and wrong elements are bugs. Check them before saying done.

## Hard rules
- Always reply to Yousef in Modern Standard Arabic, even when the command or task is written in English. Code, commands and identifiers stay in English.
- If a request is ambiguous, state your understanding in one line and wait. Never re-ask something already answered.
- Explain every terminal command in one sentence; translate terminal options to Arabic and give the option number.
- Never take or review screenshots (no Playwright screenshots, no image review), to save quota. Yousef reviews pages himself in the browser. At the end of any visual task, give him the list of page URLs to review (e.g. http://localhost:3001/ar/tools/<slug>). Reading values from the DOM via Playwright is still allowed when needed.
- If you cannot find what was asked for, say so plainly; never invent a fix. Apply a general rule to every element, no exceptions.
- git pull before work; commit + push after each finished part; verify CI silently. No force push, no reset --hard.
- Before each commit, once: lint, tsc, tests, build.
- packages/core|sdk|tools are pure logic: no window/document/DOM.
- Any new UI text goes into all 6 locales (en, ar, es, fr, de, hi) with 1:1 keys.
- Tool route: /{locale}/tools/{slug}.
- Never print secrets in any output, report, command or log: API keys, tokens, passwords, webhook/IPN secrets, private keys, connection strings, or values from .env* files. Refer to them by variable NAME only and mask the value (e.g. METALPRICE_API_KEY=****). Never cat or echo .env* files. Never commit secrets.

## Adding rules
When Yousef says "add this rule", add it to the right file in docs/claude/ (or here if it is a hard rule), then commit + push.
