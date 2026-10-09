# TooloraLabs — Claude Code Instructions (auto-loaded every session)
Keep this file short to save credits. Details live in docs/claude/; read only the file the task needs.

## Reference files
Auto-loaded from .claude/rules/:
- working-with-yousef.md — always: style, "command" mode, credit economy, Git
- visuals.md — apps/web/components/**, apps/web/app/**: page structure, chart library, indicators
- i18n.md — apps/web/messages/**: locales, Arabic, key parity
- packages.md — packages/**: pure-logic constraint, tsc/test commands
- testing.md — test/check scripts: efficient testing, fixed technical errors
On demand: docs/claude/full-project-handbook.md — architecture, roles, general rules index, pending tasks
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
