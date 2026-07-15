/**
 * Session-log plumbing: CSV in, issue-form body in, verdict comment out.
 * Zero dependencies. Plain Node ESM.
 *
 * The rule itself lives in progression-rule.mjs. Nothing in this file makes a
 * training decision — it only marshals numbers in and prose out.
 */

import { decide } from './progression-rule.mjs';

// --- The CSV ----------------------------------------------------------------

/**
 * strength/log/sessions.csv
 *
 * `notes` is not in the original column list. It is here because the escape
 * hatch printed on all five session pages — "if any earlier set felt worse than
 * your last, say so" — is delivered THROUGH the notes field. With nowhere to
 * land, that sentence is decoration. Drop this column and you drop the only
 * mitigation the three-number log has for its known blind spot.
 *
 * `block_week` is APPENDED, never inserted. Every existing column keeps its
 * position, so an old row still reads. It is not bookkeeping either: week 1 caps
 * at RPE 7 and CALIBRATES, week 2 caps at 8 and PROGRESSES, and the ordered rule
 * runs in WEEK 2 ONLY. Without this column the rule cannot know which week it is
 * in — and a week-1 calibration set gets told to add load.
 */
export const COLUMNS = [
  'date',
  'lift',
  'equipment',
  'load_kg',
  'last_set_reps',
  'last_set_rpe',
  'knee',
  'verdict',
  'issue_url',
  'notes',
  'block_week',
];

const NUMERIC_COLUMNS = new Set([
  'load_kg',
  'last_set_reps',
  'last_set_rpe',
  'knee',
  'block_week',
]);

/** RFC4180-ish reader. Handles quoted fields, escaped quotes, CRLF. */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];

    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 1; } else { quoted = false; }
      } else {
        field += c;
      }
      continue;
    }

    if (c === '"') { quoted = true; continue; }
    if (c === ',') { row.push(field); field = ''; continue; }
    if (c === '\r') continue;
    if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; continue; }
    field += c;
  }
  if (field !== '' || row.length > 0) { row.push(field); rows.push(row); }

  return rows.filter((r) => r.length > 1 || r[0] !== '');
}

const csvCell = (v) => {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** Rows are objects keyed by COLUMNS. The header is always rewritten. */
export function serialiseCsv(entries) {
  const lines = [COLUMNS.join(',')];
  for (const e of entries) {
    lines.push(COLUMNS.map((c) => csvCell(e[c])).join(','));
  }
  return `${lines.join('\n')}\n`;
}

/**
 * Read the log into entries. Blank numeric cells become `null`, NOT 0 — a blank
 * means "he never told me", and the rule has to be able to tell those apart. An
 * entry with no reps cannot be a rule-2 stall data point; see progression-rule.
 */
export function readLog(text) {
  const rows = parseCsv(text);
  if (rows.length === 0) return [];

  const header = rows[0].map((h) => h.trim());
  return rows.slice(1).map((cells) => {
    const e = {};
    header.forEach((col, i) => {
      const raw = (cells[i] ?? '').trim();
      if (NUMERIC_COLUMNS.has(col)) {
        e[col] = raw === '' ? null : Number(raw);
        if (e[col] !== null && !Number.isFinite(e[col])) e[col] = null;
      } else {
        e[col] = raw;
      }
    });
    return e;
  });
}

// --- The issue form ---------------------------------------------------------

/**
 * GitHub renders an issue FORM into the body as `### <label>` followed by the
 * value. So the LABELS in .github/ISSUE_TEMPLATE/session-log.yml are the parse
 * contract — change a label there and you must change it here. (The field *ids*
 * are the URL-prefill contract. Different contract, same file; see the header
 * comment in the YAML.)
 */
export const LABEL_TO_ID = new Map(Object.entries({
  'Date': 'date',
  'Block week': 'block_week',
  'Lift': 'lift',
  'Equipment': 'equipment',
  'Load (total kg)': 'load_kg',
  'Last-set reps': 'last_set_reps',
  'Last-set RPE': 'last_set_rpe',
  'Knee (0-10)': 'knee',
  'Notes': 'notes',
}));

export const LIFT_OPTIONS = [
  'Back squat',
  'Bench press',
  'Deadlift',
  'Overhead press',
  'Romanian deadlift',
  'Leg press',
  'Other',
];

export const EQUIPMENT_OPTIONS = ['Free barbell', 'Smith machine', 'Machine', 'Dumbbell'];

/**
 * Dropdown option TEXT, which is also what a prefill URL has to match.
 * The parser below reads the leading digit rather than string-matching these,
 * so a bare "1" or "2" typed by hand also works. The wording can be improved
 * without breaking the parse; the LEADING DIGIT cannot move.
 */
export const BLOCK_WEEK_OPTIONS = [
  'Week 1 — calibration (cap RPE 7, find the loads)',
  'Week 2 — execution (cap RPE 8, the ordered rule runs)',
];

const NO_RESPONSE = '_No response_';

/** Split a rendered issue-form body into { fieldId: rawString }. */
export function splitFormBody(body) {
  const out = {};
  const lines = String(body ?? '').split(/\r?\n/);
  let current = null;
  let buffer = [];

  const flush = () => {
    if (!current) return;
    // FIRST heading wins. A later duplicate heading — someone typing
    // "### Load (total kg)" inside the Notes textarea — cannot overwrite a real
    // field. The job is already gated to the repo owner, so this is
    // belt-and-braces, not the primary defence.
    if (!(current in out)) out[current] = buffer.join('\n').trim();
    current = null;
    buffer = [];
  };

  for (const line of lines) {
    const heading = /^###\s+(.+?)\s*$/.exec(line);
    if (heading) {
      flush();
      current = LABEL_TO_ID.get(heading[1]) ?? null;
      continue;
    }
    if (current) buffer.push(line);
  }
  flush();

  for (const [k, v] of Object.entries(out)) {
    if (v === NO_RESPONSE) out[k] = '';
  }
  return out;
}

class LogError extends Error {}

const fail = (msg) => { throw new LogError(msg); };

const intInRange = (raw, name, lo, hi) => {
  if (!/^-?\d+$/.test(raw)) fail(`**${name}** must be a whole number. I got \`${raw}\`.`);
  const n = Number(raw);
  if (n < lo || n > hi) fail(`**${name}** must be between ${lo} and ${hi}. I got \`${n}\`.`);
  return n;
};

/**
 * RPE, on the half point. 8, 8.5, 9 — but not 8.25 and not 8.7.
 *
 * Half points are standard practice and the rule now handles them: rule 4 fires
 * on `RPE > 8`, not on `RPE === 9`, so an 8.5 is held rather than rewarded with a
 * rep it did not earn. Quarter points are still refused — the scale is not that
 * precise, and pretending it is would be a false precision the whole course is
 * written against.
 */
const halfStepInRange = (raw, name, lo, hi) => {
  if (!/^\d+(\.[05])?$/.test(raw)) {
    fail(
      `**${name}** must be a whole or half point — 8, 8.5, 9. I got \`${raw}\`. ` +
      'Quarter points are not a thing; the scale is not that precise.',
    );
  }
  const n = Number(raw);
  if (n < lo || n > hi) fail(`**${name}** must be between ${lo} and ${hi}. I got \`${n}\`.`);
  return n;
};

/**
 * Which week of the block this was. Reads the LEADING DIGIT of the dropdown
 * option, so "Week 2 — execution (cap RPE 8...)" and a bare "2" both work — and
 * the "(cap RPE 8)" inside the option text cannot be mistaken for the answer.
 */
const parseBlockWeek = (raw) => {
  const m = /^(?:week\s*)?([12])\b/i.exec(raw);
  if (!m) {
    fail(
      `**Block week** must be week 1 or week 2. I got \`${raw}\`. This is not a formality: week 1 ` +
      'caps at RPE 7 and its job is to find the loads, so **the ordered rule does not run in week 1.** ' +
      'Tell me the wrong week and I will give you the wrong verdict.',
    );
  }
  return Number(m[1]);
};

/**
 * Free text bound for a CSV cell: one line, no control characters, capped.
 * Order matters. Fold newlines into a separator FIRST — newlines are themselves
 * control characters, so stripping control characters first would run two lines
 * of his note together into a single word.
 */
const sanitiseNotes = (raw) =>
  String(raw)
    .replace(/\s*\r?\n\s*/g, " / ")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim()
    .slice(0, 500);

/**
 * Validate a rendered issue-form body into an entry.
 * Throws LogError with a message written FOR HIM — it gets posted as a comment.
 */
export function parseIssueBody(body) {
  const f = splitFormBody(body);

  const need = (id, label) => {
    const v = (f[id] ?? '').trim();
    if (!v) fail(`**${label}** is missing. I will not guess it.`);
    return v;
  };

  const date = need('date', 'Date');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) fail(`**Date** must be \`YYYY-MM-DD\`. I got \`${date}\`.`);
  if (Number.isNaN(Date.parse(`${date}T00:00:00Z`))) fail(`**Date** \`${date}\` is not a real date.`);

  const block_week = parseBlockWeek(need('block_week', 'Block week'));

  const lift = need('lift', 'Lift');
  if (!LIFT_OPTIONS.includes(lift)) fail(`**Lift** \`${lift}\` is not one of the options.`);
  if (lift === 'Other') {
    fail(
      'You picked **Other** for the lift. I am not filing a session under "Other" — a shared "Other" ' +
      'bucket would merge two different lifts into one load history, which is the Smith-machine ' +
      'mistake wearing a different hat. Tell me the lift and I will add it to the dropdown.',
    );
  }

  const equipment = need('equipment', 'Equipment');
  if (!EQUIPMENT_OPTIONS.includes(equipment)) {
    fail(`**Equipment** \`${equipment}\` is not one of the options.`);
  }

  const loadRaw = need('load_kg', 'Load (total kg)');
  if (!/^\d+(\.\d+)?$/.test(loadRaw)) fail(`**Load** must be a number in kg. I got \`${loadRaw}\`.`);
  const load_kg = Number(loadRaw);
  if (load_kg <= 0 || load_kg > 1000) fail(`**Load** of \`${load_kg}\` kg is not plausible.`);

  const last_set_reps = intInRange(need('last_set_reps', 'Last-set reps'), 'Last-set reps', 0, 50);

  // HALF POINTS ARE ACCEPTED. They used to be refused, as a stopgap: rule 4 read
  // `RPE == 9`, so an 8.5 fell past rules 3 and 4 into rule 5 and earned a REP at
  // an effort already over the cap. Rule 4 now reads `RPE > 8`, which covers 8.5,
  // so the input no longer has to be crippled to protect the rule.
  const last_set_rpe = halfStepInRange(need('last_set_rpe', 'Last-set RPE'), 'Last-set RPE', 1, 10);

  const kneeRaw = (f.knee ?? '').trim();
  const knee = kneeRaw === '' ? null : intInRange(kneeRaw, 'Knee', 0, 10);

  const notes = sanitiseNotes(f.notes ?? '');

  return {
    date, block_week, lift, equipment, load_kg, last_set_reps, last_set_rpe, knee, notes,
  };
}

// --- The verdict comment ----------------------------------------------------

const PROTOCOL =
  'https://github.com/thanhdatle/DatLearn/blob/main/strength/reference/progression-protocol.html';

const kg = (n) => (n === null ? '—' : `${n} kg`);

/** Week 1 returns a calibration verdict, which has no rule number by design. */
const isCalibration = (verdict) => verdict.rule === null;

/**
 * Direct, no padding, no false confidence. Name the rule that fired, say what
 * it means, give the number that goes on the bar next time.
 *
 * In week 1 there is no rule to name, and saying "Rule 3" over a calibration
 * session would be a lie about what just happened. Say instead that the rule did
 * not run, and why.
 */
export function renderVerdict(entry, verdict) {
  const parts = [];

  parts.push(
    isCalibration(verdict)
      ? `## Week 1 · calibration — ${verdict.name}`
      : `## Rule ${verdict.rule} — ${verdict.name}`,
  );
  parts.push(
    `**${entry.lift}** · ${entry.equipment} · ${kg(entry.load_kg)} · ` +
    `last set **${entry.last_set_reps} reps @ RPE ${entry.last_set_rpe}** · ` +
    `block week ${entry.block_week} (cap RPE ${verdict.rpe_cap})` +
    (entry.knee === null ? '' : ` · knee ${entry.knee}/10`),
  );
  parts.push(verdict.why);
  parts.push(verdict.prescription);

  if (verdict.knee?.text) {
    parts.push('---');
    parts.push(verdict.knee.text);
  }

  if (entry.notes) {
    parts.push('---');
    parts.push(`**Your note:** ${entry.notes}`);
    parts.push(
      'If that note says an earlier set was worse than your last, **this verdict may be misreading ' +
      'the session** — that is the known blind spot of the three-number log (§3 of the protocol). ' +
      'Say so and give me all four sets, and I will re-run it properly.',
    );
  }

  parts.push('---');
  parts.push(
    (isCalibration(verdict)
      ? 'Logged to `strength/log/sessions.csv`. **The ordered rule did not run** — it runs in week 2, ' +
        `not week 1 — [the ordered rule](${PROTOCOL}).`
      : `Logged to \`strength/log/sessions.csv\`. Rule ${verdict.rule} of five, first match wins — ` +
        `[the ordered rule](${PROTOCOL}).`) +
    // The knee block already carries the disclaimer. Saying it twice in one
    // comment turns it into boilerplate, which is how a disclaimer stops being
    // read at all.
    (verdict.knee?.text ? '' : ' Nothing here is medical advice.'),
  );

  return parts.join('\n\n');
}

export function renderError(message) {
  return [
    '## Not logged',
    message,
    'Nothing was written to the log, and this issue stays open. Edit the issue and I will re-run it.',
  ].join('\n\n');
}

// --- Orchestration (pure — no IO) -------------------------------------------

/**
 * The one-line summary stored in the CSV `verdict` column.
 * A week-1 row gets no rule number, because no rule ran.
 */
export const verdictCell = (v) =>
  (isCalibration(v) ? `Week 1 calibration — ${v.name}` : `Rule ${v.rule} — ${v.name}`);

/**
 * Upsert by issue_url, so an `edited` issue CORRECTS its row rather than
 * appending a second one. A duplicate row would poison the rule-2 stall window:
 * three sessions is only three sessions if each row is a real session.
 *
 * @returns {{rows: object[], verdict: object, changed: boolean}}
 */
export function applyEntry(existingRows, entry, issueUrl) {
  const priorRows = existingRows.filter((r) => r.issue_url !== issueUrl);
  const verdict = decide(entry, priorRows);

  const row = {
    date: entry.date,
    lift: entry.lift,
    equipment: entry.equipment,
    load_kg: entry.load_kg,
    last_set_reps: entry.last_set_reps,
    last_set_rpe: entry.last_set_rpe,
    knee: entry.knee,
    verdict: verdictCell(verdict),
    issue_url: issueUrl,
    notes: entry.notes,
    block_week: entry.block_week,
  };

  const existing = existingRows.find((r) => r.issue_url === issueUrl);
  const rows = existing
    ? existingRows.map((r) => (r.issue_url === issueUrl ? row : r))
    : [...existingRows, row];

  const changed =
    !existing || COLUMNS.some((c) => String(existing[c] ?? '') !== String(row[c] ?? ''));

  return { rows, verdict, changed };
}

export { LogError };
