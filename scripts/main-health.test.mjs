// node --test scripts/main-health.test.mjs — main-health.mjs against a mocked GitHub API.
import assert from "node:assert/strict";
import { test } from "node:test";
import { run, issueTitle, LABEL, ASSIGNEE } from "./main-health.mjs";

const REPO = "o/r";

// In-memory GitHub: jobs/annotations for one run, issues, labels; records every write.
function mockGitHub({ jobs = [], annotations = {}, issues = [], labelExists = true, latestRun } = {}) {
  const writes = [];
  let nextIssue = 100;
  const api = async (method, path, body, { allow404 = false } = {}) => {
    const p = path.replace(/[?&]per_page=\d+/, "").replace(/[?&]page=\d+/, "");
    if (method === "GET" && /\/actions\/runs\/\d+\/jobs/.test(p)) return { status: 200, data: { jobs } };
    if (method === "GET" && /\/actions\/workflows\/\d+\/runs/.test(p)) {
      return { status: 200, data: { workflow_runs: latestRun ? [latestRun] : [] } };
    }
    let m;
    if (method === "GET" && (m = p.match(/\/check-runs\/(\d+)\/annotations/))) {
      return { status: 200, data: annotations[m[1]] ?? [] };
    }
    if (method === "GET" && p.includes(`/labels/${LABEL}`)) {
      if (labelExists) return { status: 200, data: { name: LABEL } };
      if (allow404) return { status: 404, data: null };
      throw new Error("404");
    }
    if (method === "GET" && p.includes("/issues")) {
      return { status: 200, data: issues.filter((i) => i.state === "open" && i.labels.includes(LABEL)) };
    }
    writes.push({ method, path, body });
    if (method === "POST" && path.endsWith("/issues")) {
      const issue = { number: nextIssue++, title: body.title, state: "open", labels: body.labels };
      issues.push(issue);
      return { status: 201, data: issue };
    }
    if (method === "PATCH" && (m = path.match(/\/issues\/(\d+)$/))) {
      const issue = issues.find((i) => i.number === Number(m[1]));
      Object.assign(issue, body);
      return { status: 200, data: issue };
    }
    return { status: 201, data: {} };
  };
  return { api, writes, issues };
}

const runEvent = (overrides = {}) => ({
  workflow_run: {
    id: 1,
    run_number: 10,
    workflow_id: 7,
    name: "CI",
    head_branch: "main",
    head_sha: "abc123",
    conclusion: "success",
    html_url: "https://github.com/o/r/actions/runs/1",
    ...overrides,
  },
});
const quiet = () => {};

test("a failed run opens an assigned, labelled issue with the failing job", async () => {
  const gh = mockGitHub({
    jobs: [{ id: 11, name: "build", conclusion: "failure" }],
    annotations: { 11: [{ annotation_level: "failure", path: ".github", start_line: 1, message: "exit code 1" }] },
  });
  const result = await run({ api: gh.api, repo: REPO, event: runEvent({ conclusion: "failure" }), log: quiet });
  assert.equal(result, "opened");
  const created = gh.writes.find((w) => w.method === "POST" && w.path.endsWith("/issues"));
  assert.equal(created.body.title, issueTitle("CI"));
  assert.deepEqual(created.body.labels, [LABEL]);
  assert.deepEqual(created.body.assignees, [ASSIGNEE]);
  assert.match(created.body.body, /build \(failure\)/);
  assert.match(created.body.body, /exit code 1/);
  assert.match(created.body.body, /actions\/runs\/1/);
});

test("a repeated failure comments on the open issue instead of opening another", async () => {
  const gh = mockGitHub({
    jobs: [{ id: 11, name: "build", conclusion: "failure" }],
    issues: [{ number: 5, title: issueTitle("CI"), state: "open", labels: [LABEL] }],
  });
  const result = await run({ api: gh.api, repo: REPO, event: runEvent({ conclusion: "failure" }), log: quiet });
  assert.equal(result, "commented");
  assert.equal(gh.writes.length, 1);
  assert.equal(gh.writes[0].path, `/repos/${REPO}/issues/5/comments`);
});

test("a successful run with a warning annotation opens an issue", async () => {
  const gh = mockGitHub({
    jobs: [{ id: 11, name: "build", conclusion: "success" }],
    annotations: { 11: [{ annotation_level: "warning", path: ".github", start_line: 3, message: "Node 20 is deprecated" }] },
    labelExists: false,
  });
  const result = await run({ api: gh.api, repo: REPO, event: runEvent(), log: quiet });
  assert.equal(result, "opened");
  assert.ok(gh.writes.some((w) => w.path.endsWith("/labels") && w.body.name === LABEL), "creates the missing label");
  const created = gh.writes.find((w) => w.path.endsWith("/issues"));
  assert.match(created.body.body, /\[warning\] build: .*Node 20 is deprecated/);
});

test("a clean success closes only its own workflow's issue", async () => {
  const gh = mockGitHub({
    jobs: [{ id: 11, name: "build", conclusion: "success" }],
    annotations: { 11: [{ annotation_level: "notice", path: ".github", start_line: 1, message: "fyi" }] },
    issues: [
      { number: 5, title: issueTitle("CI"), state: "open", labels: [LABEL] },
      { number: 6, title: issueTitle("CodeQL"), state: "open", labels: [LABEL] },
    ],
  });
  const result = await run({ api: gh.api, repo: REPO, event: runEvent(), log: quiet });
  assert.equal(result, "closed");
  assert.equal(gh.issues.find((i) => i.number === 5).state, "closed");
  assert.equal(gh.issues.find((i) => i.number === 6).state, "open");
  assert.ok(gh.writes.every((w) => !w.path.includes("/issues/6")), "never touches another workflow's issue");
  assert.match(gh.writes[0].body.body, /actions\/runs\/1/);
});

test("a clean success with nothing open writes nothing", async () => {
  const gh = mockGitHub({ jobs: [{ id: 11, name: "build", conclusion: "success" }] });
  const result = await run({ api: gh.api, repo: REPO, event: runEvent(), log: quiet });
  assert.equal(result, "clean");
  assert.equal(gh.writes.length, 0);
});

test("a run cancelled by a newer run on main gives no verdict", async () => {
  const gh = mockGitHub({ latestRun: { id: 2, run_number: 11 } });
  const result = await run({ api: gh.api, repo: REPO, event: runEvent({ conclusion: "cancelled" }), log: quiet });
  assert.equal(result, "superseded");
  assert.equal(gh.writes.length, 0);
});

test("a cancelled run that is still the latest (e.g. timeout) opens an issue", async () => {
  const gh = mockGitHub({
    jobs: [{ id: 11, name: "build", conclusion: "cancelled" }],
    latestRun: { id: 1, run_number: 10 },
  });
  const result = await run({ api: gh.api, repo: REPO, event: runEvent({ conclusion: "cancelled" }), log: quiet });
  assert.equal(result, "opened");
});
