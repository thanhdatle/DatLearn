/**
 * The ordered decision rule, in code.
 *
 * Canonical spec: strength/reference/progression-protocol.html §2 (the rule),
 * §3 (the minimum viable log), §5 (the knee tripwire).
 *
 * FIVE RULES. FIRST MATCH WINS. THE ORDER IS LOAD-BEARING.
 * An earlier unordered version was neither mutually exclusive nor exhaustive:
 * `6,6,6,6 @ RPE 10` matched two rows and `5,4,4,4 @ RPE 9` matched none.
 * Do not reorder these. Do not collapse them. The totality test in
 * progression-rule.test.mjs proves exactly one rule fires for every (reps, RPE).
 *
 * Zero dependencies. Plain Node ESM.
 */

// --- Rep range, set count, RPE cap ------------------------------------------

export const REP_MIN = 4;
export const REP_MAX = 6;
export const RPE_CAP = 8; // week 1 of a block caps at 7 — see the NOTE at the bottom of this file.

const PLATE_STEP_KG = 2.5;
const STALL_SESSIONS = 3; // current + 2 prior
const KNEE_GREEN_MAX = 3; // > 3/10 trips the tripwire

// --- Lift identity ----------------------------------------------------------

/**
 * Body region per lift. A LOOKUP, never a guess: the increment (+5 vs +2.5 kg)
 * and the knee tripwire both hang off it. Keys are normalised (lowercase,
 * collapsed whitespace). Aliases are cheap; a wrong guess is not.
 */
const LIFT_REGION = new Map(Object.entries({
  // Lower
  'back squat': 'lower',
  'squat': 'lower',
  'front squat': 'lower',
  'deadlift': 'lower',
  'conventional deadlift': 'lower',
  'romanian deadlift': 'lower',
  'rdl': 'lower',
  'leg press': 'lower',
  // Upper
  'bench press': 'upper',
  'bench': 'upper',
  'overhead press': 'upper',
  'ohp': 'upper',
  'press': 'upper',
  'row': 'upper',
  'barbell row': 'upper',
  'seated cable row': 'upper',
  'chest-supported row': 'upper',
  'pulldown': 'upper',
  'lat pulldown': 'upper',
}));

/** Load increment on rule 3, by region. Convention — what the plates allow. */
const LOAD_INCREMENT_KG = { lower: 5, upper: 2.5 };

const normalise = (s) => String(s ?? '').trim().toLowerCase().replace(/\s+/g, ' ');

/** @returns {'lower'|'upper'|'unknown'} */
export function classifyLift(lift) {
  return LIFT_REGION.get(normalise(lift)) ?? 'unknown';
}

/**
 * EQUIPMENT IS PART OF THE LIFT'S IDENTITY.
 *
 * A Smith-machine back squat and a free-bar back squat are DIFFERENT LIFTS with
 * separate load histories. The carriage weight of a commercial Smith is unknown
 * and unpublished (manufacturer claims span ~3-20 kg), so the numbers are not
 * convertible in either direction — not now, not with a correction factor.
 * See reference/exercise-library.html#smith-machine-squat.
 *
 * Every history lookup in this file goes through this key. Never merge two keys.
 */
export function historyKey(entry) {
  return `${normalise(entry.lift)}::${normalise(entry.equipment)}`;
}

// --- Numbers ----------------------------------------------------------------

const roundToPlate = (kg) => Math.round(kg / PLATE_STEP_KG) * PLATE_STEP_KG;
const sameLoad = (a, b) => Math.abs(a - b) < 1e-6;
const hasNumber = (v) => typeof v === 'number' && Number.isFinite(v);

/** An entry can only be a rule-2 stall data point if it actually carries reps. */
const hasReps = (e) => hasNumber(e?.last_set_reps);

/**
 * Rule 1 / rule 2 reset: 90% of the current load, rounded to the nearest 2.5 kg.
 * Guard: on very light loads 90% can round back UP to the same number
 * (10 kg -> 9 -> rounds to 10). A "drop" that does not drop is a bug, so fall
 * back to one plate step.
 */
function dropLoad(currentKg) {
  const candidate = Math.min(roundToPlate(currentKg * 0.9), currentKg - PLATE_STEP_KG);
  if (candidate <= 0) return null; // nothing left to strip — see prescription text
  return candidate;
}

// --- Rule 2: the stall ------------------------------------------------------

/**
 * THE PIN ON RULE 2 (progression-protocol.html §3, "The pin on rule 2").
 *
 * "No rep added" means NO REP ADDED TO THE LAST SET. This is a DECISION, not a
 * derivation: a four-set log and a last-set log can legitimately disagree
 * (5,5,5,4 -> 6,6,5,4 added reps, but not to the last set). Pinning it to the
 * last set makes rule 2 fire SOONER than a count-any-set reading would. That
 * direction is deliberate — this course resets early rather than grinding late.
 *
 * A stall is three consecutive sessions (current + the two before it) at the
 * SAME LOAD with the last-set reps never going up. "Never going up" is
 * non-increasing, not identical: 5,5,5 stalls and so does 5,4,4 — going
 * backwards is certainly not progress.
 *
 * An entry with no reps logged cannot be a stall data point, so it cannot
 * complete a triple. We do not drop someone's load on the strength of a blank.
 */
function isStalled(entry, priors) {
  if (priors.length < STALL_SESSIONS - 1) return false;
  const [p2, p1] = priors.slice(-2); // p2 older, p1 immediately prior
  const window = [p2, p1, entry];

  if (!window.every(hasReps)) return false;
  if (!window.every((e) => sameLoad(e.load_kg, entry.load_kg))) return false;

  const repAdded = p1.last_set_reps > p2.last_set_reps || entry.last_set_reps > p1.last_set_reps;
  return !repAdded;
}

// --- The knee tripwire ------------------------------------------------------

const KNEE_DISCLAIMER = 'I am not a clinician and this is not medical advice.';

/**
 * Applied ON TOP of the verdict, never in place of it. The ordered rule decides
 * what goes on the bar; the tripwire decides whether you should be putting it
 * there at all. They run independently (protocol §5).
 */
function kneeCheck(entry, priors) {
  if (!hasNumber(entry.knee)) return null;

  const region = classifyLift(entry.lift);
  const kneeLoaded = region !== 'upper'; // lower, and unknown lifts we cannot rule out
  const tripped = entry.knee > KNEE_GREEN_MAX;

  if (!tripped) {
    return { knee: entry.knee, tripped: false, escalate: false, text: null };
  }

  if (!kneeLoaded) {
    return {
      knee: entry.knee,
      tripped: true,
      escalate: false,
      text:
        `Knee ${entry.knee}/10 logged on an upper-body lift. That lift did not load your knee, so ` +
        `this is not a programming signal — but it is still a signal. Tell me what it was doing. ` +
        KNEE_DISCLAIMER,
    };
  }

  const lastKneeSession = [...priors].reverse().find((p) => hasNumber(p.knee));
  const escalate = Boolean(lastKneeSession && lastKneeSession.knee > KNEE_GREEN_MAX);

  const lines = [
    `**Knee ${entry.knee}/10 — over the 3/10 line.** The tripwire is tripped. It does not replace ` +
      `the verdict below; it sits on top of it. The verdict still stands — do not load it until ` +
      `this is handled.`,
    'Regress in this order, and in no other: **shorten the range of motion, then drop the load, then ' +
      'swap the movement.** Range first — it is the cheapest thing to give up and often the only thing ' +
      'that needs to change.',
  ];
  if (escalate) {
    lines.push(
      '**Two bad sessions in a row on this lift.** Stop guessing and see a physiotherapist. That is ' +
        'the whole rule — I have nothing better than that sentence to give you here.',
    );
  }
  lines.push(KNEE_DISCLAIMER);

  return { knee: entry.knee, tripped: true, escalate, text: lines.join('\n\n') };
}

// --- The engine -------------------------------------------------------------

/**
 * @typedef {object} Entry
 * @property {string} date          YYYY-MM-DD
 * @property {string} lift
 * @property {string} equipment
 * @property {number} load_kg
 * @property {number} last_set_reps
 * @property {number} last_set_rpe
 * @property {number|null} [knee]   0-10, lower-body days only
 */

/**
 * Run the ordered rule.
 *
 * @param {Entry} entry      the session just logged
 * @param {Entry[]} history  prior sessions. MAY contain other lifts and other
 *   equipment — this function filters by (lift, equipment) itself, so a caller
 *   cannot accidentally feed free-bar squat history to a Smith squat. Expected
 *   in chronological order, oldest first.
 * @returns {object} verdict — never undefined for a valid entry.
 */
export function decide(entry, history = []) {
  const reps = entry.last_set_reps;
  const rpe = entry.last_set_rpe;

  if (!hasNumber(entry.load_kg)) throw new Error('load_kg is required to run the rule.');
  if (!hasNumber(reps)) throw new Error('last_set_reps is required to run the rule.');
  if (!hasNumber(rpe)) throw new Error('last_set_rpe is required to run the rule.');

  const key = historyKey(entry);
  const priors = history.filter((h) => historyKey(h) === key);

  const region = classifyLift(entry.lift);
  const increment = LOAD_INCREMENT_KG[region] ?? null;
  const knee = kneeCheck(entry, priors);

  const verdict = (fields) => ({
    lift: entry.lift,
    equipment: entry.equipment,
    region,
    key,
    load_kg: entry.load_kg,
    last_set_reps: reps,
    last_set_rpe: rpe,
    knee,
    ...fields,
  });

  // -- Rule 1 ---------------------------------------------------------------
  // Any set below 4 reps, OR the last set hit RPE 10.
  // RPE 10 BEATS "every set at 6". This is the case the review caught: a
  // session of 6,6,6,6 @ RPE 10 is not an earned six — it is a set with nothing
  // left in it. Rule 1 sits above rule 3 precisely so that it wins.
  if (reps < REP_MIN || rpe >= 10) {
    const next = dropLoad(entry.load_kg);
    const why = reps < REP_MIN
      ? `Last set fell to ${reps} reps — under the ${REP_MIN}-rep floor.`
      : `Last set hit RPE ${rpe}. That is failure, not effort. The cap is ${RPE_CAP}.`;
    return verdict({
      rule: 1,
      action: 'drop_load',
      name: 'Drop load, rebuild up',
      why,
      next_load_kg: next,
      next_target_reps: REP_MIN,
      prescription: next === null
        ? `The load is already too light to strip ${PLATE_STEP_KG} kg from it. The load is not the ` +
          `problem here — tell me what happened and we will look at the movement, not the number.`
        : `Next session: **${next} kg**, target **${REP_MIN} reps** on the last set, then climb from ` +
          `there. This is a reset, not a punishment. The load went somewhere it had not earned.`,
    });
  }

  // -- Rule 2 ---------------------------------------------------------------
  // Same load, no rep added to the LAST SET, 3 consecutive sessions.
  if (isStalled(entry, priors)) {
    const next = dropLoad(entry.load_kg);
    return verdict({
      rule: 2,
      action: 'drop_load',
      name: 'Drop load, rebuild up',
      why:
        `Three sessions running at ${entry.load_kg} kg with no rep added to the last set. ` +
        `That is a stall, not a bad day.`,
      next_load_kg: next,
      next_target_reps: REP_MIN,
      prescription: next === null
        ? `The load is already too light to strip ${PLATE_STEP_KG} kg from it. If you are stalled ` +
          `here, the load is not what is stalling you. Say what else is going on.`
        : `Next session: **${next} kg**, target **${REP_MIN} reps**, then climb again. Back off ~10% ` +
          `and rebuild. A fourth identical session is how a plateau turns into an injury.`,
    });
  }

  // -- Rule 3 ---------------------------------------------------------------
  // Every set hit 6 reps, RPE <= 8. Read off the last set: the range stops at 6,
  // so if the WORST set hit 6, all four did (protocol §3).
  if (reps >= REP_MAX && rpe <= RPE_CAP) {
    const next = increment === null ? null : entry.load_kg + increment;
    return verdict({
      rule: 3,
      action: 'add_load',
      name: 'Add load, reset reps',
      why: `Top of the range at RPE ${rpe}. You have earned the next load.`,
      next_load_kg: next,
      next_target_reps: REP_MIN,
      prescription: next === null
        ? `I have no body-region on file for "${entry.lift}", so I will not pick an increment for you ` +
          `— +5 kg and +2.5 kg are not interchangeable. Name the lift and I will give you the number.`
        : `Next session: **${next} kg** (+${increment} kg, ${region} body), target **${REP_MIN} reps** ` +
          `on the last set. Reps reset to the bottom of the range. Reps first, load second — never ` +
          `both at once.`,
    });
  }

  // -- Rule 4 ---------------------------------------------------------------
  // Last set hit RPE 9. BELOW rule 3: a 6 at RPE 9 is over the cap, so it does
  // not earn load. ABOVE rule 5: for the same reason, it does not earn a rep.
  if (rpe === 9) {
    return verdict({
      rule: 4,
      action: 'repeat',
      name: 'Repeat load and reps',
      why: `RPE ${rpe} — over the cap of ${RPE_CAP}. Those reps were not earned at that effort.`,
      next_load_kg: entry.load_kg,
      next_target_reps: reps,
      prescription:
        `Next session: **${entry.load_kg} kg**, same target — **${reps} reps** on the last set. ` +
        `Nothing moves. Run it again and make it cost less. The cap is not a suggestion.`,
    });
  }

  // -- Rule 5 ---------------------------------------------------------------
  // The residual. 4 <= reps < 6 and RPE <= 8. Its conditions are never checked:
  // if 1-4 did not fire, this fires. That is what makes the rule total.
  const target = reps + 1;
  return verdict({
    rule: 5,
    action: 'add_reps',
    name: 'Add reps, keep load',
    why: `${reps} reps at RPE ${rpe} — inside the range, inside the cap. Room to add a rep.`,
    next_load_kg: entry.load_kg,
    next_target_reps: target,
    prescription:
      `Next session: **${entry.load_kg} kg** — unchanged — target **${target} reps** on the last set. ` +
      `Fill the range before you touch the plates.`,
  });
}

/*
 * NOTE ON THE WEEK-1 CAP (flagged to the author, not silently resolved).
 *
 * The block runs week 1 at an RPE cap of 7 and week 2 at 8. The ordered rule as
 * written in the protocol only knows about 8: on a week-1 session, reps=6 @
 * RPE 8 fires rule 3 (add load) even though RPE 8 is OVER that week's cap — and
 * the glossary says "a set that exceeds the cap doesn't count as earned, even
 * if the reps were there." The rule and the glossary disagree in week 1.
 *
 * This engine implements the rule EXACTLY as the protocol states it (cap 8),
 * because the protocol is the spec, and inventing a week-aware branch would be
 * a quiet rewrite of it. The log carries no week number, so it could not run a
 * week-aware branch anyway. Raised in the handover report.
 */
