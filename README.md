# TooloraLabs

A monorepo platform for free online calculators, converters, and generators —
built for quality and long-term scale rather than raw quantity. 31 tools,
each with full encyclopedic-depth content, live in 6 languages.

## Structure

- `apps/web` — Next.js 16 app (App Router), the public site
- `packages/core` — Tool execution engine, registry, pipeline, contracts
- `packages/sdk` — Tool-building SDK: builders, validators, plugins
- `packages/tools` — Actual tool implementations (calculators, converters, generators)

## Tech Stack

- Next.js 16 (Turbopack) + React 19 + TypeScript 5
- Tailwind CSS 4
- next-intl (6 locales: en, ar, de, es, fr, hi)
- npm workspaces (monorepo)

## Getting Started

```bash
npm install
npm run dev --workspace=apps/web
```

Open http://localhost:3000

## Development Workflow

1. Branch from `main`
2. Develop the feature
3. `npm run lint --workspace=apps/web`
4. `npm run build --workspace=apps/web`
5. Typecheck each touched package: `npx tsc --noEmit --project packages/<name>/tsconfig.json`
6. Test each touched package: `npm run test --workspace=packages/<name>`
7. Commit, push, open a PR — CI runs lint/typecheck/test/build automatically
8. Merge, delete branch

## Known Issues

See [SECURITY-NOTES.md](./SECURITY-NOTES.md) for accepted npm audit risks
(upstream Next.js dependency issue, not project-specific).

## Status

- **31 tools** live, each connected to `packages/core`/`packages/sdk` where
  applicable, with full encyclopedic-depth content (above-the-fold UI +
  education section, worked examples, FAQ, "behind the tool" history, and
  academic references) — no "Coming Soon" placeholders remain.
- **6 languages** fully translated end to end: English, Arabic, German,
  Spanish, French, and Hindi — both the site chrome (navbar, footer,
  homepage, legal pages, category pages) and every individual tool page.
- Organized into 6 categories: Calculators, Converters, Developer Tools,
  Text Tools, File Tools, Financial Markets.
- Embeddable widget (`/embed/[slug]` + the embed-tools docs page) and the
  financial-calculators comparison page are both live.
- CI (lint, typecheck, test, build) runs on every push to `main` and is
  green. See [ROADMAP.md](./ROADMAP.md) for what's next.
