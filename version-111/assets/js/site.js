(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    ready(function () {
        document.querySelectorAll("img").forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("image-missing");
                image.removeAttribute("src");
            });
        });

        var menuButton = document.querySelector("[data-menu-button]");
        var mobileMenu = document.querySelector("[data-mobile-menu]");
        if (menuButton && mobileMenu) {
            menuButton.addEventListener("click", function () {
                mobileMenu.classList.toggle("open");
            });
        }

        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                var target = form.getAttribute("data-search-target") || form.getAttribute("action") || "search.html";
                var value = input ? input.value.trim() : "";
                if (value) {
                    event.preventDefault();
                    window.location.href = target + "?q=" + encodeURIComponent(value);
                }
            });
        });

        var carousel = document.querySelector("[data-hero-carousel]");
        if (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
            var index = 0;
            var timer = null;
            var show = function (nextIndex) {
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("active", dotIndex === index);
                });
            };
            var start = function () {
                if (timer) {
                    clearInterval(timer);
                }
                timer = setInterval(function () {
                    show(index + 1);
                }, 5200);
            };
            var previous = carousel.querySelector("[data-hero-prev]");
            var next = carousel.querySelector("[data-hero-next]");
            if (previous) {
                previous.addEventListener("click", function () {
                    show(index - 1);
                    start();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    show(index + 1);
                    start();
                });
            }
            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    show(dotIndex);
                    start();
                });
            });
            if (slides.length > 1) {
                start();
            }
        }

        var grid = document.querySelector("[data-sortable-grid]");
        var filterInput = document.querySelector("[data-filter-input]");
        var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll(".movie-card")) : [];
        var applyFilter = function () {
            if (!grid || !filterInput) {
                return;
            }
            var keyword = normalize(filterInput.value);
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-search"));
                var title = normalize(card.getAttribute("data-title"));
                var matched = !keyword || text.indexOf(keyword) !== -1 || title.indexOf(keyword) !== -1;
                card.classList.toggle("hidden-card", !matched);
            });
        };
        if (filterInput) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");
            if (query && filterInput.hasAttribute("data-query-input")) {
                filterInput.value = query;
            }
            filterInput.addEventListener("input", applyFilter);
            applyFilter();
        }

        document.querySelectorAll("[data-sort]").forEach(function (button) {
            button.addEventListener("click", function () {
                if (!grid) {
                    return;
                }
                var key = button.getAttribute("data-sort");
                document.querySelectorAll("[data-sort]").forEach(function (other) {
                    other.classList.toggle("active", other === button);
                });
                cards.sort(function (a, b) {
                    if (key === "title") {
                        return normalize(a.getAttribute("data-title")).localeCompare(normalize(b.getAttribute("data-title")), "zh-Hans-CN");
                    }
                    return Number(b.getAttribute("data-" + key) || 0) - Number(a.getAttribute("data-" + key) || 0);
                });
                cards.forEach(function (card) {
                    grid.appendChild(card);
                });
                applyFilter();
            });
        });

        document.querySelectorAll("[data-like-button]").forEach(function (button) {
            button.addEventListener("click", function () {
                var key = "like:" + window.location.pathname;
                var liked = localStorage.getItem(key) === "1";
                localStorage.setItem(key, liked ? "0" : "1");
                button.classList.toggle("active", !liked);
            });
        });

        document.querySelectorAll("[data-favorite-button]").forEach(function (button) {
            button.addEventListener("click", function () {
                var key = "favorite:" + window.location.pathname;
                var saved = localStorage.getItem(key) === "1";
                localStorage.setItem(key, saved ? "0" : "1");
                button.classList.toggle("active", !saved);
                button.textContent = saved ? "收藏" : "已收藏";
            });
        });
    });
})();
