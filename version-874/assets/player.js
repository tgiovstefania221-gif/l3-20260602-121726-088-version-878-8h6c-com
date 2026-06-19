(function () {
    function attachPlayer(panel) {
        var video = panel.querySelector('video');
        var button = panel.querySelector('[data-play-button]');

        if (!video || !button) {
            return;
        }

        var src = video.getAttribute('data-src');
        var started = false;

        function loadAndPlay() {
            if (!src) {
                return;
            }

            if (!started) {
                started = true;

                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                } else {
                    video.src = src;
                }
            }

            button.classList.add('hidden');
            video.controls = true;
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    button.classList.remove('hidden');
                });
            }
        }

        button.addEventListener('click', loadAndPlay);
        video.addEventListener('click', function () {
            if (video.paused) {
                loadAndPlay();
            }
        });
        video.addEventListener('play', function () {
            button.classList.add('hidden');
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(attachPlayer);
    });
}());
