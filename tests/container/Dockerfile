# Linux environment for local audits and locks, matching CI (ubuntu runner + Playwright Chromium). One source per
# version, the same ones CI reads: Node = the exact version in .nvmrc (CI: setup-node node-version-file), Playwright
# = package-lock.json (CI: npm ci + npx playwright install). scripts/in-container.sh passes both; results measured
# on macOS are never used for audits, locks or previews.
ARG PLAYWRIGHT_VERSION
FROM mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-noble
ARG NODE_VERSION
SHELL ["/bin/bash", "-euo", "pipefail", "-c"]
RUN arch=$(dpkg --print-architecture | sed 's/amd64/x64/'); \
    curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-$arch.tar.gz" | tar -xz -C /usr/local --strip-components=1; \
    test "$(node -v)" = "v${NODE_VERSION}"
ENV NPM_CONFIG_UPDATE_NOTIFIER=false TZ=UTC LANG=C.UTF-8 LC_ALL=C.UTF-8 NEXT_TELEMETRY_DISABLED=1 CI_CONTAINER=1
WORKDIR /repo
