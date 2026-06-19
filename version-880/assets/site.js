(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function showSlide(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }

    function startSlider() {
      stopSlider();
      timer = window.setInterval(function () {
        showSlide(active + 1);
      }, 5000);
    }

    function stopSlider() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (slides.length) {
      showSlide(0);
      startSlider();
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(active - 1);
        startSlider();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(active + 1);
        startSlider();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
        startSlider();
      });
    });

    slider.addEventListener('mouseenter', stopSlider);
    slider.addEventListener('mouseleave', startSlider);
  }

  var filterRoot = document.querySelector('[data-filter-root]');

  if (filterRoot) {
    var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('.movie-card'));
    var keywordInput = document.querySelector('[data-filter-keyword]');
    var regionSelect = document.querySelector('[data-filter-region]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var params = new URLSearchParams(window.location.search);
    var initialKeyword = params.get('q') || '';

    if (keywordInput && initialKeyword) {
      keywordInput.value = initialKeyword;
    }

    function filterCards() {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
      var region = regionSelect ? regionSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-tags')).toLowerCase();
        var okKeyword = !keyword || text.indexOf(keyword) !== -1;
        var okRegion = !region || card.getAttribute('data-region') === region;
        var okYear = !year || card.getAttribute('data-year') === year;
        card.classList.toggle('hidden-card', !(okKeyword && okRegion && okYear));
      });
    }

    [keywordInput, regionSelect, yearSelect].forEach(function (element) {
      if (element) {
        element.addEventListener('input', filterCards);
        element.addEventListener('change', filterCards);
      }
    });

    filterCards();
  }
})();

function initMoviePlayer(config) {
  var video = document.getElementById(config.videoId);
  var button = document.getElementById(config.buttonId);
  var source = config.source;
  var loaded = false;

  if (!video || !source) {
    return;
  }

  function attachSource() {
    if (loaded) {
      return;
    }
    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function playVideo() {
    attachSource();
    if (button) {
      button.classList.add('is-hidden');
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener('click', playVideo);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    }
  });

  video.addEventListener('play', function () {
    if (button) {
      button.classList.add('is-hidden');
    }
  });
}
