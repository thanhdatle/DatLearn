/* ============================================================
   UA topic — declarative live-calculator component.

   Wires every <section class="calc" data-calc="MODEL"> on the page, so a
   lesson can hold several, and so later lessons reuse the engine instead
   of inlining another one-off script.

   Markup contract:
     <section class="calc" data-calc="maxcpi">
       <div class="calc-grid">
         <div class="calc-field">
           <label for="x">ARPDAU</label>
           <div class="row">
             <input type="number" id="x" data-var="arpdau" value="0.012" step="0.001">
             <span class="unit">$</span>
           </div>
         </div>
       </div>
       <div class="calc-out">
         <div class="out-cell"><span class="out-label">LTV</span>
           <span class="out-value" data-out="ltv">—</span></div>
       </div>
       <p class="verdict" data-verdict></p>
     </section>

   A MODEL is a function (vars) -> { outputs: {name: string}, verdict: {state, html} }
   where state is 'good' | 'warn' | 'bad'. Register models in MODELS below.
   Every input recomputes its whole section on `input`, so feedback is
   immediate — the tight loop is the entire pedagogical point.
   ============================================================ */
(function () {
  'use strict';

  var money = function (n, dp) {
    if (!isFinite(n)) return '—';
    return '$' + n.toFixed(dp === undefined ? 2 : dp);
  };
  var pct = function (n) { return isFinite(n) ? Math.round(n * 100) + '%' : '—'; };

  /* ---------- retention maths ----------
     Fit a power law r(t) = A * t^-b through the measured D1/D7/D30 points by
     least squares in log-log space, then sum it to get cumulative active days.
     Power law is the standard shape for app retention: steep early decay, long
     shallow tail. Two points would fit exactly; three lets the tail disagree
     with the head, which is exactly when a curve is lying to you. */
  function fitRetention(d1, d7, d30) {
    var pts = [[1, d1], [7, d7], [30, d30]].filter(function (p) { return p[1] > 0; });
    if (pts.length < 2) return null;
    var n = pts.length, sx = 0, sy = 0, sxx = 0, sxy = 0;
    pts.forEach(function (p) {
      var x = Math.log(p[0]), y = Math.log(p[1]);
      sx += x; sy += y; sxx += x * x; sxy += x * y;
    });
    var denom = n * sxx - sx * sx;
    if (denom === 0) return null;
    var slope = (n * sxy - sx * sy) / denom;
    var intercept = (sy - slope * sx) / n;
    return { A: Math.exp(intercept), b: -slope };
  }

  /** Cumulative active days from install through day N, counting install day. */
  function activeDays(fit, N) {
    if (!fit) return NaN;
    var total = 1; // install day: the user is active by definition
    for (var t = 1; t <= N; t++) total += fit.A * Math.pow(t, -fit.b);
    return total;
  }

  var MODELS = {};

  /* ---------- Model: maximum allowable CPI ---------- */
  MODELS.maxcpi = function (v) {
    var fit = fitRetention(v.d1 / 100, v.d7 / 100, v.d30 / 100);
    var window = Math.max(1, Math.round(v.window));
    var days = activeDays(fit, window);
    var ltv = v.arpdau * days;
    var ratio = Math.max(0.01, v.ratio);
    var maxCpi = ltv / ratio;

    var d7rev = v.arpdau * activeDays(fit, 7);

    var out = {
      days: isFinite(days) ? days.toFixed(1) + ' days' : '—',
      ltv: money(ltv, 3),
      maxcpi: money(maxCpi, 3),
      d7roas: v.cpi > 0 ? pct(d7rev / v.cpi) : '—',
      roas: v.cpi > 0 ? pct(ltv / v.cpi) : '—'
    };

    var verdict;
    if (!isFinite(maxCpi) || !isFinite(v.cpi) || v.cpi <= 0) {
      verdict = { state: 'warn', html: 'Enter a market CPI to get a verdict.' };
    } else if (v.cpi <= maxCpi) {
      verdict = {
        state: 'good',
        html: '<strong>You can bid here.</strong> At ' + money(v.cpi) +
          ' CPI you are under your ceiling of ' + money(maxCpi, 3) + ', so a D' + window +
          ' payback at a ' + ratio + '× margin is achievable — <em>if</em> these inputs are measured, not hoped.'
      };
    } else if (v.cpi <= ltv) {
      verdict = {
        state: 'warn',
        html: '<strong>Break-even at best.</strong> ' + money(v.cpi) + ' CPI is above your ' +
          money(maxCpi, 3) + ' ceiling but below raw LTV of ' + money(ltv, 3) +
          '. You would recover the money by D' + window + ' and earn nothing for the risk, ' +
          'having lent it to Meta for ' + window + ' days. Not a business.'
      };
    } else {
      verdict = {
        state: 'bad',
        html: '<strong>Do not spend.</strong> At ' + money(v.cpi) + ' CPI against ' + money(ltv, 3) +
          ' of D' + window + ' LTV you get back ' + pct(ltv / v.cpi) +
          ' of every dollar. Scale makes this worse, not better — volume multiplies the loss.'
      };
    }
    return { outputs: out, verdict: verdict };
  };

  /* ---------- wiring ---------- */
  function wire(section) {
    var model = MODELS[section.dataset.calc];
    if (!model) return;

    var inputs = section.querySelectorAll('[data-var]');
    var outputs = section.querySelectorAll('[data-out]');
    var verdictEl = section.querySelector('[data-verdict]');

    function recompute() {
      var vars = {};
      inputs.forEach(function (input) {
        var n = parseFloat(input.value);
        vars[input.dataset.var] = isNaN(n) ? 0 : n;
      });

      var result = model(vars);

      outputs.forEach(function (el) {
        var value = result.outputs[el.dataset.out];
        if (value !== undefined) el.textContent = value;
      });

      if (verdictEl && result.verdict) {
        verdictEl.innerHTML = result.verdict.html;
        verdictEl.dataset.state = result.verdict.state;
      }
    }

    inputs.forEach(function (input) { input.addEventListener('input', recompute); });
    recompute();
  }

  document.querySelectorAll('.calc[data-calc]').forEach(wire);
})();
