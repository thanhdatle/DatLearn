/* ============================================================
   DatLearn — shared retrieval-practice quiz component
   Wires every .quiz on the page, so a lesson can hold several.
   (The AdMob lessons predate this and inline their own single-quiz
   script; new lessons should link this file instead.)

   Markup contract:
     <section class="quiz" data-correct-msg="Shown when they get it right.">
       <p class="quiz-q">Question?</p>
       <ul class="quiz-options">
         <li><button class="quiz-option" data-correct="true">Answer</button></li>
         <li><button class="quiz-option" data-msg="Why this one is wrong.">Answer</button></li>
       </ul>
       <p class="quiz-feedback" role="status" aria-live="polite"></p>
     </section>

   A wrong answer disables only itself, so the learner retries.
   Effortful retrieval is the point, not a score.
   ============================================================ */
(function () {
  'use strict';

  var FALLBACK_WRONG = 'Not quite — reread that section, then try another.';

  function wire(quiz) {
    var options = quiz.querySelectorAll('.quiz-option');
    var feedback = quiz.querySelector('.quiz-feedback');
    if (!options.length || !feedback) return;

    var settled = false;

    options.forEach(function (button) {
      button.addEventListener('click', function () {
        if (settled) return;

        if (button.dataset.correct === 'true') {
          settled = true;
          button.classList.add('correct');
          feedback.textContent = quiz.dataset.correctMsg || 'Correct.';
          feedback.dataset.state = 'correct';
          options.forEach(function (other) { other.disabled = true; });
          return;
        }

        button.classList.add('wrong');
        button.disabled = true;
        feedback.textContent = button.dataset.msg || FALLBACK_WRONG;
        feedback.dataset.state = 'wrong';
      });
    });
  }

  document.querySelectorAll('.quiz').forEach(wire);
})();
