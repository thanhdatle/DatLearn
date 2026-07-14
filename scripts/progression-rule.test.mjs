/**
 * Tests for the ordered decision rule.
 * Run: node --test scripts/
 *
 * The load-bearing tests are the ORDERING ones. An unordered version of this
 * rule shipped once and was broken; these are the cases that prove the order.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { decide, classifyLift, historyKey, REP_MIN } from './progression-rule.mjs';

/** Minimal entry builder. Reps/RPE always explicit — never defaulted. */
const entry = (over = {}) => ({
  date: '2026-07-21',
  lift: 'Back squat',
  equipment: 'Free barbell',
  load_kg: 100,
  last_set_reps: 5,
  last_set_rpe: 8,
  knee: null,
  ...over,
});

// --- Rule 1: the floor and the ceiling --------------------------------------

test('r=3, e=7 -> rule 1 (last set fell under the 4-rep floor)', () => {
  const v = decide(entry({ last_set_reps: 3, last_set_rpe: 7 }));
  assert.equal(v.rule, 1);
  assert.equal(v.action, 'drop_load');
  assert.equal(v.next_load_kg, 90); // 90% of 100
  assert.equal(v.next_target_reps, REP_MIN);
});

test('r=6, e=10 -> rule 1, NOT rule 3 — RPE 10 beats "every set at 6"', () => {
  // THE case a prior review caught as ambiguous in the unordered table.
  // 6,6,6,6 @ RPE 10 is not an earned six. Rule 1 sits above rule 3 for this.
  const v = decide(entry({ last_set_reps: 6, last_set_rpe: 10 }));
  assert.equal(v.rule, 1);
  assert.equal(v.action, 'drop_load');
  assert.notEqual(v.action, 'add_load');
  assert.equal(v.next_load_kg, 90);
});

// --- Rules 3, 4, 5: the ordinary branches -----------------------------------

test('r=6, e=8 -> rule 3 (add load, reset reps)', () => {
  const v = decide(entry({ last_set_reps: 6, last_set_rpe: 8 }));
  assert.equal(v.rule, 3);
  assert.equal(v.action, 'add_load');
  assert.equal(v.next_load_kg, 105); // lower body, +5
  assert.equal(v.next_target_reps, REP_MIN);
});

test('r=6, e=9 -> rule 4, NOT rule 3 — a 6 over the cap does not earn load', () => {
  const v = decide(entry({ last_set_reps: 6, last_set_rpe: 9 }));
  assert.equal(v.rule, 4);
  assert.equal(v.action, 'repeat');
  assert.equal(v.next_load_kg, 100);
  assert.equal(v.next_target_reps, 6);
});

test('r=5, e=8 -> rule 5 (add reps, keep load)', () => {
  const v = decide(entry({ last_set_reps: 5, last_set_rpe: 8 }));
  assert.equal(v.rule, 5);
  assert.equal(v.action, 'add_reps');
  assert.equal(v.next_load_kg, 100);
  assert.equal(v.next_target_reps, 6);
});

test('r=5, e=9 -> rule 4 (repeat) — RPE 9 outranks the residual', () => {
  const v = decide(entry({ last_set_reps: 5, last_set_rpe: 9 }));
  assert.equal(v.rule, 4);
  assert.equal(v.next_target_reps, 5);
});

test('r=4, e=7 -> rule 5 (add reps)', () => {
  const v = decide(entry({ last_set_reps: 4, last_set_rpe: 7 }));
  assert.equal(v.rule, 5);
  assert.equal(v.next_target_reps, 5);
  assert.equal(v.next_load_kg, 100);
});

// --- Rule 2: the stall ------------------------------------------------------

test('3 sessions, same load, last-set reps 5,5,5 -> rule 2 (stall)', () => {
  const history = [
    entry({ date: '2026-07-07', last_set_reps: 5, last_set_rpe: 8 }),
    entry({ date: '2026-07-14', last_set_reps: 5, last_set_rpe: 8 }),
  ];
  const v = decide(entry({ date: '2026-07-21', last_set_reps: 5, last_set_rpe: 8 }), history);
  assert.equal(v.rule, 2);
  assert.equal(v.action, 'drop_load');
  assert.equal(v.next_load_kg, 90);
});

test('2 stale sessions is not yet a stall -> rule 5', () => {
  const history = [entry({ date: '2026-07-14', last_set_reps: 5, last_set_rpe: 8 })];
  const v = decide(entry({ date: '2026-07-21', last_set_reps: 5, last_set_rpe: 8 }), history);
  assert.equal(v.rule, 5);
});

test('a rep added to the last set breaks the stall -> rule 5', () => {
  const history = [
    entry({ date: '2026-07-07', last_set_reps: 4, last_set_rpe: 8 }),
    entry({ date: '2026-07-14', last_set_reps: 5, last_set_rpe: 8 }), // rep added here
  ];
  const v = decide(entry({ date: '2026-07-21', last_set_reps: 5, last_set_rpe: 8 }), history);
  assert.equal(v.rule, 5);
});

test('reps going backwards at the same load still stalls (5,4,4) -> rule 2', () => {
  // "No rep added" is non-increasing, not identical. Backwards is not progress.
  const history = [
    entry({ date: '2026-07-07', last_set_reps: 5, last_set_rpe: 8 }),
    entry({ date: '2026-07-14', last_set_reps: 4, last_set_rpe: 8 }),
  ];
  const v = decide(entry({ date: '2026-07-21', last_set_reps: 4, last_set_rpe: 8 }), history);
  assert.equal(v.rule, 2);
});

test('a load change breaks the stall window -> rule 5', () => {
  const history = [
    entry({ date: '2026-07-07', load_kg: 95, last_set_reps: 5, last_set_rpe: 8 }),
    entry({ date: '2026-07-14', load_kg: 100, last_set_reps: 5, last_set_rpe: 8 }),
  ];
  const v = decide(
    entry({ date: '2026-07-21', load_kg: 100, last_set_reps: 5, last_set_rpe: 8 }),
    history,
  );
  assert.equal(v.rule, 5);
});

test('an entry with no reps cannot be a stall data point -> rule 5, no load drop', () => {
  // The seeded 14 July Smith squat has no reps. It must not silently become one
  // third of a stall and cost him 10% of his load.
  const history = [
    entry({ date: '2026-07-07', last_set_reps: null, last_set_rpe: null }),
    entry({ date: '2026-07-14', last_set_reps: 5, last_set_rpe: 8 }),
  ];
  const v = decide(entry({ date: '2026-07-21', last_set_reps: 5, last_set_rpe: 8 }), history);
  assert.equal(v.rule, 5);
});

// --- Ordering: rule 1 beats rule 2 ------------------------------------------

test('3 stale sessions BUT r=3 this time -> rule 1 wins over rule 2', () => {
  const history = [
    entry({ date: '2026-07-07', last_set_reps: 5, last_set_rpe: 8 }),
    entry({ date: '2026-07-14', last_set_reps: 5, last_set_rpe: 8 }),
  ];
  const v = decide(entry({ date: '2026-07-21', last_set_reps: 3, last_set_rpe: 8 }), history);
  assert.equal(v.rule, 1);
  // Both rules drop the load, so the RULE NUMBER is the only thing separating
  // the two diagnoses. Same prescription, different reason — and the reason is
  // what he is here to learn.
  assert.match(v.why, /4-rep floor/);
});

// --- Equipment is part of the lift's identity -------------------------------

test('a Smith squat does NOT pick up free-bar squat history', () => {
  const freeBarStall = [
    entry({ date: '2026-07-07', equipment: 'Free barbell', last_set_reps: 5 }),
    entry({ date: '2026-07-14', equipment: 'Free barbell', last_set_reps: 5 }),
  ];
  const smith = entry({
    date: '2026-07-21',
    equipment: 'Smith machine',
    last_set_reps: 5,
    last_set_rpe: 8,
  });

  const v = decide(smith, freeBarStall);
  assert.equal(v.rule, 5, 'free-bar history must not stall a Smith lift');
  assert.notEqual(v.rule, 2);
});

test('the Smith stalls on its OWN history', () => {
  const smithStall = [
    entry({ date: '2026-07-07', equipment: 'Smith machine', last_set_reps: 5 }),
    entry({ date: '2026-07-14', equipment: 'Smith machine', last_set_reps: 5 }),
    entry({ date: '2026-07-15', equipment: 'Free barbell', last_set_reps: 6 }), // other key, noise
  ];
  const v = decide(
    entry({ date: '2026-07-21', equipment: 'Smith machine', last_set_reps: 5, last_set_rpe: 8 }),
    smithStall,
  );
  assert.equal(v.rule, 2);
});

test('historyKey separates equipment and is case/space insensitive', () => {
  assert.notEqual(
    historyKey({ lift: 'Back squat', equipment: 'Smith machine' }),
    historyKey({ lift: 'Back squat', equipment: 'Free barbell' }),
  );
  assert.equal(
    historyKey({ lift: 'Back  squat', equipment: 'smith machine' }),
    historyKey({ lift: 'BACK SQUAT', equipment: 'Smith Machine' }),
  );
});

// --- Increments -------------------------------------------------------------

test('+5 kg on a lower lift, +2.5 kg on an upper lift', () => {
  const lower = decide(entry({ lift: 'Deadlift', load_kg: 100, last_set_reps: 6, last_set_rpe: 8 }));
  assert.equal(lower.region, 'lower');
  assert.equal(lower.next_load_kg, 105);

  const upper = decide(entry({ lift: 'Bench press', load_kg: 60, last_set_reps: 6, last_set_rpe: 8 }));
  assert.equal(upper.region, 'upper');
  assert.equal(upper.next_load_kg, 62.5);
});

test('classification is a lookup, and an unknown lift refuses to invent an increment', () => {
  assert.equal(classifyLift('Romanian deadlift'), 'lower');
  assert.equal(classifyLift('Leg press'), 'lower');
  assert.equal(classifyLift('Front squat'), 'lower');
  assert.equal(classifyLift('Overhead press'), 'upper');
  assert.equal(classifyLift('Lat pulldown'), 'upper');
  assert.equal(classifyLift('Zercher good morning'), 'unknown');

  const v = decide(entry({ lift: 'Zercher good morning', last_set_reps: 6, last_set_rpe: 8 }));
  assert.equal(v.rule, 3);
  assert.equal(v.next_load_kg, null, 'must not guess +5 vs +2.5');
  assert.match(v.prescription, /not interchangeable/);
});

// --- The knee tripwire ------------------------------------------------------

test('knee=5 -> the verdict is still computed, the warning rides on top', () => {
  const v = decide(entry({ last_set_reps: 6, last_set_rpe: 8, knee: 5 }));
  assert.equal(v.rule, 3, 'the tripwire must not replace the verdict');
  assert.equal(v.next_load_kg, 105);
  assert.equal(v.knee.tripped, true);
  assert.match(v.knee.text, /shorten the range of motion/i);
  assert.match(v.knee.text, /not medical advice/i);
  assert.equal(v.knee.escalate, false);
});

test('knee <= 3 is green — no warning text', () => {
  const v = decide(entry({ knee: 2 }));
  assert.equal(v.knee.tripped, false);
  assert.equal(v.knee.text, null);
});

test('two bad knee sessions on the same lift -> escalate to a physiotherapist', () => {
  const history = [entry({ date: '2026-07-14', knee: 6 })];
  const v = decide(entry({ date: '2026-07-21', knee: 5 }), history);
  assert.equal(v.knee.escalate, true);
  assert.match(v.knee.text, /physiotherapist/i);
});

test('no knee logged -> no knee block at all', () => {
  const v = decide(entry({ lift: 'Bench press', knee: null }));
  assert.equal(v.knee, null);
});

// --- Totality ---------------------------------------------------------------

test('TOTALITY: every (r 0..8, e 4..10) fires exactly one rule, never undefined', () => {
  const fired = new Set();
  for (let r = 0; r <= 8; r += 1) {
    for (let e = 4; e <= 10; e += 1) {
      const v = decide(entry({ last_set_reps: r, last_set_rpe: e }));

      assert.notEqual(v, undefined, `undefined verdict at r=${r} e=${e}`);
      assert.ok([1, 2, 3, 4, 5].includes(v.rule), `no rule fired at r=${r} e=${e}`);
      assert.ok(v.action && v.name && v.why && v.prescription, `incomplete verdict at r=${r} e=${e}`);

      // Mutual exclusivity, checked against the SPEC rather than against the
      // implementation's if/else chain: recompute every rule that matches, then
      // assert the engine picked the FIRST of them.
      const matches = [];
      if (r < 4 || e >= 10) matches.push(1);
      // Rule 2 needs history; there is none here, so it cannot match.
      if (r >= 6 && e <= 8) matches.push(3);
      if (e === 9) matches.push(4);
      matches.push(5); // the residual always matches — it is the "otherwise"
      assert.equal(
        v.rule,
        matches[0],
        `wrong rule won at r=${r} e=${e}: got ${v.rule}, first match is ${matches[0]}`,
      );

      fired.add(v.rule);
    }
  }
  // Rules 1, 3, 4, 5 are all reachable from (r, e) alone. Rule 2 needs history
  // and is covered by the stall tests above.
  assert.deepEqual([...fired].sort(), [1, 3, 4, 5]);
});

test('TOTALITY: the rule refuses to run on a missing number rather than guessing one', () => {
  assert.throws(() => decide(entry({ last_set_reps: null })), /last_set_reps is required/);
  assert.throws(() => decide(entry({ last_set_rpe: null })), /last_set_rpe is required/);
  assert.throws(() => decide(entry({ load_kg: null })), /load_kg is required/);
});

// --- Load-drop arithmetic ---------------------------------------------------

test('the 90% drop rounds to the nearest 2.5 kg and always actually drops', () => {
  assert.equal(decide(entry({ load_kg: 100, last_set_reps: 3 })).next_load_kg, 90);
  assert.equal(decide(entry({ load_kg: 60, last_set_reps: 3 })).next_load_kg, 55); // 54 -> 55
  assert.equal(decide(entry({ load_kg: 22.5, last_set_reps: 3 })).next_load_kg, 20); // 20.25 -> 20
  // 10 kg: 90% = 9, which ROUNDS BACK UP to 10. It must still drop.
  assert.equal(decide(entry({ load_kg: 10, last_set_reps: 3 })).next_load_kg, 7.5);
});
