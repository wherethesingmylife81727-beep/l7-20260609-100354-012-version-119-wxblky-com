(function () {
  function setupMobileMenu() {
    var button = document.querySelector('[data-mobile-menu-button]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupCardFilters() {
    var grid = document.querySelector('[data-card-grid]');
    if (!grid) {
      return;
    }
    var input = document.querySelector('[data-card-filter]');
    var yearSelect = document.querySelector('[data-year-filter]');
    var cards = Array.prototype.slice.call(grid.children);

    function applyFilter() {
      var query = normalize(input && input.value);
      var yearValue = yearSelect ? yearSelect.value : '';
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.textContent
        ].join(' '));
        var cardYear = parseInt(card.getAttribute('data-year'), 10) || 0;
        var queryMatch = !query || haystack.indexOf(query) >= 0;
        var yearMatch = true;
        if (yearValue === '2025' || yearValue === '2024' || yearValue === '2023') {
          yearMatch = String(cardYear) === yearValue;
        } else if (yearValue === '2020') {
          yearMatch = cardYear >= 2020;
        } else if (yearValue === '2010') {
          yearMatch = cardYear >= 2010;
        }
        card.classList.toggle('is-filtered-out', !(queryMatch && yearMatch));
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilter);
    }
  }

  window.handleCoverError = function (image) {
    var frame = image.closest('.poster-frame');
    if (frame) {
      frame.classList.add('poster-missing');
    }
    image.removeAttribute('src');
    image.style.display = 'none';
  };

  setupMobileMenu();
  setupCardFilters();
})();
