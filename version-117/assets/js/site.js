(function () {
  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function bootMenu() {
    var button = one('.menu-toggle');
    if (!button) {
      return;
    }
    button.addEventListener('click', function () {
      document.body.classList.toggle('is-menu-open');
    });
  }

  function bootHero() {
    var hero = one('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = all('.hero-slide', hero);
    var dots = all('.hero-dot', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, pos) {
        slide.classList.toggle('is-active', pos === current);
      });
      dots.forEach(function (dot, pos) {
        dot.classList.toggle('is-active', pos === current);
      });
    }

    function next() {
      show(current + 1);
    }

    function start() {
      stop();
      timer = window.setInterval(next, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    all('[data-hero-next]', hero).forEach(function (button) {
      button.addEventListener('click', function () {
        next();
        start();
      });
    });

    all('[data-hero-prev]', hero).forEach(function (button) {
      button.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    });

    dots.forEach(function (dot, pos) {
      dot.addEventListener('click', function () {
        show(pos);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function bootFiltering() {
    var root = one('[data-filter-root]');
    if (!root) {
      return;
    }
    var input = one('[data-filter-input]', root);
    var year = one('[data-year-filter]', root);
    var region = one('[data-region-filter]', root);
    var cards = all('.movie-card', root).concat(all('.rank-row', root));
    var empty = one('.empty-state', root);
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';

    if (input && q) {
      input.value = q;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function apply() {
      var words = normalize(input ? input.value : '').split(/\s+/).filter(Boolean);
      var yearValue = year ? year.value : '';
      var regionValue = region ? region.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var hay = normalize(card.getAttribute('data-search') || card.textContent);
        var cardYear = card.getAttribute('data-year') || '';
        var cardRegion = card.getAttribute('data-region') || '';
        var matchText = words.every(function (word) {
          return hay.indexOf(word) !== -1;
        });
        var matchYear = !yearValue || cardYear === yearValue;
        var matchRegion = !regionValue || cardRegion.indexOf(regionValue) !== -1;
        var ok = matchText && matchYear && matchRegion;
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, year, region].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  }

  function bootPlayer() {
    var video = one('#moviePlayer');
    var configNode = one('#player-config');
    if (!video || !configNode) {
      return;
    }
    var config;
    try {
      config = JSON.parse(configNode.textContent || '{}');
    } catch (error) {
      return;
    }
    var source = config.url;
    if (!source) {
      return;
    }
    var startButton = one('#playerStart');
    var attached = false;
    var hls = null;

    function attach() {
      if (attached) {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          maxBufferLength: 30,
          backBufferLength: 30
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      attached = true;
    }

    function begin() {
      attach();
      if (startButton) {
        startButton.classList.add('is-hidden');
      }
      video.controls = true;
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    if (startButton) {
      startButton.addEventListener('click', begin);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        begin();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    bootMenu();
    bootHero();
    bootFiltering();
    bootPlayer();
  });
})();
