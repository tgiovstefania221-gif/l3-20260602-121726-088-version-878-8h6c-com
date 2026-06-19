(function() {
    const menuButton = document.querySelector("[data-menu-button]");
    const mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function() {
            mobileNav.classList.toggle("is-open");
        });
    }

    const hero = document.querySelector("[data-hero]");

    if (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        const prev = hero.querySelector("[data-hero-prev]");
        const next = hero.querySelector("[data-hero-next]");
        let current = 0;
        let timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function play() {
            window.clearInterval(timer);
            timer = window.setInterval(function() {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function(dot) {
            dot.addEventListener("click", function() {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                play();
            });
        });

        if (prev) {
            prev.addEventListener("click", function() {
                showSlide(current - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener("click", function() {
                showSlide(current + 1);
                play();
            });
        }

        showSlide(0);
        play();
    }

    const lists = Array.from(document.querySelectorAll("[data-card-list]"));

    lists.forEach(function(list) {
        const scope = list.closest(".content-section") || document;
        const searchInput = scope.querySelector("[data-card-search]");
        const yearSelect = scope.querySelector("[data-year-filter]");
        const cards = Array.from(list.querySelectorAll(".movie-card"));

        function applyFilters() {
            const keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
            const year = yearSelect ? yearSelect.value : "";

            cards.forEach(function(card) {
                const text = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags")
                ].join(" ").toLowerCase();
                const cardYear = card.getAttribute("data-year") || "";
                const visible = (!keyword || text.indexOf(keyword) !== -1) && (!year || cardYear === year);
                card.classList.toggle("is-filtered-out", !visible);
            });
        }

        if (searchInput) {
            searchInput.addEventListener("input", applyFilters);
            const params = new URLSearchParams(window.location.search);
            const query = params.get("q");
            if (query) {
                searchInput.value = query;
                applyFilters();
            }
        }

        if (yearSelect) {
            yearSelect.addEventListener("change", applyFilters);
        }
    });
})();
