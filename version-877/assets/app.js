(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function initNavigation() {
        var button = document.querySelector("[data-nav-toggle]");
        var panel = document.querySelector("[data-nav-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            document.body.classList.toggle("nav-open");
        });
        panel.addEventListener("click", function (event) {
            if (event.target.tagName === "A") {
                document.body.classList.remove("nav-open");
            }
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
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
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
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
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var input = panel.querySelector("[data-search-input]");
            var year = panel.querySelector("[data-year-filter]");
            var type = panel.querySelector("[data-type-filter]");
            var list = panel.parentElement.querySelector("[data-card-list]") || document;
            var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
            var params = new URLSearchParams(window.location.search);
            var firstQuery = params.get("q");
            if (input && firstQuery) {
                input.value = firstQuery;
            }

            function apply() {
                var query = normalize(input ? input.value : "");
                var yearValue = normalize(year ? year.value : "");
                var typeValue = normalize(type ? type.value : "");
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-category")
                    ].join(" "));
                    var matchQuery = !query || haystack.indexOf(query) !== -1;
                    var matchYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
                    var matchType = !typeValue || normalize(card.getAttribute("data-type")).indexOf(typeValue) !== -1;
                    card.hidden = !(matchQuery && matchYear && matchType);
                });
            }

            [input, year, type].forEach(function (element) {
                if (element) {
                    element.addEventListener("input", apply);
                    element.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    window.setupPlayer = function (videoId, overlayId, sourceUrl) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        if (!video) {
            return;
        }
        var loaded = false;
        var player = null;

        function load() {
            if (loaded) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                player = new window.Hls({
                    maxBufferLength: 30,
                    enableWorker: true
                });
                player.loadSource(sourceUrl);
                player.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
            loaded = true;
        }

        function play() {
            load();
            video.controls = true;
            if (overlay) {
                overlay.classList.add("hidden");
            }
            var result = video.play();
            if (result && result.catch) {
                result.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (player) {
                player.destroy();
            }
        });
    };

    ready(function () {
        initNavigation();
        initHero();
        initFilters();
    });
})();
