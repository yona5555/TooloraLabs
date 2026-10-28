# Security Policy

## Reporting a vulnerability

Please report security issues privately through GitHub's private vulnerability reporting:
open https://github.com/yona5555/TooloraLabs/security/advisories/new (Security tab → "Report a vulnerability").

Do not open a public issue, pull request or discussion for a vulnerability. You will get an
acknowledgement within 7 days; please allow time for a fix before any public disclosure.

## Supported versions

Only the current `main` branch (the deployed site) receives security fixes.

## Scope

In scope: this repository's code, its GitHub Actions workflows and the deployed site.
Out of scope: third-party data sources and services the site links to or reads from.

## Supply-chain security

- **Dependabot** alerts and security updates are on; version updates run weekly. Minor/patch updates merge
  automatically only after every required check passes; major updates are reviewed by hand.
- **npm audit** (vulnerabilities and registry signatures) is a required check on every pull request.
- **CodeQL** scans the JavaScript/TypeScript code and the GitHub Actions workflows on every pull request.
- **OpenSSF Scorecard** results: https://scorecard.dev/viewer/?uri=github.com/yona5555/TooloraLabs
- **SBOM**: a CycloneDX SBOM of the production dependencies is built on every push to `main` (workflow
  artifact `sbom-cyclonedx`, kept 90 days).
