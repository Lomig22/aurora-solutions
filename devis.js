(function () {
  'use strict';
  var modal = document.getElementById('devisModal');
  if (!modal) return;
  var trigger = null;
  var previousOverflow = '';
  var inactive = [];
  var selector = 'a[href], button, input, select, textarea, [tabindex]';

  function focusable() {
    return Array.prototype.filter.call(modal.querySelectorAll(selector), function (element) {
      return !element.disabled && element.tabIndex >= 0 && element.getClientRects().length > 0 && !element.closest('[inert]');
    });
  }

  function isolate() {
    var branch = modal;
    while (branch.parentElement) {
      Array.prototype.forEach.call(branch.parentElement.children, function (sibling) {
        if (sibling !== branch && !sibling.hasAttribute('inert')) {
          sibling.setAttribute('inert', '');
          inactive.push(sibling);
        }
      });
      if (branch.parentElement === document.body) break;
      branch = branch.parentElement;
    }
  }

  function openModal(event) {
    event.preventDefault();
    if (modal.classList.contains('open')) return;
    trigger = event.currentTarget;
    var menu = document.getElementById('mobmenu');
    var ham = document.getElementById('ham');
    if (menu && menu.contains(trigger) && ham) trigger = ham;
    if (menu && menu.classList.contains('open')) {
      menu.classList.remove('open');
      if (ham) ham.classList.remove('open');
      document.body.style.overflow = '';
    }
    previousOverflow = document.body.style.overflow;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    isolate();
    var field = modal.querySelector('input:not([type="hidden"]):not([name="_honey"])');
    (field || modal).focus();
  }

  function closeModal() {
    if (!modal.classList.contains('open')) return;
    modal.classList.remove('open');
    inactive.forEach(function (element) { element.removeAttribute('inert'); });
    inactive = [];
    document.body.style.overflow = previousOverflow;
    if (trigger && trigger.isConnected) trigger.focus();
  }

  document.querySelectorAll('[data-devis]').forEach(function (element) {
    element.addEventListener('click', openModal);
  });
  document.getElementById('modalClose').addEventListener('click', closeModal);
  modal.addEventListener('click', function (event) { if (event.target === modal) closeModal(); });
  document.addEventListener('keydown', function (event) {
    if (!modal.classList.contains('open')) return;
    if (event.key === 'Escape') { event.preventDefault(); closeModal(); }
    if (event.key !== 'Tab') return;
    var elements = focusable();
    var first = elements[0];
    var last = elements[elements.length - 1];
    if (!first) { event.preventDefault(); modal.focus(); return; }
    if (event.shiftKey && (document.activeElement === first || !modal.contains(document.activeElement))) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !modal.contains(document.activeElement))) {
      event.preventDefault(); first.focus();
    }
  });
  document.addEventListener('focusin', function (event) {
    if (modal.classList.contains('open') && !modal.contains(event.target)) {
      (focusable()[0] || modal).focus();
    }
  });
})();
