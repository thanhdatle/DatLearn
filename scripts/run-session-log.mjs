/**
 * The workflow driver. Run from the repo root by .github/workflows/session-log.yml.
 *
 * SECURITY: the issue body is attacker-controlled text on a public repo. It
 * arrives HERE, through `process.env.ISSUE_BODY`, and never through a shell
 * command line or a `${{ }}` interpolation inside a `run:` block. That is the
 * whole reason this file exists instead of an inline script. Do not "simplify"
 * it back into the YAML.
 *
 * Contract with the workflow, via $GITHUB_OUTPUT:
 *   status=ok     — the log changed. Commit, comment, close.
 *   status=noop   — nothing changed (a re-run on an unedited issue). Do nothing.
 *   status=error  — could not parse. Comment the reason. DO NOT commit or close.
 *
 * Always exits 0. The workflow branches on `status`, not on the exit code, so a
 * parse failure can still post a useful comment before the job is failed.
 */

import { readFileSync, writeFileSync, existsSync, appendFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

import {
  readLog,
  serialiseCsv,
  parseIssueBody,
  applyEntry,
  renderVerdict,
  renderError,
  verdictCell,
  LogError,
} from './session-log.mjs';

const CSV_PATH = 'strength/log/sessions.csv';

const env = (name) => {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var ${name}`);
  return v;
};

const setOutput = (key, value) => {
  const out = process.env.GITHUB_OUTPUT;
  if (out) appendFileSync(out, `${key}=${value}\n`);
  else console.log(`[${key}=${value}]`);
};

const write = (path, text) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text);
};

function main() {
  const body = process.env.ISSUE_BODY ?? '';
  const issueUrl = env('ISSUE_URL');
  const commentFile = env('COMMENT_FILE');
  const commitMsgFile = env('COMMIT_MSG_FILE');

  let entry;
  try {
    entry = parseIssueBody(body);
  } catch (err) {
    if (!(err instanceof LogError)) throw err;
    write(commentFile, renderError(err.message));
    setOutput('status', 'error');
    console.error(`Parse failed: ${err.message}`);
    return;
  }

  const existing = existsSync(CSV_PATH) ? readLog(readFileSync(CSV_PATH, 'utf8')) : [];
  const { rows, verdict, changed } = applyEntry(existing, entry, issueUrl);

  if (!changed) {
    setOutput('status', 'noop');
    console.log('No change to the log. Nothing to commit.');
    return;
  }

  write(CSV_PATH, serialiseCsv(rows));
  write(commentFile, renderVerdict(entry, verdict));

  // The commit message goes through a FILE (`git commit -F`), not a shell
  // argument. `lift` and `equipment` are enum-validated and therefore inert, but
  // the rule is "no user-derived text on a command line" with no exceptions —
  // an exception is how the next one gets through.
  write(
    commitMsgFile,
    [
      `log(strength): ${entry.date} — ${entry.lift} (${entry.equipment}), ` +
        `${entry.load_kg} kg × ${entry.last_set_reps} @ RPE ${entry.last_set_rpe}`,
      '',
      verdictCell(verdict),
      `Next: ${verdict.next_load_kg === null ? 'load TBD' : `${verdict.next_load_kg} kg`}, ` +
        `target ${verdict.next_target_reps} reps on the last set.`,
      '',
      `Logged from ${issueUrl}`,
    ].join('\n'),
  );

  setOutput('status', 'ok');
  console.log(`${verdictCell(verdict)} — ${rows.length} row(s) in the log.`);
}

main();
