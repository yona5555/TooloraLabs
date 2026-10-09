# TooloraLabs — Claude Code Instructions (auto-loaded every session)
Keep this file short to save credits. Details live in docs/claude/; read only the file the task needs.

## Reference files
- docs/claude/working-rules.md — general rules for working with Yousef, efficient testing, Git
- docs/claude/what-yousef-dislikes.md — what Yousef rejects + lessons (wins on conflict)
- docs/claude/full-project-handbook.md — architecture, roles, rules index §0–§43, pending tasks
- docs/claude/fixed-errors-log.md — fixed errors; check before diagnosing any bug
- docs/claude/approved-visuals-and-indicators.md — read before choosing or building any chart/indicator
Never read TooloraLabs-Claude-Instructions.md (~216 KB) or ROADMAP.md in full: grep -n '^## ' then read only the needed section.

## Hard rules
- Reply in Modern Standard Arabic only, no dialect. Code, commands and identifiers in English. Short replies, no preamble, no recap.
- If a request is ambiguous, state your understanding in one line and wait. Never re-ask something already answered.
- Explain every terminal command in one sentence; translate terminal options to Arabic and give the option number.
- Never claim "done" for a visual change without real screenshots (light, dark, Arabic RTL). One final screenshot pass only.
- If you cannot find what was asked for, say so plainly; never invent a fix. Apply a general rule to every element, no exceptions.
- git pull before work; commit + push after each finished part; verify CI silently. No force push, no reset --hard.
- Before each commit, once: lint, tsc, tests, build.
- packages/core|sdk|tools are pure logic: no window/document/DOM.
- Any new UI text goes into all 6 locales (en, ar, es, fr, de, hi) with 1:1 keys.
- Tool route: /{locale}/tools/{slug}.

## Adding rules
When Yousef says "add this rule", add it to the right file in docs/claude/ (or here if it is a hard rule), then commit + push.
