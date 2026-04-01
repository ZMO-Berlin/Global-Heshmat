// ════════════════════════════════════════════════════════════════
// Gallery & Lightbox Module
// Provides in-sidebar gallery with thumbnails and full-screen
// lightbox viewer. No external dependencies.
//
// USAGE (called automatically by app.js):
//   Gallery.render(images)     → returns HTML string for sidebar
//   Gallery.openLightbox(idx)  → opens full-screen viewer at index
//   Gallery.closeLightbox()    → closes viewer
// ════════════════════════════════════════════════════════════════

const Gallery = (function () {

  let _images = [];   // current image set: [{src, caption}]
  let _current = 0;   // active index

  // ── Sidebar gallery HTML ──
  function render(images) {
    if (!images || images.length === 0) return '';
    _images = images;
    _current = 0;

    const single = images.length === 1;

    let html = '<div class="gallery">';

    // Main image
    html += '<div class="gallery-main" onclick="Gallery.openLightbox(' + _current + ')">'
      + '<img id="gallery-main-img" src="images/' + images[0].src + '" alt="" '
      + 'onerror="this.style.display=\'none\'" />';

    // Counter badge (only for multi-image)
    if (!single) {
      html += '<div class="gallery-counter">'
        + '<span id="gallery-counter-text">1 / ' + images.length + '</span>'
        + '</div>';

      // Prev / next arrows on main image
      html += '<button class="gallery-arrow gallery-arrow-prev" onclick="event.stopPropagation(); Gallery.prev()" aria-label="Previous image">'
        + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>'
        + '</button>';
      html += '<button class="gallery-arrow gallery-arrow-next" onclick="event.stopPropagation(); Gallery.next()" aria-label="Next image">'
        + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>'
        + '</button>';
    }

    // Expand icon
    html += '<button class="gallery-expand" onclick="event.stopPropagation(); Gallery.openLightbox(Gallery.currentIndex())" aria-label="View full screen">'
      + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
      + '<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>'
      + '</svg></button>';

    // Caption
    html += '<div class="gallery-caption" id="gallery-caption">'
      + (images[0].caption || '') + '</div>';

    html += '</div>'; // close .gallery-main

    // Thumbnail strip (only for multi-image)
    if (!single) {
      html += '<div class="gallery-thumbs">';
      images.forEach(function (img, i) {
        html += '<div class="gallery-thumb' + (i === 0 ? ' active' : '') + '" '
          + 'onclick="Gallery.goTo(' + i + ')" '
          + 'data-index="' + i + '">'
          + '<img src="images/' + img.src + '" alt="" '
          + 'onerror="this.parentElement.style.display=\'none\'" />'
          + '</div>';
      });
      html += '</div>';
    }

    html += '</div>'; // close .gallery

    return html;
  }

  // ── Navigate ──
  function goTo(idx) {
    if (idx < 0 || idx >= _images.length) return;
    _current = idx;
    _updateSidebar();
    _updateLightbox();
  }

  function next() { goTo((_current + 1) % _images.length); }
  function prev() { goTo((_current - 1 + _images.length) % _images.length); }

  function currentIndex() { return _current; }

  // ── Update sidebar gallery state ──
  function _updateSidebar() {
    var mainImg = document.getElementById('gallery-main-img');
    if (mainImg) {
      mainImg.src = 'images/' + _images[_current].src;
      mainImg.style.display = '';
    }
    var counter = document.getElementById('gallery-counter-text');
    if (counter) counter.textContent = (_current + 1) + ' / ' + _images.length;

    var caption = document.getElementById('gallery-caption');
    if (caption) caption.textContent = _images[_current].caption || '';

    // Update active thumb
    document.querySelectorAll('.gallery-thumb').forEach(function (el) {
      el.classList.toggle('active', parseInt(el.dataset.index) === _current);
    });
  }

  // ── Lightbox ──
  function openLightbox(idx) {
    if (idx !== undefined) _current = idx;

    var overlay = document.getElementById('lightbox-overlay');
    if (!overlay) return;

    _buildLightboxContent();
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    var overlay = document.getElementById('lightbox-overlay');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function _buildLightboxContent() {
    var container = document.getElementById('lightbox-content');
    if (!container || _images.length === 0) return;

    var img = _images[_current];
    var multi = _images.length > 1;

    var html = '<img class="lightbox-img" src="images/' + img.src + '" alt="" />';

    if (img.caption) {
      html += '<div class="lightbox-caption">' + img.caption + '</div>';
    }

    if (multi) {
      html += '<div class="lightbox-counter">' + (_current + 1) + ' / ' + _images.length + '</div>';
    }

    container.innerHTML = html;

    // Update lightbox thumbs
    document.querySelectorAll('.lightbox-thumb').forEach(function (el) {
      el.classList.toggle('active', parseInt(el.dataset.index) === _current);
    });

    // Scroll active thumb into view
    var activeThumb = document.querySelector('.lightbox-thumb.active');
    if (activeThumb) activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

    // Show/hide nav arrows
    var prevBtn = document.getElementById('lightbox-prev');
    var nextBtn = document.getElementById('lightbox-next');
    if (prevBtn) prevBtn.style.display = multi ? '' : 'none';
    if (nextBtn) nextBtn.style.display = multi ? '' : 'none';
  }

  function _updateLightbox() {
    var overlay = document.getElementById('lightbox-overlay');
    if (overlay && overlay.classList.contains('open')) {
      _buildLightboxContent();
    }
  }

  // Build lightbox thumbs bar (called once per sidebar open)
  function _getLightboxThumbsHtml() {
    if (_images.length <= 1) return '';
    var html = '<div class="lightbox-thumbs">';
    _images.forEach(function (img, i) {
      html += '<div class="lightbox-thumb' + (i === _current ? ' active' : '') + '" '
        + 'data-index="' + i + '" '
        + 'onclick="Gallery.goTo(' + i + ')">'
        + '<img src="images/' + img.src + '" alt="" />'
        + '</div>';
    });
    html += '</div>';
    return html;
  }

  // ── Init lightbox overlay (called once on page load) ──
  function init() {
    // Create lightbox overlay element
    var overlay = document.createElement('div');
    overlay.id = 'lightbox-overlay';
    overlay.innerHTML = ''
      + '<button class="lightbox-close" onclick="Gallery.closeLightbox()" aria-label="Close">&times;</button>'
      + '<button id="lightbox-prev" class="lightbox-nav lightbox-nav-prev" onclick="Gallery.prev()" aria-label="Previous">'
      +   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>'
      + '</button>'
      + '<div id="lightbox-content"></div>'
      + '<button id="lightbox-next" class="lightbox-nav lightbox-nav-next" onclick="Gallery.next()" aria-label="Next">'
      +   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>'
      + '</button>'
      + '<div id="lightbox-thumbs-bar"></div>';

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) Gallery.closeLightbox();
    });

    document.body.appendChild(overlay);

    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
      var lb = document.getElementById('lightbox-overlay');
      if (!lb || !lb.classList.contains('open')) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); Gallery.next(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); Gallery.prev(); }
      else if (e.key === 'Escape') { e.preventDefault(); Gallery.closeLightbox(); }
    });
  }

  // Refresh lightbox thumbs bar (call after images change)
  function refreshLightboxThumbs() {
    var bar = document.getElementById('lightbox-thumbs-bar');
    if (bar) bar.innerHTML = _getLightboxThumbsHtml();
  }

  // Public API
  return {
    render: render,
    goTo: goTo,
    next: next,
    prev: prev,
    currentIndex: currentIndex,
    openLightbox: openLightbox,
    closeLightbox: closeLightbox,
    refreshLightboxThumbs: refreshLightboxThumbs,
    init: init
  };

})();

// Initialise lightbox overlay on page load
document.addEventListener('DOMContentLoaded', Gallery.init);
