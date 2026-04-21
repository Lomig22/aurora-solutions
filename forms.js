(function () {
  document.querySelectorAll('.dform, .mform').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var btn = form.querySelector('[type="submit"]');
      var originalHTML = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = 'Envoi en cours…';

      var data = new FormData(form);

      fetch('https://formsubmit.co/ajax/aurora.solutions.17800@gmail.com', {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      })
        .then(function (res) { return res.json(); })
        .then(function () {
          window.location.href = 'merci.html';
        })
        .catch(function () {
          btn.disabled = false;
          btn.innerHTML = originalHTML;
          var err = form.querySelector('.form-error');
          if (err) err.style.display = 'block';
        });
    });
  });
})();
