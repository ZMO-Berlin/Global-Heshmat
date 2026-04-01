// ════════════════════════════════════════════════════════════════
// Global Heshmat — Map Application Logic
// Requires: Leaflet, Leaflet.markercluster, and js/data.js loaded first
// ════════════════════════════════════════════════════════════════

// Placeholder SVG shown when no image is available
const PLACEHOLDER_SVG = `<div class="sidebar-image-placeholder">
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="16" width="48" height="36" rx="3" stroke="currentColor" stroke-width="2" fill="none"/>
    <circle cx="22" cy="30" r="5" stroke="currentColor" stroke-width="2"/>
    <path d="M8 44l14-10 8 6 12-10 14 10" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round"/>
    <path d="M28 8l4-4 4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="32" y1="4" x2="32" y2="16" stroke="currentColor" stroke-width="2"/>
  </svg>
  <span>Image coming soon</span>
</div>`;

// ════════════════════════════════════════════
// MAP INITIALISATION
// ════════════════════════════════════════════
const map = L.map('map', {
  center: [35, 20],
  zoom: 3,
  zoomControl: true,
  maxBounds: [[-60, -180], [85, 180]]
});

L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
  maxZoom: 19
}).addTo(map);

// ════════════════════════════════════════════
// MARKERS & CLUSTERS
// ════════════════════════════════════════════
const clusterGroup = L.markerClusterGroup({
  maxClusterRadius: 45,
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false
});

const markerMap = new Map();

artworks.forEach(a => {
  const isSearch = a.status === 'search';
  const icon = L.divIcon({
    className: '',
    html: `<div class="${isSearch ? 'marker-search' : 'marker-located'}"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
  const marker = L.marker([a.lat, a.lng], { icon })
    .on('click', () => openSidebar(a));
  marker._artworkData = a;
  clusterGroup.addLayer(marker);
  markerMap.set(a.id, marker);
});

map.addLayer(clusterGroup);

// ════════════════════════════════════════════
// MOVEMENT LINES (relocated artworks)
// ════════════════════════════════════════════
artworks.filter(a => a.movement).forEach(a => {
  const m = a.movement;

  // Ghost marker at former location
  const ghostIcon = L.divIcon({
    className: '',
    html: '<div class="marker-ghost"></div>',
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
  L.marker([m.fromLat, m.fromLng], { icon: ghostIcon })
    .bindTooltip('Former location: ' + m.fromName, { direction: 'top' })
    .addTo(map);

  // Dashed relocation line
  L.polyline(
    [[m.fromLat, m.fromLng], [a.lat, a.lng]],
    { color: '#c9963b', weight: 2, dashArray: '8 6', opacity: 0.8 }
  ).addTo(map)
    .bindTooltip('Relocated ' + m.year, { sticky: true });
});

// ════════════════════════════════════════════
// SIDEBAR
// ════════════════════════════════════════════
function openSidebar(a) {
  const sb = document.getElementById('sidebar');
  document.getElementById('sb-title').textContent = a.name;

  const isSearch = a.status === 'search';
  const tagClass = isSearch ? 'tag-search' : (a.movement ? 'tag-moved' : 'tag-located');
  const tagText = isSearch ? 'To be found' : (a.movement ? 'Relocated' : 'Located');

  // Image(s) — use Gallery if multiple images, otherwise single image
  let imageHtml;
  if (a.images && a.images.length > 0) {
    imageHtml = Gallery.render(a.images);
  } else if (a.image) {
    imageHtml = Gallery.render([{ src: a.image, caption: a.imageCaption || '' }]);
  } else {
    imageHtml = '<div class="sidebar-image">' + PLACEHOLDER_SVG + '</div>';
  }

  let html = imageHtml
    + '<div class="sidebar-content">'
    + '<div class="sidebar-meta">'
    +   '<span class="tag ' + tagClass + '">' + tagText + '</span>'
    +   '<span>' + a.city + ', ' + a.country + '</span>'
    + '</div>'
    + '<div class="sidebar-address">' + a.address + '</div>'
    + '<div class="sidebar-desc">' + a.desc + '</div>';

  // Movement info
  if (a.movement) {
    html += '<div class="sidebar-movement">'
      + '<strong>Relocated ' + a.movement.year + '</strong><br>'
      + 'From: ' + a.movement.fromName + '<br>'
      + 'To: ' + a.city
      + '</div>';
  }

  // Video embed
  if (a.video) {
    const match = a.video.match(/(?:v=|\/)([\w-]{11})/);
    if (match) {
      html += '<div class="sidebar-video">'
        + '<iframe src="https://www.youtube.com/embed/' + match[1] + '" allowfullscreen loading="lazy"></iframe>'
        + '</div>';
    }
  }

  // External links
  if (a.links && a.links.length) {
    html += '<div class="sidebar-links">';
    a.links.forEach(function(l) {
      html += '<a href="' + l.url + '" target="_blank">' + l.label + ' &rarr;</a>';
    });
    html += '</div>';
  }

  // Contact call-to-action for missing works
  if (isSearch) {
    html += '<div class="sidebar-contact">'
      + 'Do you know where this artwork is? Please contact '
      + '<a href="mailto:sonja.hegasy@zmo.de">sonja.hegasy@zmo.de</a>'
      + '</div>';
  }

  html += '</div>'; // close .sidebar-content

  document.getElementById('sb-body').innerHTML = html;
  Gallery.refreshLightboxThumbs();
  sb.classList.add('open');
  document.getElementById('sb-body').scrollTop = 0;
  map.panTo([a.lat, a.lng], { animate: true });
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
}

// ════════════════════════════════════════════
// SEARCH
// ════════════════════════════════════════════
function onSearch(query) {
  var resultsEl = document.getElementById('search-results');
  var q = query.trim().toLowerCase();

  if (q.length < 2) {
    resultsEl.classList.remove('open');
    return;
  }

  var matches = artworks.filter(function(a) {
    var searchable = (a.name + ' ' + a.city + ' ' + a.country + ' ' + a.address).toLowerCase();
    return q.split(/\s+/).every(function(word) { return searchable.indexOf(word) !== -1; });
  }).slice(0, 8);

  if (matches.length === 0) {
    resultsEl.innerHTML = '<div class="search-empty">No artworks found</div>';
  } else {
    resultsEl.innerHTML = matches.map(function(a) {
      var color = a.status === 'search' ? '#d4842a' : '#1a8a7d';
      return '<div class="search-item" onclick="selectSearchResult(' + a.id + ')">'
        + '<div class="search-item-name">'
        + '<span class="search-item-status" style="background:' + color + '"></span>' + a.name
        + '</div>'
        + '<div class="search-item-loc">' + a.city + ', ' + a.country + '</div>'
        + '</div>';
    }).join('');
  }
  resultsEl.classList.add('open');
}

function selectSearchResult(id) {
  var a = artworks.find(function(x) { return x.id === id; });
  if (!a) return;
  document.getElementById('search-results').classList.remove('open');
  document.getElementById('search-input').value = '';
  map.setView([a.lat, a.lng], 14, { animate: true });
  openSidebar(a);
}

// Close search dropdown on outside click
document.addEventListener('click', function(e) {
  if (!e.target.closest('.search-wrapper')) {
    document.getElementById('search-results').classList.remove('open');
  }
});

// ════════════════════════════════════════════
// COUNTRY / STATUS FILTERS
// ════════════════════════════════════════════
var activeFilter = 'all';

function setFilter(filter, el) {
  activeFilter = filter;
  document.querySelectorAll('.filter-chip').forEach(function(c) {
    c.classList.remove('active', 'active-search');
  });
  if (filter === 'search') {
    el.classList.add('active-search');
  } else {
    el.classList.add('active');
  }

  clusterGroup.clearLayers();
  markerMap.forEach(function(marker) {
    var a = marker._artworkData;
    var show = false;
    if (filter === 'all') show = true;
    else if (filter === 'search') show = a.status === 'search';
    else show = a.country === filter;
    if (show) clusterGroup.addLayer(marker);
  });

  if (clusterGroup.getLayers().length > 0) {
    map.fitBounds(clusterGroup.getBounds(), { padding: [60, 60], maxZoom: 10 });
  }
}

// ════════════════════════════════════════════
// ABOUT MODAL
// ════════════════════════════════════════════
function openAbout() {
  document.getElementById('about-overlay').classList.add('open');
}

function closeAbout(e) {
  if (!e || e.target === document.getElementById('about-overlay')
      || e.currentTarget.classList.contains('sidebar-close')) {
    document.getElementById('about-overlay').classList.remove('open');
  }
}

// ════════════════════════════════════════════
// RESET
// ════════════════════════════════════════════
function resetView() {
  closeSidebar();
  setFilter('all', document.querySelector('[data-filter="all"]'));
  map.setView([35, 20], 3, { animate: true });
}

// ════════════════════════════════════════════
// KEYBOARD SHORTCUTS
// ════════════════════════════════════════════
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    // Lightbox takes priority — close it first before closing sidebar
    var lb = document.getElementById('lightbox-overlay');
    if (lb && lb.classList.contains('open')) return; // handled by gallery.js
    closeSidebar();
    closeAbout();
    document.getElementById('search-results').classList.remove('open');
  }
});
