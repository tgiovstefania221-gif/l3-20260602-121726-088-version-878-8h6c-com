(function () {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mainNav = document.querySelector('[data-main-nav]');

    if (menuButton && mainNav) {
        menuButton.addEventListener('click', function () {
            mainNav.classList.toggle('open');
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let index = 0;
        let timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                restart();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
                restart();
            });
        });

        showSlide(0);
        restart();
    }

    const filterScope = document.querySelector('[data-filter-scope]');

    if (filterScope) {
        const searchInput = filterScope.querySelector('[data-local-search]');
        const sortSelect = filterScope.querySelector('[data-sort-select]');
        const categorySelect = filterScope.querySelector('[data-category-select]');
        const regionSelect = filterScope.querySelector('[data-region-select]');
        const regionButtons = Array.from(filterScope.querySelectorAll('[data-filter-region]'));
        const list = document.querySelector('[data-card-list]');
        const count = document.querySelector('[data-result-count]');
        const params = new URLSearchParams(window.location.search);
        let activeRegion = '';

        if (searchInput && params.get('q')) {
            searchInput.value = params.get('q');
        }

        regionButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeRegion = button.getAttribute('data-filter-region') || '';
                regionButtons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                applyFilters();
            });
        });

        [searchInput, sortSelect, categorySelect, regionSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        function applyFilters() {
            if (!list) {
                return;
            }

            const cards = Array.from(list.querySelectorAll('.movie-card'));
            const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
            const selectedCategory = categorySelect ? categorySelect.value : '';
            const selectedRegion = regionSelect ? regionSelect.value : activeRegion;
            let visibleCards = [];

            cards.forEach(function (card) {
                const text = (card.getAttribute('data-text') || '').toLowerCase();
                const title = (card.getAttribute('data-title') || '').toLowerCase();
                const category = card.getAttribute('data-category') || '';
                const region = card.getAttribute('data-region') || '';
                const matchQuery = !query || text.indexOf(query) >= 0 || title.indexOf(query) >= 0;
                const matchCategory = !selectedCategory || category === selectedCategory;
                const matchRegion = !selectedRegion || region === selectedRegion;
                const visible = matchQuery && matchCategory && matchRegion;

                card.classList.toggle('is-hidden', !visible);

                if (visible) {
                    visibleCards.push(card);
                }
            });

            sortCards(visibleCards);

            if (count) {
                count.textContent = String(visibleCards.length);
            }
        }

        function sortCards(cards) {
            if (!list || !sortSelect) {
                return;
            }

            const value = sortSelect.value;
            const sorted = cards.slice();

            if (value === 'year-desc') {
                sorted.sort(function (a, b) {
                    return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
                });
            }

            if (value === 'year-asc') {
                sorted.sort(function (a, b) {
                    return Number(a.getAttribute('data-year')) - Number(b.getAttribute('data-year'));
                });
            }

            if (value === 'title') {
                sorted.sort(function (a, b) {
                    return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
                });
            }

            sorted.forEach(function (card) {
                list.appendChild(card);
            });
        }

        applyFilters();
    }

    const players = document.querySelectorAll('[data-player]');

    players.forEach(function (box) {
        const video = box.querySelector('video');
        const start = box.querySelector('[data-player-start]');
        const src = box.getAttribute('data-src');
        let initialized = false;

        function initializePlayer() {
            if (!video || !src || initialized) {
                return;
            }

            initialized = true;

            if (window.Hls && window.Hls.isSupported()) {
                const hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(src);
                hls.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
            } else {
                video.src = src;
            }
        }

        if (start) {
            start.addEventListener('click', function () {
                initializePlayer();
                box.classList.add('is-playing');
                video.play().catch(function () {
                    video.setAttribute('controls', 'controls');
                });
            });
        }

        if (video) {
            video.addEventListener('play', function () {
                box.classList.add('is-playing');
            });
        }
    });
}());
