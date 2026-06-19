(function () {
    var header = document.querySelector('.site-header');
    var menuButton = document.querySelector('.menu-toggle');

    if (header && menuButton) {
        menuButton.addEventListener('click', function () {
            header.classList.toggle('open');
        });
    }

    document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
        var current = Math.max(0, slides.findIndex(function (slide) {
            return slide.classList.contains('active');
        }));
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        var prev = carousel.querySelector('[data-prev]');
        var next = carousel.querySelector('[data-next]');

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-go')) || 0);
                start();
            });
        });

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        show(current);
        start();
    });

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initFilters() {
        var input = document.querySelector('[data-filter-input]');
        var select = document.querySelector('[data-filter-select="type"]');
        var list = document.querySelector('.filter-list');
        var empty = document.querySelector('.empty-state');

        if (!list || (!input && !select)) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');
        if (input && initialQuery) {
            input.value = initialQuery;
        }

        function apply() {
            var query = normalize(input ? input.value : '');
            var type = normalize(select ? select.value : '');
            var items = Array.prototype.slice.call(list.children);
            var visible = 0;

            items.forEach(function (item) {
                var haystack = normalize([
                    item.getAttribute('data-title'),
                    item.getAttribute('data-region'),
                    item.getAttribute('data-year'),
                    item.getAttribute('data-type'),
                    item.getAttribute('data-genre'),
                    item.textContent
                ].join(' '));
                var itemType = normalize(item.getAttribute('data-type'));
                var matched = (!query || haystack.indexOf(query) !== -1) && (!type || itemType.indexOf(type) !== -1);
                item.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        if (input) {
            input.addEventListener('input', apply);
        }

        if (select) {
            select.addEventListener('change', apply);
        }

        apply();
    }

    initFilters();

    document.querySelectorAll('[data-scroll-player]').forEach(function (link) {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            var player = document.querySelector('.player-card');
            if (player) {
                player.scrollIntoView({ behavior: 'smooth', block: 'center' });
                var button = player.querySelector('.player-start');
                if (button) {
                    button.click();
                }
            }
        });
    });

    document.querySelectorAll('.player-card').forEach(function (card) {
        var video = card.querySelector('video');
        var button = card.querySelector('.player-start');
        var loaded = false;
        var hls = null;

        if (!video || !button) {
            return;
        }

        function attach() {
            if (loaded) {
                return Promise.resolve();
            }
            loaded = true;
            var src = video.getAttribute('data-hls');

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(src);
                hls.attachMedia(video);
                return Promise.resolve();
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
                return Promise.resolve();
            }

            video.src = src;
            return Promise.resolve();
        }

        function play() {
            attach().then(function () {
                var result = video.play();
                if (result && typeof result.catch === 'function') {
                    result.catch(function () {});
                }
                card.classList.add('playing');
            });
        }

        button.addEventListener('click', play);
        video.addEventListener('play', function () {
            card.classList.add('playing');
        });
        video.addEventListener('pause', function () {
            card.classList.remove('playing');
        });
        video.addEventListener('ended', function () {
            card.classList.remove('playing');
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    });
})();
