# Known Accepted Risks

## npm audit: 12 high severity (brace-expansion, postcss, sharp)
- Root cause: Next.js bundles an internal, outdated postcss (8.4.31) inside
  node_modules/next/node_modules/postcss. This is a known upstream issue
  (vercel/next.js#93234) affecting all current Next.js 16.x versions.
- No fix available via npm audit fix or package.json overrides — postcss is
  a private nested dependency inside next itself.
- Risk assessment: build-time only (CSS stringification during `next build`),
  not exploitable at runtime in production. Low practical risk for this project.
- Action: monitor Next.js releases for an update that bumps the bundled
  postcss/sharp versions. Re-run `npm audit` after each Next.js upgrade.
- Do NOT run `npm audit fix --force` — it downgrades next to 9.3.3, an
  unrelated breaking regression suggested by npm's resolver, not a real fix.

Last checked: 2026-07-30
