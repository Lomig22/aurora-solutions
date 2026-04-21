(function () {
  var base = window.location.href.replace(/\/[^/]*(\?.*)?$/, '/');

  document.querySelectorAll('.dform, .mform').forEach(function (form) {
    form.addEventListener('submit', function () {
      var next = form.querySelector('[name="_next"]');
      if (!next) {
        next = document.createElement('input');
        next.type  = 'hidden';
        next.name  = '_next';
        form.appendChild(next);
      }
      next.value = base + 'merci.html';
    });
  });
})();
