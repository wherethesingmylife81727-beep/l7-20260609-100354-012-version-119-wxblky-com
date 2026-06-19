(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");
    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var show = function (index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === current);
        });
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
        });
      });
      if (slides.length > 1) {
        window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }
    }

    var filterInput = document.querySelector("[data-filter-input]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var typeFilter = document.querySelector("[data-type-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-search]"));
    var params = new URLSearchParams(window.location.search);
    if (filterInput && params.get("q")) {
      filterInput.value = params.get("q");
    }
    var applyFilters = function () {
      var keyword = normalize(filterInput && filterInput.value);
      var year = yearFilter ? yearFilter.value : "";
      var type = typeFilter ? typeFilter.value : "";
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var okKeyword = !keyword || text.indexOf(keyword) !== -1;
        var okYear = !year || card.getAttribute("data-year") === year;
        var okType = !type || card.getAttribute("data-type") === type;
        card.classList.toggle("is-hidden-card", !(okKeyword && okYear && okType));
      });
    };
    [filterInput, yearFilter, typeFilter].forEach(function (item) {
      if (item) {
        item.addEventListener("input", applyFilters);
        item.addEventListener("change", applyFilters);
      }
    });
    if (cards.length) {
      applyFilters();
    }
  });

  window.initMoviePlayer = function (streamUrl) {
    var root = document.querySelector(".player-shell");
    if (!root) {
      return;
    }
    var video = root.querySelector("video");
    var trigger = root.querySelector(".play-overlay");
    var loaded = false;
    var hlsInstance = null;
    var start = function () {
      if (!video || !streamUrl) {
        return;
      }
      if (!loaded) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new Hls({ enableWorker: true });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
        loaded = true;
      }
      if (trigger) {
        trigger.classList.add("is-hidden");
      }
      var playResult = video.play();
      if (playResult && playResult.catch) {
        playResult.catch(function () {
          if (trigger) {
            trigger.classList.remove("is-hidden");
          }
        });
      }
    };
    if (trigger) {
      trigger.addEventListener("click", start);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (!loaded || video.paused) {
          start();
        }
      });
    }
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
