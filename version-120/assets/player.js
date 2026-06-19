(function () {
  function loadHls(video, src, message) {
    if (!src) {
      message.textContent = '当前影片缺少播放源。';
      return Promise.reject(new Error('missing source'));
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          message.textContent = '视频加载失败，请刷新页面或稍后再试。';
          try {
            hls.destroy();
          } catch (error) {
            console.warn(error);
          }
        }
      });
      return new Promise(function (resolve) {
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
      });
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      return Promise.resolve();
    }

    message.textContent = '当前浏览器不支持 HLS 播放。';
    return Promise.reject(new Error('hls unsupported'));
  }

  function setupPlayer(shell) {
    var video = shell.querySelector('video[data-video-src]');
    var button = shell.querySelector('[data-play-button]');
    var message = shell.querySelector('[data-player-message]');
    var hasLoaded = false;

    if (!video || !button || !message) {
      return;
    }

    button.addEventListener('click', function () {
      if (hasLoaded) {
        video.play();
        button.classList.add('is-hidden');
        return;
      }

      message.textContent = '正在加载播放源…';
      loadHls(video, video.getAttribute('data-video-src'), message)
        .then(function () {
          hasLoaded = true;
          message.textContent = '';
          button.classList.add('is-hidden');
          return video.play();
        })
        .catch(function (error) {
          console.warn(error);
          button.classList.remove('is-hidden');
        });
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        button.classList.remove('is-hidden');
      }
    });

    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });
  }

  document.querySelectorAll('[data-player]').forEach(setupPlayer);
})();
