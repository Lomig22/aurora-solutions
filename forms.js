(function () {
  var ENDPOINT = 'https://formsubmit.co/ajax/aurora.solutions.17800@gmail.com';

  /* Vérification anti-robot affichée seulement au moment de l'envoi.
     Tant que le visiteur remplit le formulaire, il ne voit rien. */

  var STYLE = [
    '.hcheck{margin:16px 0 4px;padding:14px 16px;border:1px solid var(--border,#dde4ee);',
    'background:var(--off,#f7f9fc);border-radius:2px;animation:hcheckIn .25s ease}',
    '.hcheck label{display:block;font-size:.8rem;font-weight:600;color:var(--navy,#0d1f35);margin-bottom:8px}',
    '.hcheck-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}',
    '.hcheck input{width:96px;padding:10px 12px;font:inherit;font-size:.9rem;',
    'border:1px solid var(--border,#dde4ee);background:#fff;border-radius:2px;min-height:44px}',
    '.hcheck input:focus{outline:2px solid var(--gold-btn,#e09a10);outline-offset:1px}',
    '.hcheck-hint{font-size:.74rem;color:var(--muted,#5c6e82)}',
    '.hcheck-err{font-size:.78rem;color:#c0392b;margin-top:8px;font-weight:600}',
    '@keyframes hcheckIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}'
  ].join('');

  var s = document.createElement('style');
  s.textContent = STYLE;
  document.head.appendChild(s);

  var seq = 0;

  document.querySelectorAll('.cform, .dform, .mform').forEach(function (form) {
    var uid = 'hcheck-' + (++seq);
    var opened = Date.now();
    var check = null;      // bloc de vérification, créé à la première tentative
    var answer = 0;

    function buildCheck(btn) {
      var a = 2 + Math.floor(Math.random() * 7);   // 2 à 8
      var b = 1 + Math.floor(Math.random() * 5);   // 1 à 5
      answer = a + b;

      check = document.createElement('div');
      check.className = 'hcheck';
      check.innerHTML =
        '<label for="' + uid + '">Dernière étape : combien font ' + a + ' + ' + b + ' ?</label>' +
        '<div class="hcheck-row">' +
        '<input id="' + uid + '" type="text" inputmode="numeric" autocomplete="off" aria-describedby="' + uid + '-h">' +
        '<span class="hcheck-hint" id="' + uid + '-h">Une simple vérification pour écarter les robots.</span>' +
        '</div>' +
        '<p class="hcheck-err" role="alert" hidden></p>';

      btn.parentNode.insertBefore(check, btn);
      var field = check.querySelector('input');
      field.focus();
      field.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); form.requestSubmit ? form.requestSubmit() : btn.click(); }
      });
    }

    function fail(msg) {
      var p = check.querySelector('.hcheck-err');
      p.textContent = msg;
      p.hidden = false;
      check.querySelector('input').focus();
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var btn = form.querySelector('[type="submit"]');

      /* 1re tentative : on affiche la vérification, on n'envoie pas encore */
      if (!check) { buildCheck(btn); return; }

      /* 2e tentative : on contrôle la réponse */
      var given = check.querySelector('input').value.trim().replace(/\s/g, '');
      if (given === '') { fail('Merci de répondre à la question ci-dessus.'); return; }
      if (parseInt(given, 10) !== answer) { fail('Réponse incorrecte, merci de réessayer.'); return; }

      /* Un formulaire rempli en moins de 3 secondes est le fait d'un robot */
      if (Date.now() - opened < 3000) { fail('Merci de vérifier votre saisie avant l\'envoi.'); return; }

      var label = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Envoi en cours…';

      var data = new FormData(form);

      fetch(ENDPOINT, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      })
        .then(function (r) { return r.json(); })
        .then(function () {
          window.location.href = 'merci.html';
        })
        .catch(function () {
          btn.disabled = false;
          btn.textContent = label;
          alert('Une erreur est survenue. Veuillez réessayer ou nous appeler directement.');
        });
    });
  });
})();
