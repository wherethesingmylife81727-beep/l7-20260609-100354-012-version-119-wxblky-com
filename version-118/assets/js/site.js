(function () {
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    var setSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    };

    var start = function () {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        setSlide(current + 1);
      }, 5200);
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-hero-dot'));
        setSlide(index);
        start();
      });
    });

    start();
  }

  var searchInput = document.querySelector('[data-site-search]');
  var clearSearch = document.querySelector('[data-clear-search]');
  var searchCards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var activeFilter = 'all';

  var normalize = function (value) {
    return String(value || '').toLowerCase().trim();
  };

  var applyFilters = function () {
    var keyword = searchInput ? normalize(searchInput.value) : '';

    searchCards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags'),
        card.textContent
      ].join(' '));
      var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchFilter = activeFilter === 'all' || haystack.indexOf(normalize(activeFilter)) !== -1;
      card.classList.toggle('is-hidden', !(matchKeyword && matchFilter));
    });
  };

  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q) {
      searchInput.value = q;
    }

    searchInput.addEventListener('input', applyFilters);
    applyFilters();
  }

  if (clearSearch) {
    clearSearch.addEventListener('click', function () {
      if (searchInput) {
        searchInput.value = '';
      }
      activeFilter = 'all';
      filterButtons.forEach(function (button) {
        button.classList.toggle('active', button.getAttribute('data-filter') === 'all');
      });
      applyFilters();
    });
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = button.getAttribute('data-filter') || 'all';
      filterButtons.forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      applyFilters();
    });
  });

  var videoBoxes = Array.prototype.slice.call(document.querySelectorAll('[data-video-box]'));

  videoBoxes.forEach(function (box) {
    var video = box.querySelector('video[data-stream]');
    var startButton = box.querySelector('[data-video-start]');
    var hlsInstance = null;
    var ready = false;

    var bindStream = function () {
      if (!video || ready) {
        return;
      }

      var stream = video.getAttribute('data-stream');

      if (!stream) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        ready = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        ready = true;
        return;
      }

      video.src = stream;
      ready = true;
    };

    var play = function () {
      if (!video) {
        return;
      }

      bindStream();
      box.classList.add('is-playing');
      var promise = video.play();

      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    };

    if (startButton) {
      startButton.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });

      video.addEventListener('play', function () {
        box.classList.add('is-playing');
      });

      video.addEventListener('ended', function () {
        box.classList.remove('is-playing');
      });
    }

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
