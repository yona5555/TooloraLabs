#!/usr/bin/env node
// Headed phone preview of the local site with full device emulation.
//   npm run phone -- --port <n>                      -> Pixel 7, Chromium (Android Chrome)
//   npm run phone:iphone -- --port <n>               -> iPhone 14, WebKit (Safari engine)
//   npm run phone -- --port <n> /ar/tools/<slug>     -> start on a specific path
// The port is always given (no default: 3001 is the dev server and is only used when named). Opens the server
// already listening on that port, or starts a dev server there if the port is free. The window stays
// open until it is closed by hand; the script then exits (the dev server keeps running).
import { execSync, spawn } from 'node:child_process';
import { mkdirSync, openSync, readFileSync, watch } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, devices, webkit } from 'playwright';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT_DIR = join(ROOT, 'scripts', 'output');
const LOG_FILE = join(OUTPUT_DIR, 'dev.log');

const args = process.argv.slice(2);
const portAt = args.indexOf('--port');
const PORT = portAt > -1 ? Number(args[portAt + 1]) : NaN;
if (!Number.isInteger(PORT) || PORT <= 0) {
  console.error('phone-preview: no port given. Pass --port <n> (e.g. npm run phone -- --port 3120); there is no default port.');
  process.exit(2);
}
const iphone = args.includes('--iphone');
const path = args.find((a) => a.startsWith('/')) ?? '/ar/tools';
const url = `http://localhost:${PORT}${path}`;
const deviceName = iphone ? 'iPhone 14' : 'Pixel 7';
const browserType = iphone ? webkit : chromium;

function portInUse() {
  try {
    execSync(`lsof -iTCP:${PORT} -sTCP:LISTEN -t`, { stdio: 'pipe' });
    return true;
  } catch {
    return false; // lsof exits 1 when nothing listens
  }
}

// Resolves when next dev logs that it is ready (file-change events, no polling).
function startDevServer() {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const log = openSync(LOG_FILE, 'w');
  const child = spawn('npm', ['run', 'dev', '--', '-H', '0.0.0.0', '-p', String(PORT)], {
    cwd: join(ROOT, 'apps', 'web'),
    stdio: ['ignore', log, log],
    detached: true,
  });
  child.unref();
  console.log(`Starting dev server on :${PORT} (log: scripts/output/dev.log)`);
  return new Promise((resolve, reject) => {
    const watcher = watch(LOG_FILE, () => {
      if (/Ready in|Local:/.test(readFileSync(LOG_FILE, 'utf8'))) done(resolve);
    });
    const timer = setTimeout(() => done(() => reject(new Error('Dev server not ready after 120s, see scripts/output/dev.log'))), 120_000);
    child.on('exit', (code) => done(() => reject(new Error(`Dev server exited (code ${code}), see scripts/output/dev.log`))));
    function done(fn) {
      watcher.close();
      clearTimeout(timer);
      fn();
    }
  });
}

async function launch() {
  try {
    return await browserType.launch({ headless: false });
  } catch (err) {
    if (!/Executable doesn't exist|playwright install/.test(String(err))) throw err;
    console.log('Installing Playwright browsers (one time)...');
    execSync('npx playwright install chromium webkit', { cwd: ROOT, stdio: 'inherit' });
    return browserType.launch({ headless: false });
  }
}

if (!portInUse()) {
  await startDevServer();
  // Single request with a long timeout: the first compile of the page can be slow.
  await fetch(url, { signal: AbortSignal.timeout(180_000) });
}

const browser = await launch();
const context = await browser.newContext({ ...devices[deviceName] });
const page = await context.newPage();
console.log(`${deviceName} (${browserType.name()}) -> ${url}`);
await page.goto(url, { timeout: 180_000 });

// Exit once every tab is closed or the browser goes away.
const exit = async () => {
  await browser.close().catch(() => {});
  process.exit(0);
};
browser.on('disconnected', () => process.exit(0));
context.on('page', (p) => p.on('close', () => context.pages().length === 0 && exit()));
page.on('close', () => context.pages().length === 0 && exit());
