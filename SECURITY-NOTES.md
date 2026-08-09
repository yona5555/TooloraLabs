# Known Accepted Risks

## Open-Meteo free-tier "non-commercial use" terms (weather-forecast tool)
- Open-Meteo's free API tier (10,000 requests/day, no key) is documented as
  "for non-commercial use," but Open-Meteo does not publicly define what
  counts as commercial — specifically, it's unclear whether an ad-supported
  site (AdSense) using the data on a free-to-visitors page qualifies.
- Risk assessment: small and acceptable for now — the site has not launched
  yet and has no meaningful real visitor traffic, so actual exposure is
  minimal.
- Action required before/at launch: re-evaluate this once the site has real
  traffic — either contact Open-Meteo directly to clarify whether AdSense
  monetization qualifies as commercial use, or upgrade to a paid plan with
  unambiguous terms if it does.
- Tracked in TooloraLabs-Claude-Instructions.md alongside the tool's other
  documented constraints; see `weather-forecast` tool code for the actual
  integration (`apps/web/lib/weather/open-meteo.ts`).

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
