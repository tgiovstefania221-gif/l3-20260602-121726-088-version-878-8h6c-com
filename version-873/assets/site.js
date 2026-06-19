document.addEventListener('DOMContentLoaded', function () {
  setupMobileMenu();
  setupHeroCarousel();
  setupFilters();
  setupPlayer();
  setupImageFallbacks();
  hydrateSearchQuery();
});

function setupMobileMenu() {
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');

  if (!toggle || !menu) {
    return;
  }

  toggle.addEventListener('click', function () {
    menu.classList.toggle('open');
  });
}

function setupHeroCarousel() {
  var hero = document.querySelector('[data-hero]');

  if (!hero) {
    return;
  }

  var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
  var prev = hero.querySelector('[data-hero-prev]');
  var next = hero.querySelector('[data-hero-next]');
  var current = 0;
  var timer = null;

  function show(index) {
    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
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
      timer = null;
    }
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      show(index);
      start();
    });
  });

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

  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);
  show(0);
  start();
}

function setupFilters() {
  var scopes = document.querySelectorAll('[data-filter-scope]');

  scopes.forEach(function (scope) {
    var input = scope.querySelector('[data-filter-input]');
    var select = scope.querySelector('[data-region-filter]');
    var count = scope.querySelector('[data-filter-count]');
    var results = document.querySelector('[data-filter-results]');

    if (!results) {
      return;
    }

    var cards = Array.prototype.slice.call(results.querySelectorAll('[data-search]'));

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var region = select ? select.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-search') || '').toLowerCase();
        var cardRegion = card.getAttribute('data-region') || '';
        var keywordMatched = !keyword || haystack.indexOf(keyword) !== -1;
        var regionMatched = !region || cardRegion === region;
        var shouldShow = keywordMatched && regionMatched;

        card.classList.toggle('hidden-by-filter', !shouldShow);

        if (shouldShow) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible + ' 部影片';
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    if (select) {
      select.addEventListener('change', applyFilter);
    }

    applyFilter();
  });
}

function hydrateSearchQuery() {
  var params = new URLSearchParams(window.location.search);
  var query = params.get('q');

  if (!query) {
    return;
  }

  var searchInput = document.querySelector('[data-filter-input]');

  if (searchInput) {
    searchInput.value = query;
    searchInput.dispatchEvent(new Event('input'));
  }
}

function setupPlayer() {
  var player = document.querySelector('.movie-player');
  var playButton = document.querySelector('[data-play-button]');

  if (!player || !playButton) {
    return;
  }

  var hlsSource = player.getAttribute('data-hls-source');
  var mp4Source = player.getAttribute('data-mp4-source');
  var initialized = false;

  function initializeSource() {
    if (initialized) {
      return;
    }

    initialized = true;

    if (hlsSource && player.canPlayType('application/vnd.apple.mpegurl')) {
      player.src = hlsSource;
      return;
    }

    if (window.Hls && window.Hls.isSupported() && hlsSource) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });

      hls.loadSource(hlsSource);
      hls.attachMedia(player);

      hls.on(window.Hls.Events.ERROR, function () {
        if (mp4Source) {
          player.src = mp4Source;
        }
      });

      return;
    }

    if (mp4Source) {
      player.src = mp4Source;
    }
  }

  playButton.addEventListener('click', function () {
    initializeSource();
    playButton.classList.add('hidden');

    var playPromise = player.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        playButton.classList.remove('hidden');
      });
    }
  });

  player.addEventListener('play', function () {
    playButton.classList.add('hidden');
  });

  player.addEventListener('pause', function () {
    if (!player.ended) {
      playButton.classList.remove('hidden');
    }
  });
}

function setupImageFallbacks() {
  var images = document.querySelectorAll('img');

  images.forEach(function (image) {
    image.addEventListener('error', function () {
      var parent = image.parentElement;

      if (parent) {
        parent.classList.add('image-missing');
      }
    }, { once: true });
  });
}
