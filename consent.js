(function () {
  'use strict';
  var measurementId = 'G-5WL3YGM6LY';
  var choiceKey = 'auroraCookieConsent';
  var lifetime = 180 * 24 * 60 * 60 * 1000;
  var memory = null;
  var analyticsStarted = false;
  var returnFocus = null;

  function readChoice() {
    var saved = memory;
    if (!saved) {
      try {
        saved = JSON.parse(localStorage.getItem(choiceKey));
      } catch (e) { return null; }
    }
    if (!saved || typeof saved.at !== 'number') return null;
    var age = Date.now() - saved.at;
    return saved.at > 0 && age >= 0 && age < lifetime &&
      (saved.choice === 'accepted' || saved.choice === 'refused') ? saved.choice : null;
  }

  function saveChoice(choice) {
    memory = { choice: choice, at: Date.now() };
    try {
      localStorage.setItem(choiceKey, JSON.stringify(memory));
    } catch (e) { /* Le choix reste valable pour cette page si le stockage est bloqué. */ }
  }

  function clearAnalyticsCookies() {
    var host = window.location.hostname.split('.');
    var domains = [''];
    for (var i = 0; i < host.length - 1; i++) domains.push(host.slice(i).join('.'));
    var pathParts = window.location.pathname.split('/');
    var paths = ['/'];
    for (var p = 1; p < pathParts.length - 1; p++) paths.push('/' + pathParts.slice(1, p + 1).join('/'));
    document.cookie.split(';').forEach(function (cookie) {
      var name = cookie.split('=')[0].trim();
      if (!/^_(ga|gid|gat)(_|$)/.test(name)) return;
      domains.forEach(function (domain) {
        paths.forEach(function (path) {
          document.cookie = name + '=; Max-Age=0; path=' + path + (domain ? '; domain=' + domain : '') + '; SameSite=Lax';
        });
      });
    });
  }

  function loadAnalytics() {
    if (analyticsStarted || readChoice() !== 'accepted') return;
    analyticsStarted = true;
    window['ga-disable-' + measurementId] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', measurementId);
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
    document.head.appendChild(script);
  }

  function stopAnalytics() {
    window['ga-disable-' + measurementId] = true;
    clearAnalyticsCookies();
    // Recharger décharge aussi le SDK déjà exécuté et ses écouteurs.
    if (analyticsStarted) {
      window.dataLayer = [];
      window.location.reload();
    }
  }

  function showBanner(moveFocus) {
    var banner = document.getElementById('cookieBanner');
    if (!banner) return;
    banner.style.display = 'block';
    document.querySelectorAll('[data-cookie-settings]').forEach(function (button) {
      button.setAttribute('aria-expanded', 'true');
    });
    if (moveFocus) {
      returnFocus = document.activeElement;
      document.getElementById('cookieRefuse').focus();
    }
  }

  function hideBanner() {
    var banner = document.getElementById('cookieBanner');
    var focusWasInside = banner && banner.contains(document.activeElement);
    if (banner) banner.style.display = 'none';
    document.querySelectorAll('[data-cookie-settings]').forEach(function (button) {
      button.setAttribute('aria-expanded', 'false');
    });
    if (returnFocus && returnFocus.isConnected) returnFocus.focus();
    else if (focusWasInside) {
      var settings = document.querySelector('[data-cookie-settings]');
      if (settings) settings.focus();
    }
    returnFocus = null;
  }

  function reconcile() {
    if (readChoice() === 'accepted') loadAnalytics();
    else stopAnalytics();
    if (!readChoice()) showBanner(false);
  }

  window['ga-disable-' + measurementId] = true;
  reconcile();
  function initialize() {
    var accept = document.getElementById('cookieAccept');
    var refuse = document.getElementById('cookieRefuse');
    if (!accept || !refuse) return;
    document.querySelectorAll('[data-cookie-settings]').forEach(function (button) {
      button.addEventListener('click', function () { showBanner(true); });
    });
    accept.addEventListener('click', function () {
      saveChoice('accepted');
      hideBanner();
      loadAnalytics();
    });
    refuse.addEventListener('click', function () {
      saveChoice('refused');
      hideBanner();
      stopAnalytics();
    });
    if (!readChoice()) showBanner(false);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize);
  else initialize();
  window.addEventListener('storage', function (event) {
    if (event.key === choiceKey || event.key === null) {
      memory = null;
      reconcile();
      if (readChoice()) hideBanner();
    }
  });
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') reconcile();
  });
})();
