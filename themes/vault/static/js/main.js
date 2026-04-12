/**
 * Vault Theme — Main JavaScript
 * Features: Dark mode, TOC, reading progress bar, scroll-to-top, search, share
 */

(function() {
  'use strict';

  /* ================================================================
     Dark Mode
  ================================================================ */
  var themeKey = 'vault-theme';

  function initTheme() {
    var saved = localStorage.getItem(themeKey);
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = saved || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  }

  function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme');
    var next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(themeKey, next);
  }

  initTheme();

  document.addEventListener('DOMContentLoaded', function() {
    var toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', toggleTheme);
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
      if (!localStorage.getItem(themeKey)) {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    });
  });

  /* ================================================================
     Reading Progress Bar
  ================================================================ */
  function initProgressBar() {
    var progressBar = document.getElementById('reading-progress');
    if (!progressBar) return;

    function updateProgress() {
      var article = document.querySelector('.post-content');
      if (!article) return;

      var articleTop = article.offsetTop;
      var articleHeight = article.offsetHeight;
      var windowHeight = window.innerHeight;
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      var progress = Math.max(0, Math.min(100,
        ((scrollTop - articleTop + windowHeight) / articleHeight) * 100
      ));

      progressBar.style.width = progress + '%';
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  /* ================================================================
     Table of Contents (TOC)
  ================================================================ */
  function initTOC() {
    var tocBody = document.getElementById('toc-body');
    var tocList = document.getElementById('toc-list');
    if (!tocList) return;

    var content = document.querySelector('.post-content');
    if (!content) return;

    var headings = content.querySelectorAll('h2, h3, h4');
    if (headings.length === 0) {
      var tocWidget = document.querySelector('.toc-widget');
      if (tocWidget) tocWidget.style.display = 'none';
      return;
    }

    var fragment = document.createDocumentFragment();
    headings.forEach(function(heading, index) {
      if (!heading.id) {
        heading.id = 'heading-' + index + '-' + heading.textContent
          .toLowerCase()
          .replace(/[^\w\s\uAC00-\uD7A3]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 50);
      }

      var li = document.createElement('li');
      li.className = 'toc-' + heading.tagName.toLowerCase();

      var a = document.createElement('a');
      a.href = '#' + heading.id;
      a.textContent = heading.textContent;
      a.addEventListener('click', function(e) {
        e.preventDefault();
        var target = document.getElementById(heading.id);
        if (target) {
          var offset = 80;
          var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      });

      li.appendChild(a);
      fragment.appendChild(li);
    });
    tocList.appendChild(fragment);

    // TOC collapse/expand
    var tocToggle = document.getElementById('toc-toggle');
    if (tocToggle && tocBody) {
      tocToggle.addEventListener('click', function() {
        var isCollapsed = tocBody.style.display === 'none';
        tocBody.style.display = isCollapsed ? 'block' : 'none';
        tocToggle.setAttribute('aria-expanded', isCollapsed);
        tocToggle.innerHTML = isCollapsed
          ? '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M3.5 5.5l4.5 4.5 4.5-4.5"/></svg>'
          : '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M3.5 10.5l4.5-4.5 4.5 4.5"/></svg>';
      });
    }

    // Highlight current heading on scroll
    var tocLinks = tocList.querySelectorAll('a');
    var headingIds = Array.from(headings).map(function(h) { return h.id; });

    function highlightCurrentHeading() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var offset = 100;

      var current = headingIds[0];
      for (var i = 0; i < headingIds.length; i++) {
        var el = document.getElementById(headingIds[i]);
        if (el && el.offsetTop - offset <= scrollTop) {
          current = headingIds[i];
        }
      }

      tocLinks.forEach(function(link) {
        link.classList.toggle('active', link.getAttribute('href') === '#' + current);
      });
    }

    window.addEventListener('scroll', highlightCurrentHeading, { passive: true });
    highlightCurrentHeading();
  }

  /* ================================================================
     Scroll to Top Button
  ================================================================ */
  function initScrollTop() {
    var btn = document.getElementById('scroll-top-btn');
    if (!btn) return;

    window.addEventListener('scroll', function() {
      var visible = window.pageYOffset > 400;
      btn.classList.toggle('visible', visible);
    }, { passive: true });

    btn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ================================================================
     Mobile Menu
  ================================================================ */
  function initMobileMenu() {
    var menuToggle = document.getElementById('menu-toggle');
    var navMenu = document.getElementById('nav-menu');
    if (!menuToggle || !navMenu) return;

    menuToggle.addEventListener('click', function() {
      var isOpen = navMenu.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', isOpen);
    });

    document.addEventListener('click', function(e) {
      if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        navMenu.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', false);
      }
    });
  }

  /* ================================================================
     Search Toggle
  ================================================================ */
  function initSearch() {
    var searchToggle = document.getElementById('search-toggle');
    var searchBar = document.getElementById('search-bar');
    var searchInput = document.getElementById('search-input');
    if (!searchToggle || !searchBar) return;

    searchToggle.addEventListener('click', function() {
      var isOpen = searchBar.classList.toggle('is-open');
      if (isOpen && searchInput) {
        setTimeout(function() { searchInput.focus(); }, 50);
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        searchBar.classList.remove('is-open');
      }
    });
  }

  /* ================================================================
     Copy Link Share Button
  ================================================================ */
  function initShareButtons() {
    var copyBtns = document.querySelectorAll('.share-copy');
    copyBtns.forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        var url = window.location.href;
        navigator.clipboard.writeText(url).then(function() {
          var originalText = btn.innerHTML;
          btn.innerHTML = btn.innerHTML.replace(/Copy Link/, '\u2713 Copied!');
          setTimeout(function() {
            btn.innerHTML = originalText;
          }, 2000);
        }).catch(function() {
          var textarea = document.createElement('textarea');
          textarea.value = url;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        });
      });
    });
  }

  /* ================================================================
     Lazy Loading Images
  ================================================================ */
  function initLazyLoad() {
    if ('loading' in HTMLImageElement.prototype) {
      document.querySelectorAll('img[data-src]').forEach(function(img) {
        img.src = img.dataset.src;
        img.loading = 'lazy';
      });
    } else if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            var img = entry.target;
            img.src = img.dataset.src;
            observer.unobserve(img);
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(function(img) {
        observer.observe(img);
      });
    }
  }

  /* ================================================================
     Smooth Anchor Links
  ================================================================ */
  function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
      anchor.addEventListener('click', function(e) {
        var href = this.getAttribute('href');
        if (href === '#') return;
        var target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          var offset = 80;
          var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      });
    });
  }

  /* ================================================================
     Init All
  ================================================================ */
  document.addEventListener('DOMContentLoaded', function() {
    initProgressBar();
    initTOC();
    initScrollTop();
    initMobileMenu();
    initSearch();
    initShareButtons();
    initLazyLoad();
    initSmoothScrolling();
  });

})();
