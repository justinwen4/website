(function () {
  'use strict';

  var GITHUB_USER = 'justinwen4';
  var CACHE_MINUTES = 30;
  var root = document.documentElement;

  /* ------------------------------------------------------------------------
     Theme toggle
     ------------------------------------------------------------------------ */

  var toggle = document.querySelector('.theme-toggle');
  var label = document.querySelector('.theme-label');
  var systemDark = window.matchMedia('(prefers-color-scheme: dark)');

  function currentTheme() {
    return root.dataset.theme || (systemDark.matches ? 'dark' : 'light');
  }

  function syncThemeUI() {
    var theme = currentTheme();
    if (label) label.textContent = theme === 'dark' ? 'Dark' : 'Light';
    if (toggle) toggle.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' theme');
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) {}
      syncThemeUI();
    });
  }

  systemDark.addEventListener('change', syncThemeUI);
  syncThemeUI();

  /* ------------------------------------------------------------------------
     Reveal on scroll
     ------------------------------------------------------------------------ */

  var revealables = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealables.forEach(function (el) { observer.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ------------------------------------------------------------------------
     Footer year
     ------------------------------------------------------------------------ */

  var year = document.querySelector('.year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ------------------------------------------------------------------------
     Live GitHub details (progressive enhancement; the page works without it)
     ------------------------------------------------------------------------ */

  function cached(key, fetcher) {
    var storageKey = 'gh:' + key;
    try {
      var hit = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
      if (hit && Date.now() - hit.t < CACHE_MINUTES * 60 * 1000) return Promise.resolve(hit.v);
    } catch (e) {}

    return fetcher().then(function (value) {
      try { sessionStorage.setItem(storageKey, JSON.stringify({ t: Date.now(), v: value })); } catch (e) {}
      return value;
    });
  }

  function github(path) {
    return cached(path, function () {
      return fetch('https://api.github.com' + path, {
        headers: { Accept: 'application/vnd.github+json' }
      }).then(function (res) {
        if (!res.ok) throw new Error('GitHub ' + res.status);
        return res.json();
      });
    });
  }

  var rtf = 'RelativeTimeFormat' in Intl ? new Intl.RelativeTimeFormat('en', { numeric: 'auto' }) : null;

  function timeAgo(iso) {
    var seconds = (new Date(iso).getTime() - Date.now()) / 1000;
    var units = [
      ['year', 31536000], ['month', 2592000], ['week', 604800],
      ['day', 86400], ['hour', 3600], ['minute', 60]
    ];
    for (var i = 0; i < units.length; i++) {
      var value = seconds / units[i][1];
      if (Math.abs(value) >= 1) {
        var n = Math.round(value);
        return rtf ? rtf.format(n, units[i][0]) : Math.abs(n) + ' ' + units[i][0] + 's ago';
      }
    }
    return 'just now';
  }

  // Stars + last updated on each project card
  github('/users/' + GITHUB_USER + '/repos?per_page=100&sort=pushed')
    .then(function (repos) {
      var byName = {};
      repos.forEach(function (r) { byName[r.name] = r; });

      document.querySelectorAll('[data-repo]').forEach(function (card) {
        var repo = byName[card.getAttribute('data-repo')];
        var meta = card.querySelector('.repo-meta');
        if (!repo || !meta) return;

        var parts = ['Updated ' + timeAgo(repo.pushed_at)];
        if (repo.stargazers_count > 0) {
          parts.unshift('★ ' + repo.stargazers_count);
        }
        meta.textContent = parts.join('  ·  ');
        meta.hidden = false;
      });
    })
    .catch(function () { /* Static content stays as-is */ });
})();
