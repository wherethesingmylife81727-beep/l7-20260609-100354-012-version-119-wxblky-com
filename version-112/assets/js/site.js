(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function setupNavigation() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var mobileNav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !mobileNav) {
            return;
        }
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    function setupHeroCarousel() {
        var root = document.querySelector('[data-hero-carousel]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        var prev = root.querySelector('[data-hero-prev]');
        var next = root.querySelector('[data-hero-next]');
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });
        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupCardFilters() {
        var searchInput = document.querySelector('[data-card-search]');
        var selects = Array.prototype.slice.call(document.querySelectorAll('[data-card-select]'));
        var lists = Array.prototype.slice.call(document.querySelectorAll('[data-filterable-list]'));
        if (!lists.length || (!searchInput && !selects.length)) {
            return;
        }
        var cards = [];
        lists.forEach(function (list) {
            cards = cards.concat(Array.prototype.slice.call(list.querySelectorAll('[data-search]')));
        });

        function apply() {
            var query = normalize(searchInput ? searchInput.value : '');
            var filters = {};
            selects.forEach(function (select) {
                filters[select.getAttribute('data-card-select')] = normalize(select.value);
            });
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-search'));
                var visible = !query || haystack.indexOf(query) !== -1;
                Object.keys(filters).forEach(function (key) {
                    var value = filters[key];
                    if (!value) {
                        return;
                    }
                    if (normalize(card.getAttribute('data-' + key)) !== value) {
                        visible = false;
                    }
                });
                card.classList.toggle('is-filter-hidden', !visible);
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', apply);
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q) {
                searchInput.value = q;
            }
        }
        selects.forEach(function (select) {
            select.addEventListener('change', apply);
        });
        apply();
    }

    ready(function () {
        setupNavigation();
        setupHeroCarousel();
        setupCardFilters();
    });
})();
