// Cache policy: a PR run only restores caches; only a push to main saves one, so PRs can neither fill the 10 GB
// repository limit nor seed a cache another run trusts. In every workflow and local composite action:
//   - actions/cache/save carries the guard github.event_name == 'push' && github.ref == 'refs/heads/main';
//   - actions/cache itself is forbidden (its post step saves from every ref);
//   - actions/setup-node sets no `cache` input and package-manager-cache: false (both save from every ref).
// Usage: node scripts/cache-policy.mjs [file.yml ...]   (default: .github/workflows/*.yml, .github/actions/*/action.yml)
// Exits 1 naming the file, job and step; tests/gates-self-test.mjs proves it on a broken fixture.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parse } from "yaml";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const GUARD = "github.event_name == 'push' && github.ref == 'refs/heads/main'";

function stepFindings(step, name) {
  const uses = step.uses ?? "";
  if (/^actions\/cache@/.test(uses)) return [`${name}: actions/cache saves from every ref; use actions/cache/restore, and actions/cache/save on main`];
  if (/^actions\/cache\/save@/.test(uses) && !String(step.if ?? "").includes(GUARD)) return [`${name}: a cache save without the guard ${GUARD}`];
  if (/^actions\/setup-node@/.test(uses)) {
    if (step.with?.cache) return [`${name}: setup-node \`cache\` saves from every ref; use ./.github/actions/npm-ci`];
    if (step.with?.["package-manager-cache"] !== false) return [`${name}: setup-node needs package-manager-cache: false (its automatic cache saves from every ref)`];
  }
  return [];
}

export function cacheFindings(text, file = "<workflow>") {
  const doc = parse(text);
  const jobs = doc?.runs?.steps ? { composite: doc.runs } : (doc?.jobs ?? {});
  return Object.entries(jobs).flatMap(([jobName, job]) => (job.steps ?? []).flatMap((step, i) => stepFindings(step, `${file} ${jobName} step ${i + 1} (${step.name ?? step.uses ?? "run"})`)));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const workflows = join(ROOT, ".github/workflows");
  const actions = join(ROOT, ".github/actions");
  const files = process.argv.length > 2
    ? process.argv.slice(2)
    : [...readdirSync(workflows).filter((f) => /\.ya?ml$/.test(f)).map((f) => join(workflows, f)), ...readdirSync(actions).map((d) => join(actions, d, "action.yml")).filter(existsSync)];
  const findings = files.flatMap((f) => cacheFindings(readFileSync(f, "utf8"), relative(ROOT, f)));
  for (const f of findings) console.log(`::error title=Cache policy::${f}`);
  if (findings.length) process.exit(1);
  console.log(`cache policy: ${files.length} files; only a push to main saves a cache`);
}
