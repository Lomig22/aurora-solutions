(function () {
  document.querySelectorAll('.cform, .dform, .mform').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var btn = form.querySelector('[type="submit"]');
      var label = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Envoi en cours…';

      var data = new FormData(form);

      fetch('https://formsubmit.co/ajax/aurora.solutions.17800@gmail.com', {
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
