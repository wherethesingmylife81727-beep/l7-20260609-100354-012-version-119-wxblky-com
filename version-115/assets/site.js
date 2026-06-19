const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function setupMobileNav() {
    const toggle = $('[data-mobile-nav-toggle]');
    const nav = $('[data-mobile-nav]');
    if (!toggle || !nav) {
        return;
    }
    toggle.addEventListener('click', () => {
        nav.classList.toggle('is-open');
    });
}

function setupHeroSlider() {
    const slider = $('[data-hero-slider]');
    if (!slider) {
        return;
    }

    const slides = $$('[data-hero-slide]', slider);
    const dots = $$('[data-hero-dot]', slider);
    const prev = $('[data-hero-prev]', slider);
    const next = $('[data-hero-next]', slider);
    let current = 0;
    let timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    function startTimer() {
        stopTimer();
        timer = window.setInterval(() => showSlide(current + 1), 5000);
    }

    function stopTimer() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    prev?.addEventListener('click', () => {
        showSlide(current - 1);
        startTimer();
    });

    next?.addEventListener('click', () => {
        showSlide(current + 1);
        startTimer();
    });

    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            showSlide(Number(dot.dataset.heroDot || 0));
            startTimer();
        });
    });

    slider.addEventListener('mouseenter', stopTimer);
    slider.addEventListener('mouseleave', startTimer);
    showSlide(0);
    startTimer();
}

function normalizeText(value) {
    return String(value || '').toLowerCase().trim();
}

function setupFilters() {
    const lists = $$('[data-filter-list]');
    if (!lists.length) {
        return;
    }

    const inputs = $$('[data-filter-input]');
    const selects = $$('[data-filter-select]');
    const sortSelects = $$('[data-sort-select]');

    function currentQuery() {
        return normalizeText(inputs.map((input) => input.value).find(Boolean) || '');
    }

    function currentFilter(name) {
        const select = selects.find((item) => item.dataset.filterSelect === name);
        return normalizeText(select ? select.value : '');
    }

    function activeSort() {
        const select = sortSelects.find((item) => item.value);
        return select ? select.value : 'default';
    }

    function cardText(card) {
        return normalizeText([
            card.dataset.title,
            card.dataset.region,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.category,
            card.textContent,
        ].join(' '));
    }

    function sortCards(list, cards) {
        const sort = activeSort();
        const sorted = cards.slice();
        if (sort === 'year-desc') {
            sorted.sort((a, b) => Number(b.dataset.year || 0) - Number(a.dataset.year || 0));
        }
        if (sort === 'rating-desc') {
            sorted.sort((a, b) => Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0));
        }
        if (sort === 'views-desc') {
            sorted.sort((a, b) => Number(b.dataset.views || 0) - Number(a.dataset.views || 0));
        }
        sorted.forEach((card) => list.appendChild(card));
    }

    function applyFilters() {
        const query = currentQuery();
        const year = currentFilter('year');
        const category = currentFilter('category');

        lists.forEach((list) => {
            const cards = $$('[data-movie-card]', list);
            let visibleCount = 0;

            cards.forEach((card) => {
                const matchesQuery = !query || cardText(card).includes(query);
                const matchesYear = !year || normalizeText(card.dataset.year) === year;
                const matchesCategory = !category || normalizeText(card.dataset.category) === category;
                const visible = matchesQuery && matchesYear && matchesCategory;
                card.hidden = !visible;
                if (visible) {
                    visibleCount += 1;
                }
            });

            sortCards(list, cards);

            const empty = $('[data-filter-empty]');
            if (empty) {
                empty.hidden = visibleCount !== 0;
            }
        });
    }

    [...inputs, ...selects, ...sortSelects].forEach((control) => {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
    });
}

async function setupVideoPlayer() {
    const video = $('[data-video-player]');
    const startButton = $('[data-player-start]');
    const message = $('[data-player-message]');

    if (!video || !startButton) {
        return;
    }

    let initialized = false;

    function showMessage(text) {
        if (!message) {
            return;
        }
        message.textContent = text;
        message.hidden = false;
    }

    async function initialize() {
        if (initialized) {
            return;
        }
        initialized = true;
        const source = video.dataset.videoSrc;
        if (!source) {
            showMessage('当前影片暂无可用播放源');
            return;
        }

        try {
            const { H: Hls } = await import('./video-player.js');
            if (Hls && Hls.isSupported()) {
                const hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(Hls.Events.ERROR, (_event, data) => {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        showMessage('网络加载异常，正在尝试重新连接');
                        hls.startLoad();
                    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        showMessage('媒体解码异常，正在尝试恢复播放');
                        hls.recoverMediaError();
                    } else {
                        showMessage('播放器初始化失败，请刷新页面重试');
                        hls.destroy();
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                showMessage('当前浏览器不支持 HLS 播放');
            }
        } catch (error) {
            video.src = source;
            showMessage('播放器模块加载失败，已切换为浏览器原生播放模式');
        }
    }

    startButton.addEventListener('click', async () => {
        await initialize();
        startButton.classList.add('is-hidden');
        try {
            await video.play();
        } catch (error) {
            showMessage('请再次点击播放器中的播放按钮开始观看');
        }
    });
}

setupMobileNav();
setupHeroSlider();
setupFilters();
setupVideoPlayer();
