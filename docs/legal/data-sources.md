# TooloraLabs — Data source legal proof

Rule: no data source may be added to TooloraLabs without a section in this file.

Terms verified by Yousef's assistant on 2026-10-17.

## Open-Meteo (free API) — NOT ALLOWED
- Terms: https://open-meteo.com/en/terms
- The free API is for non-commercial use only and lists "Operating websites or apps that have subscriptions or display advertisements" as commercial use.
- Checked 2026-10-17.

## MET Norway API — ALLOWED
- Terms: https://api.met.no/doc/TermsOfService
- Licence: CC BY 4.0 ("All open data require attribution as specified in the CC BY 4.0 license"; CC BY 4.0 permits commercial use).
- Requirements:
  - "You must give appropriate credit, provide a link to the license, and indicate if changes were made"
  - Identifying User-Agent on all requests.
  - "Web servers and mobile apps should cache all API responses"
  - "Anything over 20 requests/second per application (total, not per client) requires special agreement."
- Checked 2026-10-17.

## USGS (earthquakes) — ALLOWED
- Terms: https://www.usgs.gov/information-policies-and-instructions/crediting-usgs
- "Most U.S. Geological Survey (USGS) information resides in the Public Domain and may be used without restriction."
- Credit: "courtesy of the U.S. Geological Survey"
- Checked 2026-10-17.

## NASA EONET (wildfires, storms, volcanoes) — ALLOWED WITH CARE
- Terms: https://www.earthdata.nasa.gov/learn/use-data/data-use-policy
- NASA data are "licensed as Creative Commons Zero (CC0)" unless marked otherwise; "NASA should be acknowledged as the source"; must not "suggest or imply endorsement by NASA".
- Non-NASA linked sources keep their own licences: only link to them, never copy their content.
- EONET docs: https://eonet.gsfc.nasa.gov/docs/v3 (not an official source for precise data).
- Checked 2026-10-17.

## OpenFreeMap (map tiles) — ALLOWED
- Site: https://openfreemap.org
- Commercial use "Yes", no API key, no view limits; "Attribution is required" (OpenMapTiles © and OpenStreetMap; MapLibre adds it automatically).
- Checked 2026-10-17.

## OpenStreetMap tile servers — DO NOT USE
- Policy: https://operations.osmfoundation.org/policies/tiles/
- "Commercial services, or those that seek donations, should be especially aware that access may be withdrawn at any point."
- Checked 2026-10-17.

## GDACS, RainViewer, GeoNames — UNCLEAR, NOT USED
- No clear commercial-use terms found.
