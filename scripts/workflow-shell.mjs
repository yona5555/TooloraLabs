// Workflow shell rule: a gate's exit code must decide its step. Every workflow sets
// `defaults: run: shell: bash` (GitHub runs it as `bash --noprofile --norc -eo pipefail {0}`, so a failure
// anywhere in a pipeline fails the step), no step switches to another shell, and no step pipes a gate
// (node / npm / npx / a repository script) into another command whose status could stand in for it.
// Usage: node scripts/workflow-shell.mjs [workflow.yml ...]   (default: .github/workflows/*.yml)
// Exits 1 naming the workflow, job and step; tests/gates-self-test.mjs proves it on a broken fixture.
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parse } from "yaml";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const GATE_PIPE = /(?:^|[;&(\s])(?:node|npm|npx|scripts\/[\w./-]+)\b[^\n|]*\|(?!\|)/m;

export function workflowFindings(text, file = "<workflow>") {
  const wf = parse(text);
  const findings = [];
  if (wf?.defaults?.run?.shell !== "bash") findings.push(`${file}: no top-level defaults.run.shell: bash (pipefail)`);
  for (const [jobName, job] of Object.entries(wf?.jobs ?? {})) {
    if (job.defaults?.run?.shell && job.defaults.run.shell !== "bash") findings.push(`${file} ${jobName}: job default shell ${job.defaults.run.shell}`);
    for (const [i, step] of (job.steps ?? []).entries()) {
      const name = `${file} ${jobName} step ${i + 1} (${step.name ?? step.uses ?? "run"})`;
      if (step.shell && step.shell !== "bash") findings.push(`${name}: shell ${step.shell} (not bash with pipefail)`);
      if (typeof step.run === "string" && GATE_PIPE.test(step.run)) findings.push(`${name}: a gate's output is piped into another command: ${step.run.match(GATE_PIPE)[0].trim()}`);
    }
  }
  return findings;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dir = join(ROOT, ".github/workflows");
  const files = process.argv.length > 2 ? process.argv.slice(2) : readdirSync(dir).filter((f) => /\.ya?ml$/.test(f)).map((f) => join(dir, f));
  const findings = files.flatMap((f) => workflowFindings(readFileSync(f, "utf8"), relative(ROOT, f)));
  for (const f of findings) console.log(`::error title=Workflow shell::${f}`);
  if (findings.length) process.exit(1);
  console.log(`workflow shell: ${files.length} workflows run bash with pipefail; no gate is piped`);
}
