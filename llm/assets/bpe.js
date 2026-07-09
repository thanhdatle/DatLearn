/* ============================================================
   DatLearn / LLM — byte-pair encoding sandbox.

   Trains a BPE tokeniser one merge at a time, in front of the learner:
   count adjacent symbol pairs, merge the most frequent, repeat. The
   vocabulary grows while the corpus shrinks — both counters are live, so
   the trade-off is watched rather than asserted.

   The encoder pane then replays the learned merge rules, in order, on a
   word the learner types. Typing a word the corpus never contained is the
   entire point: BPE composes it from pieces it did learn.

   Algorithm follows Sennrich, Haddow & Birch (arXiv 1508.07909 / ACL 2016).
   Verified against a reference implementation before shipping.

   Markup contract:
     <section class="sandbox bpe"
              data-corpus="low low lower newest widest"
              data-max-merges="9">
       <div class="stats bpe-stats"></div>
       <p class="bpe-next"></p>
       <div class="sandbox-controls">
         <button class="btn primary bpe-step">Merge the most frequent pair</button>
         <button class="btn bpe-reset">Reset</button>
       </div>
       <div class="bpe-seg"></div>
       <ol class="rules bpe-rules"></ol>
       <div class="sandbox-controls">
         <label for="w">Encode</label>
         <input id="w" class="text-input bpe-input" value="lowest">
       </div>
       <p class="sandbox-out bpe-encoded" role="status" aria-live="polite"></p>
     </section>
   ============================================================ */
(function () {
  'use strict';

  var EOW = '_';   // end-of-word marker: lets BPE learn suffixes as suffixes

  /* ---------- algorithm ---------- */

  function wordFreqs(corpus) {
    var freq = Object.create(null);
    corpus.toLowerCase().split(/\s+/).filter(Boolean).forEach(function (w) {
      freq[w] = (freq[w] || 0) + 1;
    });
    return freq;
  }

  // Each word becomes a list of symbols, starting as single characters.
  function initialWords(freq) {
    return Object.keys(freq).map(function (w) {
      return { sym: w.split('').concat([EOW]), f: freq[w] };
    });
  }

  // How often does each adjacent pair occur, weighted by word frequency?
  function pairCounts(words) {
    var c = Object.create(null);
    words.forEach(function (entry) {
      for (var i = 0; i < entry.sym.length - 1; i++) {
        var k = entry.sym[i] + ' ' + entry.sym[i + 1];
        c[k] = (c[k] || 0) + entry.f;
      }
    });
    return c;
  }

  // Most frequent pair. Ties broken by key order, so the run is deterministic.
  function bestPair(counts) {
    var best = null, n = -1;
    Object.keys(counts).forEach(function (k) {
      if (counts[k] > n || (counts[k] === n && k < best)) { best = k; n = counts[k]; }
    });
    if (!best) return null;
    var parts = best.split(' ');
    return { a: parts[0], b: parts[1], n: n };
  }

  // Replace every occurrence of (a,b) with the single symbol a+b.
  function applyMerge(words, a, b) {
    return words.map(function (entry) {
      var out = [], i = 0, sym = entry.sym;
      while (i < sym.length) {
        if (i < sym.length - 1 && sym[i] === a && sym[i + 1] === b) { out.push(a + b); i += 2; }
        else { out.push(sym[i]); i++; }
      }
      return { sym: out, f: entry.f };
    });
  }

  function totalTokens(words) {
    return words.reduce(function (s, e) { return s + e.sym.length * e.f; }, 0);
  }

  // The tokeniser's vocabulary is every symbol it CAN emit: the base
  // characters plus each merged symbol. It only ever grows.
  //
  // Do NOT compute this by scanning the current segmentation. A merged-away
  // character ("e" once every "e" is inside "es") disappears from the corpus
  // but remains in the vocabulary — the tokeniser still needs it to spell an
  // unseen word. Counting the segmentation makes the vocabulary appear to
  // SHRINK as you merge, which is the exact opposite of what BPE does.
  function vocabSize(baseSymbols, merges) {
    var v = Object.create(null);
    baseSymbols.forEach(function (s) { v[s] = true; });
    merges.forEach(function (m) { v[m.a + m.b] = true; });
    return Object.keys(v).length;
  }

  function baseSymbolsOf(words) {
    var v = Object.create(null);
    words.forEach(function (e) { e.sym.forEach(function (s) { v[s] = true; }); });
    return Object.keys(v);
  }

  // Encoding is just replaying the merge rules, in the order they were learned.
  function encode(word, merges) {
    var sym = word.toLowerCase().split('').concat([EOW]);
    merges.forEach(function (m) {
      var out = [], i = 0;
      while (i < sym.length) {
        if (i < sym.length - 1 && sym[i] === m.a && sym[i + 1] === m.b) { out.push(m.a + m.b); i += 2; }
        else { out.push(sym[i]); i++; }
      }
      sym = out;
    });
    return sym;
  }

  /* ---------- view ---------- */

  function chip(text, fresh) {
    var el = document.createElement('span');
    el.className = 'tokchip' + (fresh ? ' fresh' : '');
    // Render the marker in a muted span so it reads as structure, not letters.
    var idx = text.indexOf(EOW);
    if (idx === -1) {
      el.textContent = text;
    } else {
      el.appendChild(document.createTextNode(text.slice(0, idx)));
      var m = document.createElement('span');
      m.className = 'eow';
      m.textContent = EOW;
      m.title = 'end of word';
      el.appendChild(m);
    }
    return el;
  }

  function stat(container, key, value, sub) {
    var s = document.createElement('div');
    s.className = 'stat';
    var k = document.createElement('span');
    k.className = 'k';
    k.textContent = key;
    var v = document.createElement('span');
    v.className = 'v';
    v.textContent = value;
    if (sub) {
      var small = document.createElement('small');
      small.textContent = ' ' + sub;
      v.appendChild(small);
    }
    s.appendChild(k);
    s.appendChild(v);
    container.appendChild(s);
  }

  /* ---------- wiring ---------- */

  function wire(root) {
    var corpus = root.dataset.corpus || '';
    var maxMerges = parseInt(root.dataset.maxMerges || '10', 10);

    var statsEl = root.querySelector('.bpe-stats');
    var nextEl = root.querySelector('.bpe-next');
    var segEl = root.querySelector('.bpe-seg');
    var rulesEl = root.querySelector('.bpe-rules');
    var stepBtn = root.querySelector('.bpe-step');
    var resetBtn = root.querySelector('.bpe-reset');
    var input = root.querySelector('.bpe-input');
    var encEl = root.querySelector('.bpe-encoded');
    if (!segEl || !stepBtn) return;

    var freq = wordFreqs(corpus);
    var startWords = initialWords(freq);
    var startTokens = totalTokens(startWords);
    var baseSymbols = baseSymbolsOf(startWords);   // fixed: the alphabet, before any merge

    var words, merges, lastSymbol;

    function renderStats() {
      if (!statsEl) return;
      statsEl.textContent = '';
      var toks = totalTokens(words);
      stat(statsEl, 'Vocabulary', vocabSize(baseSymbols, merges), 'symbols');
      stat(statsEl, 'Corpus length', toks, 'tokens');
      stat(statsEl, 'Merges learned', merges.length, 'of ' + maxMerges);
      var pct = Math.round((1 - toks / startTokens) * 100);
      stat(statsEl, 'Shorter by', pct + '%', 'vs characters');
    }

    function renderNext() {
      if (!nextEl) return;
      var bp = bestPair(pairCounts(words));
      var exhausted = merges.length >= maxMerges || !bp || bp.n < 2;
      stepBtn.disabled = exhausted;
      if (exhausted) {
        stepBtn.textContent = merges.length >= maxMerges ? 'Merge budget spent' : 'No pair repeats';
        nextEl.textContent = merges.length >= maxMerges
          ? 'You set a budget of ' + maxMerges + ' merges — that budget is exactly what "vocabulary size" means.'
          : 'Every remaining pair occurs only once. Merging them would grow the vocabulary without shortening anything.';
        return;
      }
      stepBtn.textContent = 'Merge the most frequent pair';
      nextEl.textContent = '';
      nextEl.appendChild(document.createTextNode('Most frequent adjacent pair: '));
      nextEl.appendChild(chip(bp.a, false));
      nextEl.appendChild(document.createTextNode(' + '));
      nextEl.appendChild(chip(bp.b, false));
      nextEl.appendChild(document.createTextNode(', seen ' + bp.n + '×.'));
    }

    function renderSeg() {
      segEl.textContent = '';
      words.slice().sort(function (a, b) { return b.f - a.f; }).forEach(function (e) {
        var row = document.createElement('div');
        row.className = 'seg-row';
        var f = document.createElement('span');
        f.className = 'freq';
        f.textContent = e.f + '×';
        var syms = document.createElement('span');
        syms.className = 'syms';
        e.sym.forEach(function (s) { syms.appendChild(chip(s, s === lastSymbol)); });
        row.appendChild(f);
        row.appendChild(syms);
        segEl.appendChild(row);
      });
    }

    function renderRules() {
      if (!rulesEl) return;
      rulesEl.textContent = '';
      merges.forEach(function (m) {
        var li = document.createElement('li');
        li.textContent = m.a + ' + ' + m.b + '  →  ' + (m.a + m.b);
        rulesEl.appendChild(li);
      });
    }

    function renderEncoded() {
      if (!input || !encEl) return;
      var w = input.value.trim();
      encEl.textContent = '';
      if (!w) {
        encEl.textContent = 'Type a word to see how this tokeniser splits it.';
        return;
      }
      var pieces = encode(w, merges);
      pieces.forEach(function (p) { encEl.appendChild(chip(p, false)); });
      var note = document.createElement('span');
      note.className = 'sandbox-help';
      note.style.display = 'block';
      note.style.marginTop = '.5rem';
      var seen = Object.prototype.hasOwnProperty.call(freq, w.toLowerCase());
      note.textContent = pieces.length + (pieces.length === 1 ? ' token.' : ' tokens.') +
        (seen ? ' This word is in the corpus.' : ' This word is NOT in the corpus — and it still encodes.');
      encEl.appendChild(note);
    }

    function renderAll() {
      renderStats(); renderNext(); renderSeg(); renderRules(); renderEncoded();
    }

    function reset() {
      words = initialWords(freq);
      merges = [];
      lastSymbol = null;
      renderAll();
    }

    stepBtn.addEventListener('click', function () {
      var bp = bestPair(pairCounts(words));
      if (!bp || bp.n < 2 || merges.length >= maxMerges) return;
      words = applyMerge(words, bp.a, bp.b);
      merges.push({ a: bp.a, b: bp.b });
      lastSymbol = bp.a + bp.b;
      renderAll();
    });

    if (resetBtn) resetBtn.addEventListener('click', reset);
    if (input) input.addEventListener('input', renderEncoded);

    reset();
  }

  document.querySelectorAll('.sandbox.bpe').forEach(wire);
})();
