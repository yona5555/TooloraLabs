// main-health: one GitHub issue per workflow that tracks whether its latest run on main is clean.
// Called by .github/workflows/main-health.yml on workflow_run (completed) for every workflow on main.
// - Run not successful, or any warning/failure annotation → open "main-health: <workflow>" (assigned to
//   the owner, so a notification is sent) or comment on it if already open.
// - Clean success → comment with the green run and close that workflow's own open issue (no other issue).
// - Cancelled because a newer run of the same workflow on main superseded it → no verdict; the newer run reports.
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

export const LABEL = "main-health";
export const ASSIGNEE = "yona5555";
const BAD_JOB = new Set(["failure", "cancelled", "timed_out", "action_required", "startup_failure"]);

export const issueTitle = (workflowName) => `main-health: ${workflowName}`;

async function paginate(api, path, key) {
  const items = [];
  for (let page = 1; ; page++) {
    const sep = path.includes("?") ? "&" : "?";
    const { data } = await api("GET", `${path}${sep}per_page=100&page=${page}`);
    const batch = key ? data[key] : data;
    items.push(...batch);
    if (batch.length < 100) return items;
  }
}

async function isSuperseded(api, repo, run) {
  const { data } = await api("GET", `/repos/${repo}/actions/workflows/${run.workflow_id}/runs?branch=main&per_page=1`);
  const latest = data.workflow_runs[0];
  return Boolean(latest && latest.id !== run.id && latest.run_number > run.run_number);
}

async function collectProblems(api, repo, run) {
  const jobs = await paginate(api, `/repos/${repo}/actions/runs/${run.id}/jobs?filter=latest`, "jobs");
  const failedJobs = jobs.filter((job) => BAD_JOB.has(job.conclusion)).map((job) => `${job.name} (${job.conclusion})`);
  const annotations = [];
  for (const job of jobs) {
    for (const a of await paginate(api, `/repos/${repo}/check-runs/${job.id}/annotations`)) {
      if (a.annotation_level === "warning" || a.annotation_level === "failure") {
        annotations.push(`[${a.annotation_level}] ${job.name}: ${a.path}:${a.start_line} ${a.message}`.trim());
      }
    }
  }
  return { failedJobs, annotations };
}

async function ensureLabel(api, repo) {
  const { status } = await api("GET", `/repos/${repo}/labels/${LABEL}`, undefined, { allow404: true });
  if (status === 404) {
    await api("POST", `/repos/${repo}/labels`, {
      name: LABEL,
      color: "D93F0B",
      description: "Latest run of a workflow on main failed or produced warnings",
    });
  }
}

async function findOpenIssue(api, repo, title) {
  const issues = await paginate(api, `/repos/${repo}/issues?state=open&labels=${LABEL}`);
  return issues.find((issue) => !issue.pull_request && issue.title === title);
}

function report(run, { failedJobs, annotations }) {
  const lines = [
    `**${run.name}** run on main: conclusion \`${run.conclusion}\` — ${run.html_url}`,
    `Commit: ${run.head_sha}`,
    "",
    `Failing jobs: ${failedJobs.length ? failedJobs.join(", ") : "none"}`,
  ];
  if (annotations.length) lines.push("", "Annotations:", ...annotations.map((a) => `- ${a}`));
  return lines.join("\n");
}

export async function run({ api, repo, event, log = console.log }) {
  const wr = event.workflow_run;
  if (wr.head_branch !== "main") {
    log(`Skipped: run ${wr.id} is on ${wr.head_branch}, not main.`);
    return "skipped";
  }
  if (wr.conclusion === "cancelled" && (await isSuperseded(api, repo, wr))) {
    log(`Skipped: run ${wr.id} was cancelled by a newer run of ${wr.name}.`);
    return "superseded";
  }

  const problems = await collectProblems(api, repo, wr);
  const healthy = wr.conclusion === "success" && problems.annotations.length === 0;
  const title = issueTitle(wr.name);
  const open = await findOpenIssue(api, repo, title);

  if (healthy) {
    if (!open) {
      log(`${wr.name}: clean, no open issue.`);
      return "clean";
    }
    await api("POST", `/repos/${repo}/issues/${open.number}/comments`, {
      body: `Clean again: ${wr.html_url} (commit ${wr.head_sha}). Closing.`,
    });
    await api("PATCH", `/repos/${repo}/issues/${open.number}`, { state: "closed", state_reason: "completed" });
    log(`${wr.name}: clean, closed #${open.number}.`);
    return "closed";
  }

  const body = report(wr, problems);
  if (open) {
    await api("POST", `/repos/${repo}/issues/${open.number}/comments`, { body });
    log(`${wr.name}: unhealthy, commented on #${open.number}.`);
    return "commented";
  }
  await ensureLabel(api, repo);
  const { data } = await api("POST", `/repos/${repo}/issues`, {
    title,
    body,
    labels: [LABEL],
    assignees: [ASSIGNEE],
  });
  log(`${wr.name}: unhealthy, opened #${data.number}.`);
  return "opened";
}

export function githubApi(token) {
  return async (method, path, body, { allow404 = false } = {}) => {
    const res = await fetch(`https://api.github.com${path}`, {
      method,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (allow404 && res.status === 404) return { status: 404, data: null };
    if (!res.ok) throw new Error(`${method} ${path} → ${res.status} ${await res.text()}`);
    return { status: res.status, data: res.status === 204 ? null : await res.json() };
  };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const event = JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH, "utf8"));
  await run({ api: githubApi(process.env.GITHUB_TOKEN), repo: process.env.GITHUB_REPOSITORY, event });
}
