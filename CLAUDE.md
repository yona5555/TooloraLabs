# TooloraLabs — Claude Code Instructions (auto-loaded every session)
Keep this file short to save credits.

## Reference files
Read `docs/RULES-SUMMARY.md` (compact, always applies) for the project basics, visual rules §37–44,
and standing lessons. Read a specific section of TooloraLabs-Claude-Instructions.md only when a task
needs it; never load the whole file. Same for ROADMAP.md and docs/claude/full-project-handbook.md.
Auto-loaded from .claude/rules/ on top of this: working-with-yousef.md (always), and visuals.md /
i18n.md / packages.md / testing.md / live-data.md (path-triggered — see each file's own header).

## Hard rules
- Always reply to Yousef in Modern Standard Arabic, even when the command or task is written in English. Code, commands and identifiers stay in English.
- If a request is ambiguous, state your understanding in one line and wait. Never re-ask something already answered.
- Explain every terminal command in one sentence; translate terminal options to Arabic and give the option number.
- Never claim "done" for a visual change without real screenshots (light, dark, Arabic RTL). One final screenshot pass only.
- If you cannot find what was asked for, say so plainly; never invent a fix. Apply a general rule to every element, no exceptions.
- git pull before work; commit + push after each finished part; verify CI silently. No force push, no reset --hard.
- Before each commit, once: lint, tsc, tests, build.
- packages/core|sdk|tools are pure logic: no window/document/DOM.
- Any new UI text goes into all 6 locales (en, ar, es, fr, de, hi) with 1:1 keys.
- Tool route: /{locale}/tools/{slug}.
- Never print secrets in any output, report, command or log: API keys, tokens, passwords, webhook/IPN secrets, private keys, connection strings, or values from .env* files. Refer to them by variable NAME only and mask the value (e.g. METALPRICE_API_KEY=****). Never cat or echo .env* files. Never commit secrets.

## Adding rules
When Yousef says "add this rule", add it to the right file in docs/claude/ (or here if it is a hard rule), then commit + push.
