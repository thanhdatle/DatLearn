/* ============================================================
   DatLearn / LLM — n-gram language model sandbox.

   A language model, in the most literal sense available: count which
   token follows which, normalise the counts, sample. The learner sees the
   probability strip update as the context changes, then watches text get
   generated one token at a time.

   Reusable. A later lesson can raise data-order to 2 for trigrams, or
   swap the corpus, without touching this file.

   Markup contract:
     <section class="sandbox ngram"
              data-corpus="the cat sat . the cat ran ."
              data-order="1"
              data-start="the">
       <div class="sandbox-controls">
         <label>Context <select class="ngram-context"></select></label>
         <button class="btn ngram-mode" aria-pressed="false">Sampling</button>
       </div>
       <div class="probs ngram-probs"></div>
       <div class="sandbox-controls">
         <button class="btn primary ngram-step">Generate next token</button>
         <button class="btn ngram-reset">Reset</button>
       </div>
       <p class="sandbox-out ngram-out" role="status" aria-live="polite"></p>
     </section>

   Every strip prints the numeric probability next to the bar: meaning is
   never carried by bar length or colour alone.
   ============================================================ */
(function () {
  'use strict';

  var TOP_N = 6;     // strip rows shown; the tail is summarised, never dropped silently
  var END = '■'; // end-of-text token, shown as a filled square

  /* ---------- model ---------- */

  // Split into tokens. Punctuation is its own token so the model can
  // learn that sentences end — the same reason real tokenisers keep it.
  function tokenize(text) {
    return text.toLowerCase().match(/[a-z']+|[.,!?;]/g) || [];
  }

  // counts[context][nextToken] = how many times that pair occurred.
  // `order` is how many tokens of history the context holds.
  function buildCounts(tokens, order) {
    var counts = Object.create(null);
    for (var i = 0; i + order <= tokens.length; i++) {
      var ctx = tokens.slice(i, i + order).join(' ');
      if (!ctx) continue;
      var next = i + order < tokens.length ? tokens[i + order] : END;
      if (!counts[ctx]) counts[ctx] = Object.create(null);
      counts[ctx][next] = (counts[ctx][next] || 0) + 1;
    }
    return counts;
  }

  // Normalise a row of counts into a descending list of {token, p, n}.
  function distribution(row) {
    if (!row) return [];
    var total = 0;
    Object.keys(row).forEach(function (k) { total += row[k]; });
    return Object.keys(row)
      .map(function (k) { return { token: k, n: row[k], p: row[k] / total }; })
      .sort(function (a, b) { return b.p - a.p || a.token.localeCompare(b.token); });
  }

  // Sample proportionally to probability. This is the entire difference
  // between a model that always says the same thing and one that doesn't.
  function sample(dist) {
    var r = Math.random();
    var acc = 0;
    for (var i = 0; i < dist.length; i++) {
      acc += dist[i].p;
      if (r < acc) return dist[i];
    }
    return dist[dist.length - 1];
  }

  function greedy(dist) { return dist[0]; }

  /* ---------- view ---------- */

  function renderStrip(el, dist, pickedToken) {
    el.textContent = '';
    if (!dist.length) {
      var empty = document.createElement('p');
      empty.className = 'sandbox-help';
      empty.textContent = 'This context never appears in the corpus, so the model has nothing to say.';
      el.appendChild(empty);
      return;
    }

    var head = dist.slice(0, TOP_N);
    var tail = dist.slice(TOP_N);

    head.forEach(function (d) {
      var row = document.createElement('div');
      row.className = 'prob';
      if (d.token === pickedToken) row.dataset.picked = 'true';

      var tok = document.createElement('span');
      tok.className = 'tok';
      tok.textContent = d.token;

      var bar = document.createElement('span');
      bar.className = 'bar';
      bar.style.setProperty('--p', d.p.toFixed(4));

      var pct = document.createElement('span');
      pct.className = 'pct';
      pct.textContent = (d.p * 100).toFixed(0) + '%';

      // The strip must be legible to a screen reader, not just to an eye.
      row.setAttribute('role', 'img');
      row.setAttribute('aria-label',
        d.token + ': ' + (d.p * 100).toFixed(0) + ' percent, seen ' + d.n +
        (d.n === 1 ? ' time' : ' times'));

      row.appendChild(tok);
      row.appendChild(bar);
      row.appendChild(pct);
      el.appendChild(row);
    });

    if (tail.length) {
      // Never silently truncate. Say what was left out.
      var rest = tail.reduce(function (s, d) { return s + d.p; }, 0);
      var note = document.createElement('p');
      note.className = 'sandbox-help';
      note.style.margin = '.4rem 0 0';
      note.textContent = '+ ' + tail.length + ' more token' + (tail.length === 1 ? '' : 's') +
        ' sharing the remaining ' + (rest * 100).toFixed(0) + '%.';
      el.appendChild(note);
    }
  }

  function renderOut(el, tokens, freshIndex) {
    el.textContent = '';
    tokens.forEach(function (t, i) {
      var span = document.createElement('span');
      if (i === freshIndex) span.className = 'fresh';
      if (t === END) span.textContent = ' ' + END;
      else span.textContent = (/^[.,!?;]$/.test(t) || i === 0) ? t : ' ' + t;
      el.appendChild(span);
    });
    var caret = document.createElement('span');
    caret.className = 'cursor';
    caret.textContent = ' ';
    el.appendChild(caret);
  }

  /* ---------- wiring ---------- */

  function wire(root) {
    var corpus = root.dataset.corpus || '';
    var order = Math.max(1, parseInt(root.dataset.order || '1', 10));

    var select = root.querySelector('.ngram-context');
    var stripEl = root.querySelector('.ngram-probs');
    var outEl = root.querySelector('.ngram-out');
    var stepBtn = root.querySelector('.ngram-step');
    var resetBtn = root.querySelector('.ngram-reset');
    var modeBtn = root.querySelector('.ngram-mode');
    if (!select || !stripEl || !outEl || !stepBtn) return;

    var tokens = tokenize(corpus);
    var counts = buildCounts(tokens, order);
    var contexts = Object.keys(counts).sort();
    if (!contexts.length) return;

    var useSampling = true;
    var generated = [];

    // Never let the alphabetical first context win by accident — it is "."
    // for any corpus with punctuation, which is a baffling place to start.
    // Prefer an explicit data-start, then the corpus's own opening context.
    var declared = (root.dataset.start || '').toLowerCase();
    var opening = tokens.slice(0, order).join(' ');
    var startCtx = counts[declared] ? declared
                 : counts[opening] ? opening
                 : contexts[0];
    var ctx = startCtx;

    contexts.forEach(function (c) {
      var opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      select.appendChild(opt);
    });

    function currentDist() { return distribution(counts[ctx]); }

    function refresh(picked, freshIndex) {
      select.value = ctx;
      renderStrip(stripEl, currentDist(), picked);
      renderOut(outEl, generated.length ? generated : ctx.split(' '), freshIndex);
      var done = !currentDist().length || generated[generated.length - 1] === END;
      stepBtn.disabled = done;
      stepBtn.textContent = done ? 'Sequence ended' : 'Generate next token';
    }

    function reset(newCtx) {
      ctx = newCtx || startCtx;
      generated = ctx.split(' ');
      refresh(null, -1);
    }

    select.addEventListener('change', function () { reset(select.value); });

    stepBtn.addEventListener('click', function () {
      var dist = currentDist();
      if (!dist.length) return;
      var picked = useSampling ? sample(dist) : greedy(dist);
      generated.push(picked.token);
      // Slide the context window forward by one token.
      ctx = generated.slice(-order).join(' ');
      if (!counts[ctx]) {
        // Unseen context: the model is out of its depth. Say so plainly.
        renderStrip(stripEl, [], null);
        renderOut(outEl, generated, generated.length - 1);
        stepBtn.disabled = true;
        stepBtn.textContent = 'Unseen context';
        return;
      }
      refresh(null, generated.length - 1);
    });

    if (resetBtn) resetBtn.addEventListener('click', function () { reset(select.value); });

    if (modeBtn) {
      modeBtn.addEventListener('click', function () {
        useSampling = !useSampling;
        modeBtn.textContent = useSampling ? 'Sampling' : 'Greedy';
        modeBtn.setAttribute('aria-pressed', String(!useSampling));
        modeBtn.title = useSampling
          ? 'Picking proportionally to probability. Run it twice, get two texts.'
          : 'Always picking the single most likely token. Deterministic, and it loops.';
      });
    }

    reset(startCtx);
  }

  document.querySelectorAll('.sandbox.ngram').forEach(wire);
})();
