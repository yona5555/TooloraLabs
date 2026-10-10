---
paths:
  - "apps/web/components/tools/**"
  - "apps/web/lib/**"
---
# Live data and currency (every tool)

- **Real data only:** free, keyless sources whose terms allow public display. No paid APIs until the site has revenue. Never invent or simulate figures.
- **State the limit on the page:** any data limit (delay, update frequency, history depth, coverage) is written on the page next to the data.
- **Display currency:** a selector listing every supported fiat currency, remembered per visitor (localStorage in try/catch).
- Secrets: see the hard rule in `CLAUDE.md` (names only, values masked).
