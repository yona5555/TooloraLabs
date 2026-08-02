# Known Accepted Risks

## npm audit: 4 vulnerabilities (1 moderate, 3 high) — postcss, sharp
- Root cause: unchanged from initial finding — Next.js bundles an internal,
  outdated postcss inside node_modules/next/node_modules/postcss, and an
  outdated sharp for image optimization. Known upstream issue
  (vercel/next.js#93234) affecting all current Next.js 16.x versions.
- next-intl appears in the audit chain only because it depends on next
  itself — not an independent vulnerability in next-intl.
- No fix available via npm audit fix or package.json overrides — postcss
  and sharp are private nested dependencies inside next itself.
- Risk assessment: build-time only (CSS stringification during `next build`,
  image processing), not exploitable at runtime for end users visiting the
  site. Low practical risk for this project.
- Action: monitor Next.js releases for an update that bumps the bundled
  postcss/sharp versions. Re-run `npm audit` after each Next.js upgrade.
- Do NOT run `npm audit fix --force` — it downgrades next to 9.3.3, an
  unrelated breaking regression suggested by npm's resolver, not a real fix.

Last checked: $(date +%Y-%m-%d)
