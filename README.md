# TooloraLabs

A monorepo platform for calculators, converters, generators, and AI-powered
tools — built for quality and long-term scale rather than raw quantity.

## Structure

- `apps/web` — Next.js 16 app (App Router), the public site
- `packages/core` — Tool execution engine, registry, pipeline, contracts
- `packages/sdk` — Tool-building SDK: builders, validators, plugins
- `packages/tools` — Actual tool implementations (calculators, converters, generators)

## Tech Stack

- Next.js 16 (Turbopack) + React 19 + TypeScript 7
- Tailwind CSS 4
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
6. Commit, push, open a PR — CI runs lint/typecheck/build automatically
7. Merge, delete branch

## Known Issues

See [SECURITY-NOTES.md](./SECURITY-NOTES.md) for accepted npm audit risks
(upstream Next.js dependency issue, not project-specific).

## Status

Currently building the shared tool framework (`packages/core`, `packages/sdk`)
before scaling out to dozens of tools. First tool (Mortgage Calculator) is
complete and merged.
