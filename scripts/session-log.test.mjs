/**
 * Tests for the session-log plumbing: CSV round-trip, issue-form parsing,
 * validation, and the upsert.
 * Run: node --test scripts/*.test.mjs
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  readLog,
  serialiseCsv,
  parseIssueBody,
  splitFormBody,
  applyEntry,
  renderVerdict,
  LogError,
} from './session-log.mjs';

/**
 * What GitHub actually posts as the body of a submitted issue FORM.
 * The Block week value is the dropdown's OPTION TEXT, because that is what
 * GitHub renders into the body — not the bare digit.
 */
const formBody = (over = {}) => {
  const f = {
    'Date': '2026-07-21',
    'Block week': 'Week 2 — execution (cap RPE 8, the ordered rule runs)',
    'Lift': 'Back squat',
    'Equipment': 'Smith machine',
    'Load (total kg)': '20',
    'Last-set reps': '5',
    'Last-set RPE': '8',
    'Knee (0-10)': '2',
    'Notes': '_No response_',
    ...over,
  };
  return Object.entries(f)
    .map(([label, value]) => `### ${label}\n\n${value}\n`)
    .join('\n');
};

const WEEK_1 = 'Week 1 — calibration (cap RPE 7, find the loads)';

// --- Issue-form parsing -----------------------------------------------------

test('parses a well-formed issue-form body', () => {
  const e = parseIssueBody(formBody());
  assert.deepEqual(e, {
    date: '2026-07-21',
    block_week: 2,
    lift: 'Back squat',
    equipment: 'Smith machine',
    load_kg: 20,
    last_set_reps: 5,
    last_set_rpe: 8,
    knee: 2,
    notes: '',
  });
});

test('block week reads the LEADING digit, not the "(cap RPE 8)" inside the option text', () => {
  assert.equal(parseIssueBody(formBody({ 'Block week': WEEK_1 })).block_week, 1);
  assert.equal(parseIssueBody(formBody({ 'Block week': '1' })).block_week, 1);
  assert.equal(parseIssueBody(formBody({ 'Block week': '2' })).block_week, 2);
});

test('_No response_ on an optional field becomes empty, not the literal string', () => {
  const e = parseIssueBody(formBody({ 'Knee (0-10)': '_No response_' }));
  assert.equal(e.knee, null);
  assert.equal(e.notes, '');
});

test('a multi-line note is folded onto one CSV-safe line', () => {
  const e = parseIssueBody(formBody({ 'Notes': 'Set 2 felt worse than my last.\nKnee was fine.' }));
  assert.equal(e.notes, 'Set 2 felt worse than my last. / Knee was fine.');
});

test('a heading injected INTO the notes cannot overwrite a real field', () => {
  // Belt and braces. The job is gated to the repo owner, but first-heading-wins
  // means a body cannot talk itself into a different load via its own free text.
  const e = parseIssueBody(formBody({ 'Notes': '### Load (total kg)\n\n999' }));
  assert.equal(e.load_kg, 20, 'the real Load field must win');
});

test('splitFormBody ignores headings that are not form labels', () => {
  const f = splitFormBody('### Date\n\n2026-07-21\n\n### Something else\n\nignored\n');
  assert.deepEqual(f, { date: '2026-07-21' });
});

// --- Validation: fail loudly, never fabricate -------------------------------

const rejects = (over, re) => {
  assert.throws(
    () => parseIssueBody(formBody(over)),
    (err) => {
      assert.ok(err instanceof LogError, 'must be a LogError, not a crash');
      assert.match(err.message, re);
      return true;
    },
  );
};

test('rejects a missing required field rather than guessing it', () => {
  rejects({ 'Load (total kg)': '' }, /missing/i);
  rejects({ 'Last-set reps': '_No response_' }, /missing/i);
});

test('rejects a malformed date', () => rejects({ 'Date': '21/07/2026' }, /YYYY-MM-DD/));
test('rejects an impossible date', () => rejects({ 'Date': '2026-13-45' }, /not a real date/));
test('rejects a non-numeric load', () => rejects({ 'Load (total kg)': '20kg' }, /must be a number/));
test('rejects an implausible load', () => rejects({ 'Load (total kg)': '4000' }, /not plausible/));
test('rejects an out-of-range RPE', () => rejects({ 'Last-set RPE': '12' }, /between 1 and 10/));
test('rejects an out-of-range knee', () => rejects({ 'Knee (0-10)': '11' }, /between 0 and 10/));
test('rejects equipment that is not on the list', () =>
  rejects({ 'Equipment': 'Hack squat sled' }, /not one of the options/));

test('rejects lift = Other rather than merging two lifts into one history', () => {
  rejects({ 'Lift': 'Other' }, /Smith-machine mistake/);
});

test('rejects a missing or nonsense block week rather than assuming week 2', () => {
  rejects({ 'Block week': '' }, /missing/i);
  rejects({ 'Block week': 'Week 3 — the one that does not exist' }, /week 1 or week 2/i);
  rejects({ 'Block week': 'sometime in July' }, /week 1 or week 2/i);
});

// --- Half-point RPE: accepted, because the rule now handles it ---------------

test('ACCEPTS a half-point RPE — 8.5 is a real rating and rule 4 now covers it', () => {
  // This used to be REJECTED, and the rejection was a patch over a bug: rule 4
  // read `RPE === 9`, so an 8.5 fell past rules 3 and 4 into rule 5 and earned a
  // REP at an effort already over the cap. Rule 4 now reads `RPE > 8`.
  assert.equal(parseIssueBody(formBody({ 'Last-set RPE': '8.5' })).last_set_rpe, 8.5);
  assert.equal(parseIssueBody(formBody({ 'Last-set RPE': '7.5' })).last_set_rpe, 7.5);
  assert.equal(parseIssueBody(formBody({ 'Last-set RPE': '9.5' })).last_set_rpe, 9.5);
  assert.equal(parseIssueBody(formBody({ 'Last-set RPE': '8' })).last_set_rpe, 8);
});

test('an 8.5 is HELD by rule 4, not rewarded with a rep by rule 5', () => {
  // The end-to-end shape of the bug, from the form body to the verdict.
  const entry = parseIssueBody(formBody({ 'Last-set reps': '6', 'Last-set RPE': '8.5' }));
  const { verdict } = applyEntry([], entry, 'https://github.com/o/r/issues/1');
  assert.equal(verdict.rule, 4);
  assert.equal(verdict.action, 'repeat');
  assert.equal(verdict.next_load_kg, 20, 'nothing moves');
});

test('still rejects a QUARTER-point RPE — the scale is not that precise', () => {
  rejects({ 'Last-set RPE': '8.25' }, /whole or half point/);
  rejects({ 'Last-set RPE': '8.7' }, /whole or half point/);
  rejects({ 'Last-set RPE': '8.5.5' }, /whole or half point/);
});

test('the knee is still an INTEGER — half a point of pain is not a thing', () => {
  rejects({ 'Knee (0-10)': '3.5' }, /whole number/);
});

// --- CSV --------------------------------------------------------------------

test('CSV round-trips, and a blank number reads back as null and NOT as zero', () => {
  const csv = [
    'date,lift,equipment,load_kg,last_set_reps,last_set_rpe,knee,verdict,issue_url,notes,block_week',
    '2026-07-14,Back squat,Smith machine,20,,,,,,"20 kg of plate; carriage unknown",1',
  ].join('\n');

  const rows = readLog(csv);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].load_kg, 20);
  assert.equal(rows[0].last_set_reps, null, 'a blank rep count is not a zero rep count');
  assert.equal(rows[0].last_set_rpe, null);
  assert.equal(rows[0].knee, null);
  assert.equal(rows[0].notes, '20 kg of plate; carriage unknown');
  assert.equal(rows[0].block_week, 1, 'the seeded 14 July session was a week-1 calibration session');

  const back = readLog(serialiseCsv(rows))[0];
  assert.equal(back.last_set_reps, null, 'null survives a round-trip');
  assert.equal(back.block_week, 1, 'the block week survives a round-trip');
});

test('block_week is APPENDED — a pre-schema row still reads, and reads as unknown', () => {
  // Old rows have ten columns, not eleven. They must not blow up, and a missing
  // week must not silently become a 1 (which would drop the row out of every
  // stall window) or a 2 (which would run the rule on a calibration session).
  const legacy = [
    'date,lift,equipment,load_kg,last_set_reps,last_set_rpe,knee,verdict,issue_url,notes',
    '2026-07-14,Back squat,Free barbell,100,5,8,,Rule 5 — Add reps keep load,https://x/1,',
  ].join('\n');

  const rows = readLog(legacy);
  assert.equal(rows[0].load_kg, 100);
  assert.equal(rows[0].block_week, undefined, 'absent, not fabricated');
});

test('CSV quotes commas and quotes inside a note', () => {
  const out = serialiseCsv([{ date: '2026-07-21', notes: 'felt "off", knee ok' }]);
  assert.match(out, /"felt ""off"", knee ok"/);
  assert.equal(readLog(out)[0].notes, 'felt "off", knee ok');
});

// --- The upsert -------------------------------------------------------------

const entryFor = (over = {}) => parseIssueBody(formBody(over));

test('a new issue APPENDS a row, carrying the block week', () => {
  const { rows, changed, verdict } = applyEntry([], entryFor(), 'https://github.com/o/r/issues/1');
  assert.equal(rows.length, 1);
  assert.equal(changed, true);
  assert.equal(verdict.rule, 5);
  assert.equal(rows[0].verdict, 'Rule 5 — Add reps, keep load');
  assert.equal(rows[0].block_week, 2);
});

test('a WEEK 1 row records the session and says no rule ran', () => {
  const entry = entryFor({ 'Block week': WEEK_1, 'Last-set reps': '6', 'Last-set RPE': '8' });
  const { rows, verdict } = applyEntry([], entry, 'https://github.com/o/r/issues/1');

  // 6 reps @ RPE 8 is rule 3 in week 2 — "add load". In week 1 it is an
  // OVER-CAP calibration set and must not add anything.
  assert.equal(verdict.rule, null);
  assert.equal(verdict.action, 'calibrate');
  assert.equal(rows[0].block_week, 1);
  assert.equal(rows[0].verdict, "Week 1 calibration — Find the load, don't progress it");
  assert.doesNotMatch(rows[0].verdict, /^Rule /, 'no rule number, because no rule ran');
});

test('an EDITED issue corrects its own row instead of appending a second one', () => {
  const url = 'https://github.com/o/r/issues/1';
  const first = applyEntry([], entryFor({ 'Last-set reps': '5' }), url);
  const second = applyEntry(first.rows, entryFor({ 'Last-set reps': '6' }), url);

  assert.equal(second.rows.length, 1, 'a duplicate row would poison the rule-2 stall window');
  assert.equal(second.rows[0].last_set_reps, 6);
  assert.equal(second.verdict.rule, 3);
  assert.equal(second.changed, true);
});

test('re-running an unedited issue is a no-op', () => {
  const url = 'https://github.com/o/r/issues/1';
  const first = applyEntry([], entryFor(), url);
  const again = applyEntry(first.rows, entryFor(), url);
  assert.equal(again.changed, false, 'nothing changed — do not commit, do not comment');
});

test('an issue never counts its own row as part of its own history', () => {
  // Otherwise editing a stalling session would let it see itself as a prior one.
  const url = 'https://github.com/o/r/issues/3';
  const prior = (date, issue) => ({
    date,
    lift: 'Back squat',
    equipment: 'Smith machine',
    load_kg: 20,
    last_set_reps: 5,
    last_set_rpe: 8,
    knee: null,
    verdict: 'Rule 5 — Add reps, keep load',
    issue_url: `https://github.com/o/r/issues/${issue}`,
    notes: '',
  });
  const priors = [prior('2026-07-07', 1), prior('2026-07-14', 2)];

  const first = applyEntry(priors, entryFor(), url);
  assert.equal(first.verdict.rule, 2, 'the third identical session stalls');

  const edited = applyEntry(first.rows, entryFor(), url);
  assert.equal(edited.verdict.rule, 2, 'still exactly three sessions, not four');
  assert.equal(edited.rows.length, 3);
});

// --- The comment ------------------------------------------------------------

test('the verdict comment names the rule, the prescription, and the knee line', () => {
  const entry = entryFor({ 'Last-set reps': '6', 'Last-set RPE': '8', 'Knee (0-10)': '5' });
  const { verdict } = applyEntry([], entry, 'https://github.com/o/r/issues/1');
  const md = renderVerdict(entry, verdict);

  assert.match(md, /## Rule 3 — Add load, reset reps/);
  assert.match(md, /Smith machine/);
  assert.match(md, /25 kg/); // 20 + 5, lower body
  assert.match(md, /block week 2 \(cap RPE 8\)/);
  assert.match(md, /shorten the range of motion/i);
  assert.match(md, /not medical advice/i);
});

test('a WEEK 1 comment says the rule did not run, and never prints a rule number', () => {
  const entry = entryFor({ 'Block week': WEEK_1, 'Last-set reps': '6', 'Last-set RPE': '8' });
  const { verdict } = applyEntry([], entry, 'https://github.com/o/r/issues/1');
  const md = renderVerdict(entry, verdict);

  assert.match(md, /## Week 1 · calibration/);
  assert.match(md, /block week 1 \(cap RPE 7\)/);
  assert.match(md, /the ordered rule did not run/i);
  assert.match(md, /over the RPE 7 cap/i, 'say plainly that the set blew the week-1 cap');
  assert.doesNotMatch(md, /Rule \d/, 'no rule fired, so no rule may be named');
  assert.doesNotMatch(md, /add load/i, 'the week-2 verdict for this set — and it must not appear');
});

test('a WEEK 1 comment still carries the knee warning', () => {
  const entry = entryFor({ 'Block week': WEEK_1, 'Last-set RPE': '6', 'Knee (0-10)': '5' });
  const { verdict } = applyEntry([], entry, 'https://github.com/o/r/issues/1');
  const md = renderVerdict(entry, verdict);

  assert.match(md, /## Week 1 · calibration/);
  assert.match(md, /shorten the range of motion/i);
  assert.match(md, /not medical advice/i);
});

test('a note in the comment carries the blind-spot caveat', () => {
  const entry = entryFor({ 'Notes': 'set 2 was rough' });
  const { verdict } = applyEntry([], entry, 'https://github.com/o/r/issues/1');
  const md = renderVerdict(entry, verdict);
  assert.match(md, /Your note:/);
  assert.match(md, /blind spot/i);
});
