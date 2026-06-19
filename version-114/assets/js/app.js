(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
            return;
        }
        fn();
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initSearchForms() {
        var forms = document.querySelectorAll("[data-search-form]");
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                var value = input ? input.value.trim() : "";
                if (!value) {
                    event.preventDefault();
                    window.location.href = "./search.html";
                    return;
                }
                input.value = value;
            });
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle("is-active", current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle("is-active", current === index);
            });
        }

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, current) {
            dot.addEventListener("click", function () {
                show(current);
                start();
            });
        });

        hero.addEventListener("mouseenter", function () {
            window.clearInterval(timer);
        });

        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function getText(card) {
        return [
            card.getAttribute("data-title"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year")
        ].join(" ").toLowerCase();
    }

    function filterCards(value, scope) {
        var query = value.trim().toLowerCase();
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-title]"));
        var visible = 0;
        cards.forEach(function (card) {
            var matched = !query || getText(card).indexOf(query) !== -1;
            card.classList.toggle("is-hidden-card", !matched);
            if (matched) {
                visible += 1;
            }
        });
        var empty = scope.querySelector("[data-empty-state]");
        if (empty) {
            empty.classList.toggle("is-visible", visible === 0);
        }
    }

    function initFilters() {
        var scopes = document.querySelectorAll("[data-filter-scope]");
        scopes.forEach(function (scope) {
            var input = scope.querySelector("[data-card-filter]");
            if (!input) {
                return;
            }
            input.addEventListener("input", function () {
                filterCards(input.value, scope);
            });
        });

        var searchScope = document.querySelector("[data-search-scope]");
        if (searchScope) {
            var searchInput = searchScope.querySelector("[data-card-filter]");
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q") || "";
            if (searchInput) {
                searchInput.value = q;
                filterCards(q, searchScope);
                searchInput.addEventListener("input", function () {
                    filterCards(searchInput.value, searchScope);
                });
            }
        }
    }

    function initChipFilters() {
        var chips = document.querySelectorAll("[data-chip-filter]");
        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                var scope = chip.closest("[data-filter-scope]");
                var input = scope ? scope.querySelector("[data-card-filter]") : null;
                if (!scope || !input) {
                    return;
                }
                var value = chip.getAttribute("data-chip-filter") || "";
                input.value = value;
                scope.querySelectorAll("[data-chip-filter]").forEach(function (item) {
                    item.classList.toggle("is-active", item === chip);
                });
                filterCards(value, scope);
            });
        });
    }

    function initPlayers() {
        var players = document.querySelectorAll("[data-player]");
        players.forEach(function (shell) {
            var video = shell.querySelector("video");
            var overlay = shell.querySelector("[data-play-overlay]");
            var state = shell.querySelector("[data-player-state]");
            if (!video || !overlay) {
                return;
            }
            var stream = video.getAttribute("data-video-url") || "";
            var started = false;

            function setState(message) {
                if (state) {
                    state.textContent = message;
                }
            }

            function play() {
                if (!stream) {
                    setState("播放暂时不可用");
                    return;
                }
                overlay.classList.add("is-hidden");
                setState("正在加载高清内容...");
                if (!started) {
                    started = true;
                    if (window.Hls && window.Hls.isSupported()) {
                        var hls = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true,
                            backBufferLength: 90
                        });
                        hls.loadSource(stream);
                        hls.attachMedia(video);
                        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            video.play().catch(function () {
                                setState("点击视频画面继续播放");
                            });
                        });
                        hls.on(window.Hls.Events.ERROR, function (event, data) {
                            if (data && data.fatal) {
                                setState("播放连接异常，请稍后重试");
                            }
                        });
                    } else {
                        video.src = stream;
                        video.addEventListener("loadedmetadata", function () {
                            video.play().catch(function () {
                                setState("点击视频画面继续播放");
                            });
                        }, { once: true });
                    }
                } else {
                    video.play().catch(function () {
                        setState("点击视频画面继续播放");
                    });
                }
            }

            overlay.addEventListener("click", play);
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener("playing", function () {
                setState("正在播放");
            });
            video.addEventListener("pause", function () {
                if (started) {
                    setState("已暂停");
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initSearchForms();
        initHero();
        initFilters();
        initChipFilters();
        initPlayers();
    });
})();
