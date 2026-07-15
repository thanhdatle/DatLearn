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
 * progression-rule.test.mjs proves exactly one rule fires for every (reps, RPE)
 * — INCLUDING half-point RPEs.
 *
 * THE ORDERED RULE RUNS IN WEEK 2 ONLY. Week 1 of a block is calibration: it
 * caps at RPE 7 and its job is to FIND the loads, not to progress them. Running
 * the ordered rule on a week-1 session would tell him to ADD LOAD off a set that
 * blew that week's own cap. See `calibrate()` below, and two-week-block.html.
 *
 * Zero dependencies. Plain Node ESM.
 */

// --- Rep range, set count, RPE caps -----------------------------------------

export const REP_MIN = 4;
export const REP_MAX = 6;

/** The week-2 cap. The ordered rule is written against THIS number. */
export const RPE_CAP = 8;

/** The week-1 cap. Calibration only — the ordered rule never runs against it. */
export const RPE_CAP_WEEK1 = 7;

/** Week 1 finds each load with a set of five. That is the reference set. */
const CALIBRATION_REPS = 5;

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
 * A week-1 session is a CALIBRATION session, not a progression session. It was
 * run under a different cap (7, not 8) and it was deliberately ramping the load
 * to find it. It is therefore not evidence of a stall, and it must not be
 * allowed to complete a stall triple — the same reasoning that keeps a
 * reps-less entry out of the window: rule 2 counts progression sessions, and a
 * calibration session is not one.
 *
 * A row with NO block_week is a pre-schema row. It is counted, because every
 * such row was logged under the old week-agnostic rule, i.e. as a week-2
 * progression session.
 */
const isCalibrationSession = (e) => e?.block_week === 1;

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
 * Nor on the strength of a week-1 calibration session — see
 * `isCalibrationSession`.
 */
function isStalled(entry, priors) {
  const progressionPriors = priors.filter((p) => !isCalibrationSession(p));
  if (progressionPriors.length < STALL_SESSIONS - 1) return false;
  const [p2, p1] = progressionPriors.slice(-2); // p2 older, p1 immediately prior
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
 * @property {number} last_set_rpe  4-10, half points allowed (7.5, 8.5, 9.5)
 * @property {1|2} block_week       1 = calibration, 2 = execution
 * @property {number|null} [knee]   0-10, lower-body days only
 */

/**
 * WEEK 1 — CALIBRATION. The ordered rule does not run.
 *
 * Week 1 caps at RPE 7 and exists to FIND each load, not to progress it. The
 * ordered rule only knows the week-2 cap of 8, so a week-1 set of 6 @ RPE 8
 * would fire rule 3 and tell him to ADD LOAD — off a set that went OVER that
 * week's own cap, which the glossary says is not "earned". The rule and the
 * programme contradicted each other; this branch is where that stops.
 *
 * Guidance is the block plan's own, verbatim in substance
 * (two-week-block.html, "Finding the load, set by set").
 */
function calibrate(entry, verdict, region, increment) {
  const rpe = entry.last_set_rpe;
  const reps = entry.last_set_reps;
  const load = entry.load_kg;

  const status = rpe < RPE_CAP_WEEK1 ? 'under' : rpe > RPE_CAP_WEEK1 ? 'over' : 'at';

  const preamble =
    `**Week 1 is calibration — the ordered rule does not run.** Its job is to find the load, not to ` +
    `progress it. Nothing you did this session can earn you a kilo or cost you one. The week-1 cap is ` +
    `**RPE ${RPE_CAP_WEEK1}**, one notch below the programme's real cap of ${RPE_CAP}.`;

  const noIncrement =
    `I have no body-region on file for "${entry.lift}", so I will not pick an increment for you — ` +
    `+5 kg and +2.5 kg are not interchangeable. Name the lift and I will give you the number.`;

  if (status === 'under') {
    const next = increment === null ? null : load + increment;
    return verdict({
      rule: null,
      action: 'calibrate',
      name: 'Find the load, don\'t progress it',
      calibration: 'under',
      why:
        `${preamble}\n\nYour last set came in at **RPE ${rpe} — under the RPE ${RPE_CAP_WEEK1} cap.** ` +
        `That is week 1 working exactly as intended, and it means ${load} kg is not yet the load you ` +
        `came here to find.`,
      next_load_kg: next,
      next_target_reps: CALIBRATION_REPS,
      prescription: next === null
        ? noIncrement
        : `Add **${increment} kg** (${region} body) and go again on the next set — **${next} kg**. ` +
          `Whatever weight lands you at RPE ${RPE_CAP_WEEK1} for a set of ${CALIBRATION_REPS} ` +
          `**is your week-2 starting load.** Four sets is enough to find it; don't hunt past four.`,
    });
  }

  if (status === 'over') {
    const next = increment === null || load - increment <= 0 ? null : load - increment;
    return verdict({
      rule: null,
      action: 'calibrate',
      name: 'Find the load, don\'t progress it',
      calibration: 'over',
      why:
        `${preamble}\n\nYour last set came in at **RPE ${rpe} — over the RPE ${RPE_CAP_WEEK1} cap.** ` +
        `A set over the cap is not earned, even when the reps are there — and in week 1 it is not even ` +
        `information: you have overshot the load you were trying to locate.`,
      next_load_kg: next,
      next_target_reps: CALIBRATION_REPS,
      prescription: next === null
        ? noIncrement
        : `Come back down one step — **${next} kg** — and re-rate it. Same ramp, run backwards. Start ` +
          `deliberately too light and climb; the load that lands at RPE ${RPE_CAP_WEEK1} for a set of ` +
          `${CALIBRATION_REPS} is the one you want, and you have just proved it is below ${load} kg.`,
    });
  }

  return verdict({
    rule: null,
    action: 'calibrate',
    name: 'Find the load, don\'t progress it',
    calibration: 'at',
    why:
      `${preamble}\n\nYour last set came in **at the RPE ${RPE_CAP_WEEK1} cap** — ${reps} reps at ` +
      `RPE ${rpe}. That is the number this week existed to produce.`,
    next_load_kg: load,
    next_target_reps: CALIBRATION_REPS,
    prescription:
      `**${load} kg is your week-2 starting load** for this lift. Write it down and stop hunting. In ` +
      `week 2 the cap goes to RPE ${RPE_CAP}, you start here, and the ordered rule runs after every ` +
      `main lift.`,
  });
}

/**
 * Run the rule.
 *
 * In WEEK 2 that is the five ordered rules. In WEEK 1 it is `calibrate()` —
 * the ordered rule is not run at all. The knee tripwire runs in BOTH weeks; it
 * was never part of the ordered rule.
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
  const week = entry.block_week;

  if (!hasNumber(entry.load_kg)) throw new Error('load_kg is required to run the rule.');
  if (!hasNumber(reps)) throw new Error('last_set_reps is required to run the rule.');
  if (!hasNumber(rpe)) throw new Error('last_set_rpe is required to run the rule.');
  // Not defaulted. Which week it was decides whether the ordered rule runs at
  // all, and guessing "2" on a week-1 session is the exact bug this branch
  // exists to kill.
  if (week !== 1 && week !== 2) {
    throw new Error('block_week is required (1 or 2) — the ordered rule only runs in week 2.');
  }

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
    block_week: week,
    rpe_cap: week === 1 ? RPE_CAP_WEEK1 : RPE_CAP,
    knee,
    ...fields,
  });

  // -- Week 1 ---------------------------------------------------------------
  // Calibration. The ordered rule does not run. The knee tripwire (computed
  // above, attached below) does.
  if (week === 1) return calibrate(entry, verdict, region, increment);

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
  // Last set went ABOVE the cap: RPE > 8, and (rule 1 having passed) below 10.
  //
  // `rpe > RPE_CAP`, NOT `rpe === 9`. Half-point RPEs are standard practice, and
  // an 8.5 is over the cap. Written as `=== 9` it missed rule 1 (not >= 10),
  // missed rule 3 (not <= 8), missed rule 4 (not === 9) and fell into rule 5 —
  // which ADDED A REP at an effort that had already blown the cap. Exactly
  // backwards. Integer behaviour is unchanged: RPE 9 still lands here.
  //
  // BELOW rule 3: a 6 above the cap does not earn load. ABOVE rule 5: for the
  // same reason, it does not earn a rep either. Over the cap = hold.
  if (rpe > RPE_CAP) {
    return verdict({
      rule: 4,
      action: 'repeat',
      name: 'Repeat load and reps',
      why: `RPE ${rpe} — above the cap of ${RPE_CAP}. Those reps were not earned at that effort.`,
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
 * THE WEEK-1 CAP — RESOLVED, and resolved in the PROTOCOL, not just here.
 *
 * The gap: the block runs week 1 at an RPE cap of 7 and week 2 at 8, but the
 * ordered rule only ever knew about 8. A week-1 set of 6 reps @ RPE 8 fired
 * rule 3 and said ADD LOAD — during a calibration week, off a set that had blown
 * that week's own cap, while the glossary says a set over the cap is not earned.
 *
 * The programme had already answered this and nobody had told the rule:
 * two-week-block.html says week 1 establishes the loads and week 2 is where
 * "after every main lift you walk the ordered rule". So the fix is not a new
 * policy, it is wiring: the log now carries `block_week`, week 1 returns a
 * CALIBRATION verdict, and the ordered rule runs in week 2 only.
 *
 * progression-protocol.html §2 now states this. The rule and the programme agree.
 */
