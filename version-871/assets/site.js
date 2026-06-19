(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('.hero');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var active = 0;
        var timer;

        function showSlide(index) {
            active = index;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function startHero() {
            timer = window.setInterval(function () {
                showSlide((active + 1) % slides.length);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                showSlide(index);
                startHero();
            });
        });

        if (slides.length > 1) {
            showSlide(0);
            startHero();
        }
    }

    var filterForms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
    filterForms.forEach(function (form) {
        var scopeSelector = form.getAttribute('data-filter-scope');
        var scope = document.querySelector(scopeSelector);
        if (!scope) {
            return;
        }
        var input = form.querySelector('[data-filter-text]');
        var year = form.querySelector('[data-filter-year]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
        var empty = document.querySelector('[data-empty-result]');

        function applyFilter() {
            var q = input ? input.value.trim().toLowerCase() : '';
            var y = year ? year.value : '';
            var shown = 0;
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-category')
                ].join(' ').toLowerCase();
                var okText = !q || haystack.indexOf(q) !== -1;
                var okYear = !y || card.getAttribute('data-year') === y;
                var visible = okText && okYear;
                card.style.display = visible ? '' : 'none';
                if (visible) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.style.display = shown ? 'none' : 'block';
            }
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }
        if (year) {
            year.addEventListener('change', applyFilter);
        }

        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q && input) {
            input.value = q;
            applyFilter();
        }
    });
})();

function initMoviePlayer(videoId, buttonId, streamUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var shell = document.querySelector('[data-player-shell="' + videoId + '"]');
    var loaded = false;
    var hlsInstance = null;

    if (!video || !button || !shell) {
        return;
    }

    function loadStream() {
        if (loaded) {
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({ enableWorker: true });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
        loaded = true;
    }

    function startPlayback() {
        loadStream();
        shell.classList.add('is-playing');
        video.controls = true;
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    }

    button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        startPlayback();
    });

    shell.addEventListener('click', function (event) {
        if (!shell.classList.contains('is-playing')) {
            startPlayback();
        }
    });

    video.addEventListener('play', function () {
        shell.classList.add('is-playing');
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
