(function () {
  var movies = window.MOVIE_SEARCH_DATA || [];
  var results = document.querySelector('[data-search-results]');
  var count = document.querySelector('[data-search-count]');
  var pageInput = document.querySelector('[data-search-input]');
  var liveInput = document.querySelector('[data-live-search]');
  var categorySelect = document.querySelector('[data-search-category]');
  var yearSelect = document.querySelector('[data-search-year]');

  if (!results) {
    return;
  }

  function params() {
    return new URLSearchParams(window.location.search);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function yearMatches(movieYear, filterYear) {
    var year = parseInt(movieYear, 10) || 0;
    if (!filterYear) {
      return true;
    }
    if (filterYear === '2025' || filterYear === '2024' || filterYear === '2023') {
      return String(year) === filterYear;
    }
    if (filterYear === '2020') {
      return year >= 2020;
    }
    if (filterYear === '2010') {
      return year >= 2010;
    }
    return true;
  }

  function card(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '  <a class="movie-poster" href="detail/' + movie.id + '.html">',
      '    <span class="poster-frame" data-cover="' + escapeHtml(movie.cover) + '">',
      '      <img class="poster-img" src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="window.handleCoverError && window.handleCoverError(this);">',
      '    </span>',
      '    <span class="poster-badge">' + escapeHtml(movie.year) + '</span>',
      '    <span class="poster-play">播放</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <h2 class="movie-title"><a href="detail/' + movie.id + '.html">' + escapeHtml(movie.title) + '</a></h2>',
      '    <p class="movie-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.genre) + '</p>',
      '    <p class="movie-line">' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function render() {
    var query = normalize(liveInput && liveInput.value);
    var category = categorySelect ? categorySelect.value : '';
    var year = yearSelect ? yearSelect.value : '';
    var filtered = movies.filter(function (movie) {
      var haystack = normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.genre,
        movie.category,
        movie.year,
        movie.tags.join(' '),
        movie.oneLine
      ].join(' '));
      var queryMatch = !query || haystack.indexOf(query) >= 0;
      var categoryMatch = !category || movie.category === category;
      return queryMatch && categoryMatch && yearMatches(movie.year, year);
    });
    results.innerHTML = filtered.slice(0, 240).map(card).join('');
    count.textContent = '找到 ' + filtered.length + ' 部影片，当前显示前 ' + Math.min(filtered.length, 240) + ' 部。';
  }

  var initialQuery = params().get('q') || '';
  var initialYear = params().get('year') || '';
  if (pageInput) {
    pageInput.value = initialQuery;
  }
  if (liveInput) {
    liveInput.value = initialQuery;
    liveInput.addEventListener('input', render);
  }
  if (yearSelect) {
    yearSelect.value = initialYear;
    yearSelect.addEventListener('change', render);
  }
  if (categorySelect) {
    categorySelect.addEventListener('change', render);
  }
  render();
})();
