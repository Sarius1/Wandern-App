/* ──────────────────────────────────────────────────────────
   Wandern – Hiking Vacation Planner
   Vanilla JS SPA with hash routing + localStorage persistence
────────────────────────────────────────────────────────── */

// ── Storage ────────────────────────────────────────────────
const DB_KEY = 'wandern_v1';
const SETTINGS_KEY = 'wandern_settings';

function loadState() {
  try { return JSON.parse(localStorage.getItem(DB_KEY)) || { trips: [] }; }
  catch { return { trips: [] }; }
}
function saveState() { localStorage.setItem(DB_KEY, JSON.stringify(state)); }

let state = loadState();

// ── Settings & i18n ────────────────────────────────────────
let settings = (() => {
  try { return { lang: 'de', darkMode: false, ...JSON.parse(localStorage.getItem(SETTINGS_KEY)) }; }
  catch { return { lang: 'de', darkMode: false }; }
})();

function saveSettings() { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }

function applySettings() {
  document.documentElement.classList.toggle('dark', settings.darkMode);
}

const TR = {
  en: {
    tagline: 'Your hiking trips',
    noTrips: 'No trips yet.\nTap + to plan your first hike.',
    days: 'Days', tickets: 'Tickets', map: 'Map',
    addDay: '+ Add Day', addEntry: '+ Add Entry',
    note: 'Note', checklist: 'Checklist',
    noteDesc: 'Free text, plans, ideas, reminders',
    checklistDesc: 'Packing list, tasks, to-dos',
    save: 'Save', cancel: 'Cancel', close: 'Close',
    newTrip: 'New Trip', createTrip: 'Create Trip',
    tripName: 'Trip name *', destination: 'Destination',
    startDate: 'Start date', endDate: 'End date',
    description: 'Description',
    descPlaceholder: '1–2 sentences about this trip…',
    coverPhoto: 'Cover photo', tapPhoto: 'Tap to choose a photo',
    uploadTicket: 'Upload Ticket / Screenshot',
    addDayTitle: 'Add Day', label: 'Label', date: 'Date (optional)',
    settings: 'Settings', language: 'Language', darkMode: 'Dark Mode',
    gpx: 'GPX', location: 'Location', saveOffline: 'Save offline',
    locationDenied: 'Location denied – enable in Settings > Privacy', locationUnavailable: 'Location unavailable',
    trackStart: 'Start Hike', trackPause: 'Pause', trackResume: 'Continue', trackFinish: 'Finish',
    hikeSummary: 'Hike Summary', saveToDay: 'Save to Day',
    hikeDontSave: "Don't save", discard: 'Discard',
    hikeSaved: 'Saved to day', hikeEntry: 'Hike', time: 'Time',
    offlineMaps: 'Offline Maps', savedAreas: 'Saved areas',
    downloadArea: 'Download visible area',
    noAreas: 'No areas saved yet.',
    areaName: 'Name', areaNamePlaceholder: 'e.g. Jotunheimen North',
    download: 'Download', zoomRange: 'Zoom range',
    zoomHint: '(higher = more detail, more data)',
    showOnMap: 'Show on map',
    deleteTrip: 'Delete Trip', deleteDay: 'Delete Day',
    writeSomething: 'Write something…', listTitle: 'List title…', addItem: 'Add item',
    noDays: 'No days yet.\nTap below to add your first day.',
    clear: 'Clear',
    noEntries: 'No entries yet.\nTap + to add your first entry.',
    editTrip: 'Edit Trip', editDay: 'Edit Day',
  },
  de: {
    tagline: 'Meine Wandertouren',
    noTrips: 'Noch keine Touren.\nTippe +, um deine erste Tour zu planen.',
    days: 'Tage', tickets: 'Tickets', map: 'Karte',
    addDay: '+ Tag hinzufügen', addEntry: '+ Eintrag hinzufügen',
    note: 'Notiz', checklist: 'Checkliste',
    noteDesc: 'Freitext, Pläne, Ideen, Erinnerungen',
    checklistDesc: 'Packliste, Aufgaben, To-Dos',
    save: 'Speichern', cancel: 'Abbrechen', close: 'Schließen',
    newTrip: 'Neue Tour', createTrip: 'Tour erstellen',
    tripName: 'Name der Tour *', destination: 'Ziel',
    startDate: 'Startdatum', endDate: 'Enddatum',
    description: 'Beschreibung',
    descPlaceholder: '1–2 Sätze zur Tour…',
    coverPhoto: 'Titelbild', tapPhoto: 'Tippe, um ein Foto auszuwählen',
    uploadTicket: 'Ticket / Screenshot hochladen',
    addDayTitle: 'Tag hinzufügen', label: 'Bezeichnung', date: 'Datum (optional)',
    settings: 'Einstellungen', language: 'Sprache', darkMode: 'Dunkelmodus',
    gpx: 'GPX', location: 'Standort', saveOffline: 'Offline speichern',
    locationDenied: 'Standort abgelehnt – bitte in Einstellungen > Datenschutz aktivieren', locationUnavailable: 'Standort nicht verfügbar',
    trackStart: 'Wanderung starten', trackPause: 'Pause', trackResume: 'Weiter', trackFinish: 'Beenden',
    hikeSummary: 'Wanderung beendet', saveToDay: 'Tag zuordnen',
    hikeDontSave: 'Nicht speichern', discard: 'Verwerfen',
    hikeSaved: 'Zum Tag gespeichert', hikeEntry: 'Wanderung', time: 'Zeit',
    offlineMaps: 'Offline-Karten', savedAreas: 'Gespeicherte Bereiche',
    downloadArea: 'Sichtbaren Bereich laden',
    noAreas: 'Noch keine Bereiche gespeichert.',
    areaName: 'Name', areaNamePlaceholder: 'z.B. Jotunheimen Nord',
    download: 'Herunterladen', zoomRange: 'Zoomstufen',
    zoomHint: '(höher = mehr Detail, mehr Daten)',
    showOnMap: 'Auf Karte zeigen',
    deleteTrip: 'Tour löschen', deleteDay: 'Tag löschen',
    writeSomething: 'Schreibe etwas…', listTitle: 'Listentitel…', addItem: 'Element hinzufügen',
    noDays: 'Noch keine Tage.\nTippe unten, um den ersten Tag hinzuzufügen.',
    clear: 'Löschen',
    noEntries: 'Noch keine Einträge.\nTippe +, um den ersten Eintrag hinzuzufügen.',
    editTrip: 'Tour bearbeiten', editDay: 'Tag bearbeiten',
  },
};

function t(key) { return TR[settings.lang]?.[key] ?? TR.en[key] ?? key; }

// ── Helpers ────────────────────────────────────────────────
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  const locale = settings.lang === 'de' ? 'de-DE' : 'en-GB';
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateRange(start, end) {
  if (!start && !end) return '';
  if (start && !end) return formatDate(start);
  return `${formatDate(start)} – ${formatDate(end)}`;
}

function nextDayDate(trip) {
  const daysWithDates = (trip.days || []).filter(d => d.date).sort((a, b) => a.date.localeCompare(b.date));
  if (daysWithDates.length > 0) {
    const last = new Date(daysWithDates[daysWithDates.length - 1].date + 'T00:00:00');
    last.setDate(last.getDate() + 1);
    const y = last.getFullYear();
    const m = String(last.getMonth() + 1).padStart(2, '0');
    const d = String(last.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return trip.dateStart || '';
}

function getTrip(id) { return state.trips.find(t => t.id === id); }
function getDay(trip, id) { return trip?.days?.find(d => d.id === id); }

// ── Router ─────────────────────────────────────────────────
function navigate(path) { window.location.hash = path; }

function handleRoute() {
  if (_watchId !== null) { navigator.geolocation.clearWatch(_watchId); _watchId = null; }

  const hash = decodeURIComponent(window.location.hash.slice(1)) || '/';
  const parts = hash.split('/').filter(Boolean);
  const app = document.getElementById('app');
  app.innerHTML = '';

  if (parts.length === 0 || parts[0] === '') {
    renderDashboard(app);
  } else if (parts[0] === 'trip' && parts[1]) {
    const tab = parts[2] || 'days';
    if (tab === 'day' && parts[3]) renderDayView(app, parts[1], parts[3]);
    else renderTripView(app, parts[1], tab);
  } else {
    renderDashboard(app);
  }
}

window.addEventListener('hashchange', handleRoute);

// ── SVG Icons ──────────────────────────────────────────────
const icons = {
  mountain: `<svg viewBox="0 0 24 24"><polyline points="3 20 9 8 14 14 17 10 21 20"/></svg>`,
  plus:     `<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  back:     `<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>`,
  chevron:  `<svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>`,
  map:      `<svg viewBox="0 0 24 24"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  pin:      `<svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  file:     `<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  image:    `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  upload:   `<svg viewBox="0 0 24 24"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>`,
  note:     `<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  check:    `<svg viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
  trash:    `<svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>`,
  locate:   `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.94 11A8 8 0 0 0 13 4.06V2h-2v2.06A8 8 0 0 0 4.06 11H2v2h2.06A8 8 0 0 0 11 19.94V22h2v-2.06A8 8 0 0 0 19.94 13H22v-2h-2.06z"/></svg>`,
  gpx:      `<svg viewBox="0 0 24 24"><path d="M3 12h4l3-9 4 18 3-9h4"/></svg>`,
  play:     `<svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
  pause:    `<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`,
  stop:     `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>`,
  days:     `<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  ticket:   `<svg viewBox="0 0 24 24"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/></svg>`,
  more:     `<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>`,
  gear:     `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
};

// ── Modal system ───────────────────────────────────────────
let _modalCloseCallback = null;

function openModal(contentHTML, onClose) {
  const modal = document.getElementById('modal');
  document.getElementById('modal-body').innerHTML = contentHTML;
  modal.classList.remove('hidden');
  document.getElementById('modal-backdrop').onclick = closeModal;
  _modalCloseCallback = onClose || null;
  const first = modal.querySelector('input:not([type="file"]), textarea');
  if (first) setTimeout(() => first.focus(), 100);
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  document.getElementById('modal-body').innerHTML = '';
  if (_modalCloseCallback) { _modalCloseCallback(); _modalCloseCallback = null; }
}

// ── Toast ──────────────────────────────────────────────────
let _toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.add('hidden'), 2200);
}

// ── Settings modal ─────────────────────────────────────────
function openSettingsModal() {
  const dm = settings.darkMode;
  const lang = settings.lang;
  openModal(`
    <div class="modal-title">${t('settings')}</div>
    <div class="settings-row">
      <div class="settings-label">${t('language')}</div>
      <div class="settings-toggle-group">
        <button class="toggle-opt ${lang==='de'?'active':''}" data-lang="de">DE</button>
        <button class="toggle-opt ${lang==='en'?'active':''}" data-lang="en">EN</button>
      </div>
    </div>
    <div class="settings-row">
      <div class="settings-label">${t('darkMode')}</div>
      <button class="settings-switch ${dm?'on':''}" id="toggle-dark" aria-label="Toggle dark mode">
        <span class="settings-switch-knob"></span>
      </button>
    </div>
    <div class="modal-actions" style="padding-top:16px;">
      <button class="btn-primary" onclick="closeModal()">${t('close')}</button>
    </div>
  `);

  document.querySelectorAll('[data-lang]').forEach(btn => {
    btn.onclick = () => {
      settings.lang = btn.dataset.lang;
      saveSettings();
      closeModal();
      handleRoute();
    };
  });

  document.getElementById('toggle-dark').onclick = function() {
    settings.darkMode = !settings.darkMode;
    saveSettings();
    applySettings();
    this.classList.toggle('on', settings.darkMode);
  };
}

// ── Dashboard ──────────────────────────────────────────────
function renderDashboard(root) {
  const el = document.createElement('div');
  el.className = 'view';
  el.innerHTML = `
    <div class="dashboard-header">
      <div class="dashboard-header-top">
        <div class="dashboard-logo">
          ${icons.mountain}
          <span class="dashboard-logo-text">Wandern</span>
        </div>
        <button class="dashboard-settings-btn" id="btn-settings" aria-label="${t('settings')}">${icons.gear}</button>
      </div>
      <div class="dashboard-tagline">${t('tagline')}</div>
    </div>
    <div class="scroll-area">
      ${state.trips.length === 0 ? renderEmptyDashboard() : renderTripCards()}
      <div class="section-spacer"></div>
    </div>
    <button class="fab" id="fab-add-trip" aria-label="${t('newTrip')}">${icons.plus}</button>
  `;
  root.appendChild(el);

  el.querySelector('#btn-settings').onclick = openSettingsModal;
  el.querySelector('#fab-add-trip').onclick = openAddTripModal;
  el.querySelectorAll('.trip-card').forEach(card => {
    card.onclick = () => navigate(`/trip/${card.dataset.id}`);
  });
}

function renderEmptyDashboard() {
  const lines = t('noTrips').split('\n');
  return `
    <div class="empty-state">
      ${icons.mountain}
      <p>${lines[0]}<br>${lines[1] || ''}</p>
    </div>`;
}

function renderTripCards() {
  return `<div class="trip-list">${state.trips.map(trip => {
    const dayCount = trip.days?.length || 0;
    const dateStr = formatDateRange(trip.dateStart, trip.dateEnd);
    return `
      <div class="trip-card" data-id="${esc(trip.id)}">
        ${trip.photo
          ? `<div class="trip-card-photo"><img src="${trip.photo}" alt=""></div>`
          : `<div class="trip-card-accent"></div>`}
        <div class="trip-card-body">
          <div class="trip-card-name">${esc(trip.name)}</div>
          <div class="trip-card-meta">
            ${trip.destination ? `<span>${icons.pin}${esc(trip.destination)}</span>` : ''}
            ${dateStr ? `<span>${icons.calendar}${esc(dateStr)}</span>` : ''}
          </div>
        </div>
        ${dayCount > 0 ? `<span class="trip-card-badge">${dayCount}d</span>` : ''}
        <div class="trip-card-arrow">${icons.chevron}</div>
      </div>`;
  }).join('')}</div>`;
}

function openAddTripModal() {
  let pendingPhoto = null;
  openModal(`
    <div class="modal-title">${t('newTrip')}</div>
    <div class="field">
      <label>${t('coverPhoto')}</label>
      <label class="photo-upload-label" id="m-photo-label" for="m-trip-photo">
        ${icons.image}<span>${t('tapPhoto')}</span>
      </label>
      <input type="file" id="m-trip-photo" accept="image/*" style="display:none">
    </div>
    <div class="field">
      <label>${t('tripName')}</label>
      <input id="m-trip-name" type="text" placeholder="z.B. Norwegen 2025" maxlength="60">
    </div>
    <div class="field">
      <label>${t('destination')}</label>
      <input id="m-trip-dest" type="text" placeholder="z.B. Jotunheimen, Norwegen" maxlength="60">
    </div>
    <div class="field">
      <label>${t('description')}</label>
      <textarea id="m-trip-desc" placeholder="${t('descPlaceholder')}" rows="2"></textarea>
    </div>
    <div class="field">
      <label>${t('startDate')}</label>
      <input id="m-trip-start" type="date">
    </div>
    <div class="field">
      <label>${t('endDate')}</label>
      <input id="m-trip-end" type="date">
    </div>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn-primary" id="m-save-trip">${t('createTrip')}</button>
    </div>
  `);

  document.getElementById('m-trip-photo').onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      pendingPhoto = ev.target.result;
      const label = document.getElementById('m-photo-label');
      label.innerHTML = `<img src="${pendingPhoto}" alt="">`;
      label.classList.add('has-photo');
    };
    reader.readAsDataURL(file);
  };

  document.getElementById('m-save-trip').onclick = () => {
    const name = document.getElementById('m-trip-name').value.trim();
    if (!name) { document.getElementById('m-trip-name').focus(); return; }
    const trip = {
      id: uid(), name,
      destination: document.getElementById('m-trip-dest').value.trim(),
      description: document.getElementById('m-trip-desc').value.trim(),
      dateStart: document.getElementById('m-trip-start').value,
      dateEnd: document.getElementById('m-trip-end').value,
      photo: pendingPhoto,
      days: [], tickets: [], gpx: null,
    };
    state.trips.unshift(trip);
    saveState();
    closeModal();
    navigate(`/trip/${trip.id}`);
  };

  document.getElementById('m-trip-name').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('m-save-trip').click();
  });
}

// ── Trip View ──────────────────────────────────────────────
function renderTripView(root, tripId, tab) {
  const trip = getTrip(tripId);
  if (!trip) { navigate('/'); return; }

  const el = document.createElement('div');
  el.className = 'view';
  el.innerHTML = `
    <div class="header">
      <button class="btn-icon" id="btn-back" aria-label="${t('back')}">${icons.back}</button>
      <div class="header-text">
        <div class="header-title">${esc(trip.name)}</div>
        ${trip.destination ? `<div class="header-subtitle">${esc(trip.destination)}</div>` : ''}
      </div>
      <button class="btn-icon" id="btn-trip-menu" aria-label="${t('more')}">${icons.more}</button>
    </div>
    ${trip.description ? `<div class="trip-desc-bar">${esc(trip.description)}</div>` : ''}
    <div class="tabs">
      <button class="tab-btn ${tab==='days'?'active':''}" data-tab="days">${icons.days}<span>${t('days')}</span></button>
      <button class="tab-btn ${tab==='tickets'?'active':''}" data-tab="tickets">${icons.ticket}<span>${t('tickets')}</span></button>
      <button class="tab-btn ${tab==='map'?'active':''}" data-tab="map">${icons.map}<span>${t('map')}</span></button>
    </div>
    <div id="tab-content" class="tab-content scroll-area"></div>
  `;
  root.appendChild(el);

  el.querySelector('#btn-back').onclick = () => navigate('/');
  el.querySelector('#btn-trip-menu').onclick = () => openTripMenu(trip, el);
  el.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => navigate(`/trip/${tripId}/${btn.dataset.tab}`);
  });

  const content = el.querySelector('#tab-content');
  if (tab === 'days')         renderDaysTab(content, trip);
  else if (tab === 'tickets') renderTicketsTab(content, trip);
  else if (tab === 'map')     renderMapTab(content, trip);
}

function openTripMenu(trip, viewEl) {
  let pendingPhoto = trip.photo || null;
  openModal(`
    <div class="modal-title">${t('editTrip')}</div>
    <div class="field">
      <label>${t('coverPhoto')}</label>
      <label class="photo-upload-label ${trip.photo ? 'has-photo' : ''}" id="m-photo-label" for="m-edit-trip-photo">
        ${trip.photo ? `<img src="${trip.photo}" alt="">` : `${icons.image}<span>${t('tapPhoto')}</span>`}
      </label>
      <input type="file" id="m-edit-trip-photo" accept="image/*" style="display:none">
    </div>
    <div class="field">
      <label>${t('tripName')}</label>
      <input id="m-edit-name" type="text" value="${esc(trip.name)}" maxlength="60">
    </div>
    <div class="field">
      <label>${t('destination')}</label>
      <input id="m-edit-dest" type="text" value="${esc(trip.destination||'')}" maxlength="60">
    </div>
    <div class="field">
      <label>${t('description')}</label>
      <textarea id="m-edit-desc" rows="2" placeholder="${t('descPlaceholder')}">${esc(trip.description||'')}</textarea>
    </div>
    <div class="field">
      <label>${t('startDate')}</label>
      <input id="m-edit-start" type="date" value="${esc(trip.dateStart||'')}">
    </div>
    <div class="field">
      <label>${t('endDate')}</label>
      <input id="m-edit-end" type="date" value="${esc(trip.dateEnd||'')}">
    </div>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn-primary" id="m-save-edit">${t('save')}</button>
    </div>
    <button class="btn-danger" id="m-delete-trip">${t('deleteTrip')}</button>
  `);

  document.getElementById('m-edit-trip-photo').onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      pendingPhoto = ev.target.result;
      const label = document.getElementById('m-photo-label');
      label.innerHTML = `<img src="${pendingPhoto}" alt="">`;
      label.classList.add('has-photo');
    };
    reader.readAsDataURL(file);
  };

  document.getElementById('m-save-edit').onclick = () => {
    const name = document.getElementById('m-edit-name').value.trim();
    if (!name) return;
    trip.name = name;
    trip.destination = document.getElementById('m-edit-dest').value.trim();
    trip.description = document.getElementById('m-edit-desc').value.trim();
    trip.dateStart = document.getElementById('m-edit-start').value;
    trip.dateEnd = document.getElementById('m-edit-end').value;
    trip.photo = pendingPhoto;
    saveState();
    closeModal();
    navigate(`/trip/${trip.id}`);
  };

  document.getElementById('m-delete-trip').onclick = () => {
    if (!confirm(`"${trip.name}" ${t('deleteTrip')}?`)) return;
    state.trips = state.trips.filter(t => t.id !== trip.id);
    saveState();
    closeModal();
    navigate('/');
  };
}

// ── Days Tab ───────────────────────────────────────────────
function renderDaysTab(root, trip) {
  const days = trip.days || [];
  const lines = t('noDays').split('\n');
  root.innerHTML = `
    <div class="days-list">
      ${days.length === 0
        ? `<div class="empty-state" style="padding:40px 0;">${icons.calendar}<p>${lines[0]}<br>${lines[1]||''}</p></div>`
        : days.map((day, i) => {
            const count = day.entries?.length || 0;
            return `
              <div class="day-card" data-day="${esc(day.id)}">
                <div class="day-card-num">${i+1}</div>
                <div class="day-card-info">
                  <div class="day-card-label">${esc(day.label)}</div>
                  ${day.subtitle ? `<div class="day-card-subtitle">${esc(day.subtitle)}</div>` : (day.date ? `<div class="day-card-date">${formatDate(day.date)}</div>` : '')}
                </div>
                ${count > 0 ? `<span class="day-card-count">${count} Eintr${count===1?'ag':'äge'}</span>` : ''}
                <div class="day-card-arrow">${icons.chevron}</div>
              </div>`;
          }).join('')
      }
    </div>
    <button class="add-day-row" id="btn-add-day">${t('addDay')}</button>
    <div class="section-spacer"></div>
  `;

  root.querySelectorAll('.day-card').forEach(card => {
    card.onclick = () => navigate(`/trip/${trip.id}/day/${card.dataset.day}`);
  });
  root.querySelector('#btn-add-day').onclick = () => openAddDayModal(trip, root);
}

function openAddDayModal(trip, tabRoot) {
  const dayNum = (trip.days?.length || 0) + 1;
  const suggestLabel = `${t('label') === 'Bezeichnung' ? 'Tag' : 'Day'} ${dayNum}`;
  const suggestDate = nextDayDate(trip);

  openModal(`
    <div class="modal-title">${t('addDayTitle')}</div>
    <div class="field">
      <label>${t('label')}</label>
      <input id="m-day-label" type="text" value="${esc(suggestLabel)}" maxlength="40">
    </div>
    <div class="field">
      <label>${t('date')}</label>
      <input id="m-day-date" type="date" value="${esc(suggestDate)}">
    </div>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn-primary" id="m-save-day">${t('addDayTitle')}</button>
    </div>
  `);

  const save = () => {
    const label = document.getElementById('m-day-label').value.trim() || suggestLabel;
    if (!trip.days) trip.days = [];
    trip.days.push({ id: uid(), label, date: document.getElementById('m-day-date').value, entries: [] });
    saveState();
    closeModal();
    const target = tabRoot || document.getElementById('tab-content');
    if (target) renderDaysTab(target, trip);
  };
  document.getElementById('m-save-day').onclick = save;
  document.getElementById('m-day-label').addEventListener('keydown', e => { if (e.key === 'Enter') save(); });
}

// ── Day Detail View ────────────────────────────────────────
function renderDayView(root, tripId, dayId) {
  const trip = getTrip(tripId);
  if (!trip) { navigate('/'); return; }
  const day = getDay(trip, dayId);
  if (!day) { navigate(`/trip/${tripId}`); return; }

  const el = document.createElement('div');
  el.className = 'view';
  el.innerHTML = `
    <div class="header">
      <button class="btn-icon" id="btn-back">${icons.back}</button>
      <div class="header-text">
        <div class="header-title">${esc(day.label)}</div>
        ${day.date ? `<div class="header-subtitle">${formatDate(day.date)}</div>` : ''}
      </div>
      <button class="btn-icon" id="btn-day-menu">${icons.more}</button>
    </div>
    <div class="scroll-area" style="flex:1;">
      <textarea class="day-subtitle-input" id="day-subtitle" placeholder="${settings.lang === 'de' ? 'Kurze Beschreibung des Tages…' : 'Short description of the day…'}" rows="2">${esc(day.subtitle||'')}</textarea>
      <div class="entries-list" id="entries-list">
        ${(day.entries||[]).map(e => renderEntry(e)).join('')}
      </div>
      <button class="add-entry-row" id="btn-add-entry">${t('addEntry')}</button>
      <div class="section-spacer"></div>
    </div>
  `;
  root.appendChild(el);

  el.querySelector('#btn-back').onclick = () => navigate(`/trip/${tripId}`);
  el.querySelector('#btn-day-menu').onclick = () => openDayMenu(trip, day);
  el.querySelector('#btn-add-entry').onclick = () => openAddEntryModal(trip, day, el);
  el.querySelector('#day-subtitle').oninput = e => { day.subtitle = e.target.value; saveState(); };
  bindEntryEvents(el, trip, day);
}

function renderEntry(entry) {
  if (entry.type === 'hike') {
    const distKm = (entry.distance / 1000).toFixed(2);
    const paceFmt = entry.avgPace > 0 ? `${Math.floor(entry.avgPace/60)}:${String(entry.avgPace%60).padStart(2,'0')}` : '--:--';
    return `
      <div class="entry-card" data-entry="${esc(entry.id)}">
        <div class="entry-header">
          <span class="entry-type-badge hike">${t('hikeEntry')}</span>
          <button class="entry-delete" data-del="${esc(entry.id)}">${icons.trash}</button>
        </div>
        ${entry.mapImage ? `<img src="${entry.mapImage}" class="hike-route-img" alt="">` : ''}
        <div class="hike-entry-stats">
          <div class="hike-entry-stat"><div class="hike-entry-val">${distKm}</div><div class="hike-entry-label">km</div></div>
          <div class="hike-entry-stat"><div class="hike-entry-val">${formatDuration(entry.duration)}</div><div class="hike-entry-label">${t('time')}</div></div>
          <div class="hike-entry-stat"><div class="hike-entry-val">${paceFmt}</div><div class="hike-entry-label">min/km</div></div>
        </div>
      </div>`;
  }
  if (entry.type === 'note') {
    return `
      <div class="entry-card" data-entry="${esc(entry.id)}">
        <div class="entry-header">
          <span class="entry-type-badge">${t('note')}</span>
          <button class="entry-delete" data-del="${esc(entry.id)}">${icons.trash}</button>
        </div>
        <textarea class="entry-textarea" data-save="${esc(entry.id)}" rows="3" placeholder="${t('writeSomething')}">${esc(entry.content)}</textarea>
      </div>`;
  }
  if (entry.type === 'checklist') {
    const items = entry.items || [];
    return `
      <div class="entry-card" data-entry="${esc(entry.id)}">
        <div class="entry-header">
          <span class="entry-type-badge checklist">${t('checklist')}</span>
          <button class="entry-delete" data-del="${esc(entry.id)}">${icons.trash}</button>
        </div>
        <input class="checklist-title-input" type="text" data-title="${esc(entry.id)}" value="${esc(entry.title)}" placeholder="${t('listTitle')}">
        <div class="checklist-items" id="cl-items-${esc(entry.id)}">
          ${items.map(item => renderChecklistItem(entry.id, item)).join('')}
        </div>
        <button class="checklist-add-item" data-add-item="${esc(entry.id)}">${icons.plus} ${t('addItem')}</button>
      </div>`;
  }
  return '';
}

function renderChecklistItem(entryId, item) {
  return `
    <div class="checklist-item" data-item="${esc(item.id)}">
      <input type="checkbox" ${item.done ? 'checked' : ''} data-check="${esc(entryId)}|${esc(item.id)}">
      <input type="text" class="checklist-item-text ${item.done?'done':''}" value="${esc(item.text)}" placeholder="${t('addItem')}…" data-item-text="${esc(entryId)}|${esc(item.id)}">
      <button class="checklist-item-del" data-del-item="${esc(entryId)}|${esc(item.id)}">${icons.trash}</button>
    </div>`;
}

function bindEntryEvents(root, trip, day) {
  const list = root.querySelector('#entries-list');
  if (!list) return;

  list.addEventListener('input', e => {
    const ta = e.target.closest('[data-save]');
    if (ta) { const en = day.entries.find(x => x.id === ta.dataset.save); if (en) { en.content = ta.value; saveState(); } }
    const ti = e.target.closest('[data-title]');
    if (ti) { const en = day.entries.find(x => x.id === ti.dataset.title); if (en) { en.title = ti.value; saveState(); } }
    const it = e.target.closest('[data-item-text]');
    if (it) {
      const [eid, iid] = it.dataset.itemText.split('|');
      const en = day.entries.find(x => x.id === eid);
      const item = en?.items?.find(i => i.id === iid);
      if (item) { item.text = it.value; saveState(); }
    }
  });

  list.addEventListener('change', e => {
    const cb = e.target.closest('[data-check]');
    if (cb) {
      const [eid, iid] = cb.dataset.check.split('|');
      const en = day.entries.find(x => x.id === eid);
      const item = en?.items?.find(i => i.id === iid);
      if (item) {
        item.done = cb.checked;
        saveState();
        cb.parentElement.querySelector('.checklist-item-text')?.classList.toggle('done', item.done);
      }
    }
  });

  list.addEventListener('click', e => {
    const delBtn = e.target.closest('[data-del]');
    if (delBtn) {
      day.entries = day.entries.filter(en => en.id !== delBtn.dataset.del);
      saveState();
      delBtn.closest('.entry-card').remove();
      return;
    }
    const delItem = e.target.closest('[data-del-item]');
    if (delItem) {
      const [eid, iid] = delItem.dataset.delItem.split('|');
      const en = day.entries.find(x => x.id === eid);
      if (en) { en.items = en.items.filter(i => i.id !== iid); saveState(); delItem.closest('.checklist-item').remove(); }
      return;
    }
    const addItem = e.target.closest('[data-add-item]');
    if (addItem) {
      const eid = addItem.dataset.addItem;
      const en = day.entries.find(x => x.id === eid);
      if (en) {
        const item = { id: uid(), text: '', done: false };
        if (!en.items) en.items = [];
        en.items.push(item);
        saveState();
        const container = list.querySelector(`#cl-items-${eid}`);
        if (container) {
          container.insertAdjacentHTML('beforeend', renderChecklistItem(eid, item));
          container.lastElementChild?.querySelector('input[type="text"]')?.focus();
        }
      }
    }
  });
}

function openAddEntryModal(trip, day, root) {
  openModal(`
    <div class="modal-title">${t('addEntry')}</div>
    <div class="option-list">
      <button class="option-item" id="opt-note">
        <div class="option-icon">${icons.note}</div>
        <div><div class="option-label">${t('note')}</div><div class="option-desc">${t('noteDesc')}</div></div>
      </button>
      <button class="option-item" id="opt-checklist">
        <div class="option-icon yellow">${icons.check}</div>
        <div><div class="option-label">${t('checklist')}</div><div class="option-desc">${t('checklistDesc')}</div></div>
      </button>
    </div>
  `);

  document.getElementById('opt-note').onclick = () => {
    const entry = { id: uid(), type: 'note', content: '' };
    if (!day.entries) day.entries = [];
    day.entries.push(entry);
    saveState();
    closeModal();
    const list = root.querySelector('#entries-list');
    if (list) {
      list.insertAdjacentHTML('beforeend', renderEntry(entry));
      list.lastElementChild?.querySelector('textarea')?.focus();
    }
  };

  document.getElementById('opt-checklist').onclick = () => {
    const entry = { id: uid(), type: 'checklist', title: '', items: [] };
    if (!day.entries) day.entries = [];
    day.entries.push(entry);
    saveState();
    closeModal();
    const list = root.querySelector('#entries-list');
    if (list) {
      list.insertAdjacentHTML('beforeend', renderEntry(entry));
      list.lastElementChild?.querySelector('.checklist-title-input')?.focus();
    }
  };
}

function openDayMenu(trip, day) {
  openModal(`
    <div class="modal-title">${t('editDay')}</div>
    <div class="field">
      <label>${t('label')}</label>
      <input id="m-edit-day-label" type="text" value="${esc(day.label)}" maxlength="40">
    </div>
    <div class="field">
      <label>${t('date')}</label>
      <input id="m-edit-day-date" type="date" value="${esc(day.date||'')}">
    </div>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn-primary" id="m-save-day-edit">${t('save')}</button>
    </div>
    <button class="btn-danger" id="m-del-day">${t('deleteDay')}</button>
  `);

  document.getElementById('m-save-day-edit').onclick = () => {
    day.label = document.getElementById('m-edit-day-label').value.trim() || day.label;
    day.date = document.getElementById('m-edit-day-date').value;
    saveState();
    closeModal();
    navigate(`/trip/${trip.id}/day/${day.id}`);
  };

  document.getElementById('m-del-day').onclick = () => {
    if (!confirm(`"${day.label}" ${t('deleteDay')}?`)) return;
    trip.days = trip.days.filter(d => d.id !== day.id);
    saveState();
    closeModal();
    navigate(`/trip/${trip.id}`);
  };
}

// ── Tickets Tab ────────────────────────────────────────────
function renderTicketsTab(root, trip) {
  root.innerHTML = `
    <div class="tickets-list">
      <label class="upload-btn" for="ticket-file-input">
        ${icons.upload}<span>${t('uploadTicket')}</span>
      </label>
      <input type="file" id="ticket-file-input" accept="image/*,application/pdf" multiple>
      ${(trip.tickets||[]).map(tk => renderTicketCard(tk)).join('')}
    </div>
    <div class="section-spacer"></div>
  `;

  root.querySelector('#ticket-file-input').onchange = e => handleTicketUpload(e, trip, root);

  root.querySelectorAll('[data-ticket-del]').forEach(btn => {
    btn.onclick = ev => {
      ev.stopPropagation();
      trip.tickets = trip.tickets.filter(tk => tk.id !== btn.dataset.ticketDel);
      saveState();
      btn.closest('.ticket-card').remove();
    };
  });

  root.querySelectorAll('.ticket-card[data-ticket-open]').forEach(card => {
    card.onclick = () => openTicket(trip.tickets.find(tk => tk.id === card.dataset.ticketOpen));
  });
}

function renderTicketCard(tk) {
  const isImage = tk.fileType?.startsWith('image/');
  const icon = isImage
    ? `<div class="ticket-icon"><img src="${tk.data}" alt="${esc(tk.name)}"></div>`
    : `<div class="ticket-icon">${icons.file}</div>`;
  return `
    <div class="ticket-card" data-ticket-open="${esc(tk.id)}">
      ${icon}
      <div class="ticket-info">
        <div class="ticket-name">${esc(tk.name)}</div>
        <div class="ticket-meta">${esc(tk.fileType)} · ${esc(tk.sizeFmt)}</div>
      </div>
      <button class="ticket-del" data-ticket-del="${esc(tk.id)}">${icons.trash}</button>
    </div>`;
}

function handleTicketUpload(e, trip, root) {
  const files = Array.from(e.target.files);
  if (!files.length) return;
  let loaded = 0;
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = ev => {
      const ticket = { id: uid(), name: file.name, fileType: file.type, sizeFmt: formatBytes(file.size), data: ev.target.result };
      if (!trip.tickets) trip.tickets = [];
      trip.tickets.push(ticket);
      saveState();
      const list = root.querySelector('.tickets-list');
      list.insertAdjacentHTML('beforeend', renderTicketCard(ticket));
      const card = list.lastElementChild;
      card.onclick = () => openTicket(ticket);
      card.querySelector('[data-ticket-del]').onclick = ev => {
        ev.stopPropagation();
        trip.tickets = trip.tickets.filter(tk => tk.id !== ticket.id);
        saveState();
        card.remove();
      };
      loaded++;
      if (loaded === files.length) showToast(`${loaded} Datei${loaded>1?'en':''} hinzugefügt`);
    };
    reader.readAsDataURL(file);
  });
  e.target.value = '';
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes/1024).toFixed(1) + ' KB';
  return (bytes/1048576).toFixed(1) + ' MB';
}

function dataURLToBlob(dataURL) {
  const [header, b64] = dataURL.split(',');
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(b64);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

function openTicket(ticket) {
  if (!ticket) return;
  if (ticket.fileType?.startsWith('image/')) {
    openLightbox(ticket.data, ticket.name);
  } else {
    const url = URL.createObjectURL(dataURLToBlob(ticket.data));
    const win = window.open(url, '_blank');
    if (!win) window.location.href = url;
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
}

function openLightbox(src, title) {
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = `
    <div class="lightbox-header">
      <span class="lightbox-title">${esc(title)}</span>
      <button class="lightbox-close" aria-label="Close">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="lightbox-body"><img src="${src}" alt="${esc(title)}"></div>
  `;
  lb.querySelector('.lightbox-close').onclick = () => lb.remove();
  document.body.appendChild(lb);
}

// ── Map Tab ────────────────────────────────────────────────
let _map = null;
let _routeLayer = null;
let _locationMarker = null;
let _watchId = null;
let _areaRect = null;
let _trackActive = false;
let _trackPaused = false;
let _trackElapsed = 0;
let _trackPoints = [];
let _trackLayer = null;
let _trackDot = null;
let _trackWatchId = null;
let _trackTimer = null;
let _trackStartTime = null;

function renderMapTab(root, trip) {
  root.style.overflowY = 'hidden';
  root.innerHTML = `
    <div class="map-container">
      <div id="map"></div>
      <div class="track-hud" id="track-hud"></div>
      ${trip.gpx ? `<div class="gpx-filename">${esc(trip.gpx.filename)}</div>` : ''}
    </div>
    <div class="map-toolbar">
      <button class="map-btn" id="btn-gpx">${icons.gpx}<span>${t('gpx')}</span></button>
      <button class="map-btn" id="btn-locate">${icons.locate}<span>${t('location')}</span></button>
      <button class="map-btn" id="btn-offline">${icons.upload}<span>${t('saveOffline')}</span></button>
      ${trip.gpx ? `<button class="map-btn" id="btn-clear-gpx">${icons.trash}<span>${t('clear')}</span></button>` : ''}
    </div>
    <div class="map-track-row" id="map-track-row"></div>
    <input type="file" id="gpx-file-input" accept="*">
  `;

  root.querySelector('#btn-gpx').onclick = () => root.querySelector('#gpx-file-input').click();
  root.querySelector('#gpx-file-input').onchange = e => handleGpxUpload(e, trip, root);
  root.querySelector('#btn-locate').onclick = () => toggleLocation(root);
  root.querySelector('#btn-offline').onclick = () => openOfflineModal(trip);
  const clearBtn = root.querySelector('#btn-clear-gpx');
  if (clearBtn) clearBtn.onclick = () => {
    trip.gpx = null;
    saveState();
    if (_routeLayer) { _map.removeLayer(_routeLayer); _routeLayer = null; }
    clearBtn.remove();
    root.querySelector('.gpx-filename')?.remove();
    showToast('Route gelöscht');
  };

  syncTrackUI(root, trip);
  requestAnimationFrame(() => initMap(trip));
}

function initMap(trip) {
  if (_map) { _map.remove(); _map = null; _routeLayer = null; _locationMarker = null; _areaRect = null; _trackLayer = null; _trackDot = null; }

  _map = L.map('map', { zoomControl: true, attributionControl: true }).setView([47.5, 10.5], 10);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(_map);

  if (trip.gpx) {
    const points = parseGPX(trip.gpx.data);
    if (points.length > 0) {
      _routeLayer = L.polyline(points, { color: '#2d6a4f', weight: 4, opacity: .85 }).addTo(_map);
      _map.fitBounds(_routeLayer.getBounds(), { padding: [24, 24] });
    }
  }

  if (_trackActive && _trackPoints.length > 0) {
    const latlngs = _trackPoints.map(p => [p.lat, p.lon]);
    _trackLayer = L.polyline(latlngs, { color: '#e05c1f', weight: 5, opacity: .9 }).addTo(_map);
    const last = _trackPoints[_trackPoints.length - 1];
    _trackDot = L.marker([last.lat, last.lon], { icon: L.divIcon({
      className: '',
      html: `<div style="width:16px;height:16px;background:#e05c1f;border:3px solid #fff;border-radius:50%;box-shadow:0 1px 5px rgba(0,0,0,.4)"></div>`,
      iconSize: [16,16], iconAnchor: [8,8],
    })}).addTo(_map);
    _map.setView([last.lat, last.lon], Math.max(_map.getZoom(), 14));
  }
}

function handleGpxUpload(e, trip, root) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const xml = ev.target.result;
    const points = parseGPX(xml);
    if (points.length === 0) { showToast('Keine Trackpunkte gefunden'); return; }
    trip.gpx = { filename: file.name, data: xml };
    saveState();
    if (_routeLayer) _map.removeLayer(_routeLayer);
    _routeLayer = L.polyline(points, { color: '#2d6a4f', weight: 4, opacity: .85 }).addTo(_map);
    _map.fitBounds(_routeLayer.getBounds(), { padding: [24, 24] });
    showToast(`Route geladen: ${points.length} Punkte`);
    let label = root.querySelector('.gpx-filename');
    if (!label) {
      root.querySelector('.map-container').insertAdjacentHTML('beforeend', `<div class="gpx-filename">${esc(file.name)}</div>`);
    } else {
      label.textContent = file.name;
    }
    if (!root.querySelector('#btn-clear-gpx')) {
      root.querySelector('.map-toolbar').insertAdjacentHTML('beforeend',
        `<button class="map-btn" id="btn-clear-gpx">${icons.trash}<span>${t('clear')}</span></button>`);
      root.querySelector('#btn-clear-gpx').onclick = () => {
        trip.gpx = null; saveState();
        if (_routeLayer) { _map.removeLayer(_routeLayer); _routeLayer = null; }
        root.querySelector('#btn-clear-gpx').remove();
        root.querySelector('.gpx-filename')?.remove();
        showToast('Route gelöscht');
      };
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

function parseGPX(xmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'text/xml');
  const points = [];
  for (const tag of ['trkpt', 'rtept', 'wpt']) {
    const els = doc.getElementsByTagName(tag);
    if (els.length > 0) {
      for (const el of els) {
        const lat = parseFloat(el.getAttribute('lat'));
        const lon = parseFloat(el.getAttribute('lon'));
        if (!isNaN(lat) && !isNaN(lon)) points.push([lat, lon]);
      }
      if (points.length > 0) break;
    }
  }
  return points;
}

function toggleLocation(root) {
  const btn = root.querySelector('#btn-locate');
  if (_watchId !== null) {
    navigator.geolocation.clearWatch(_watchId);
    _watchId = null;
    if (_locationMarker) { _map.removeLayer(_locationMarker); _locationMarker = null; }
    btn.classList.remove('active');
    return;
  }
  if (!navigator.geolocation) { showToast(t('locationUnavailable')); return; }
  btn.classList.add('active');
  _watchId = navigator.geolocation.watchPosition(
    pos => {
      const latlng = [pos.coords.latitude, pos.coords.longitude];
      if (_locationMarker) {
        _locationMarker.setLatLng(latlng);
      } else {
        const dot = L.divIcon({
          className: '',
          html: `<div style="width:14px;height:14px;background:#2563eb;border:2.5px solid #fff;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,.3)"></div>`,
          iconSize: [14,14], iconAnchor: [7,7],
        });
        _locationMarker = L.marker(latlng, { icon: dot }).addTo(_map);
        _map.setView(latlng, Math.max(_map.getZoom(), 14));
      }
    },
    err => {
      btn.classList.remove('active'); _watchId = null;
      if (err.code === 1) {
        showToast(t('locationDenied'));
      } else {
        showToast(t('locationUnavailable'));
      }
    },
    { enableHighAccuracy: true, maximumAge: 5000 }
  );
}

// ── Hike tracking ──────────────────────────────────────────
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const p1 = lat1 * Math.PI / 180, p2 = lat2 * Math.PI / 180;
  const dp = (lat2 - lat1) * Math.PI / 180, dl = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dp/2)**2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function totalDistance(points) {
  let d = 0;
  for (let i = 1; i < points.length; i++)
    d += haversine(points[i-1].lat, points[i-1].lon, points[i].lat, points[i].lon);
  return d;
}

function formatDuration(sec) {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
    : `${m}:${String(s).padStart(2,'0')}`;
}

function formatPace(mPerSec) {
  if (mPerSec < 0.1) return '--:--';
  const spk = 1000 / mPerSec;
  return `${Math.floor(spk/60)}:${String(Math.round(spk%60)).padStart(2,'0')}`;
}

function syncTrackUI(root, trip) {
  const row = root.querySelector('#map-track-row');
  const hud = root.querySelector('#track-hud');
  if (!row) return;
  if (!_trackActive) {
    row.innerHTML = `<button class="btn-track-start" id="btn-track">${icons.play}<span>${t('trackStart')}</span></button>`;
    row.querySelector('#btn-track').onclick = () => { startTracking(trip); syncTrackUI(root, trip); };
    if (hud) hud.style.display = 'none';
  } else if (_trackPaused) {
    row.innerHTML = `<div class="track-btn-row">
      <button class="btn-track-start resume" id="btn-resume">${icons.play}<span>${t('trackResume')}</span></button>
      <button class="btn-track-end" id="btn-finish">${icons.stop}<span>${t('trackFinish')}</span></button>
    </div>`;
    row.querySelector('#btn-resume').onclick = () => { resumeTracking(trip); syncTrackUI(root, trip); };
    row.querySelector('#btn-finish').onclick = () => { finishTracking(trip); syncTrackUI(root, trip); };
    if (hud) { hud.style.display = 'block'; refreshTrackHUD(); }
  } else {
    row.innerHTML = `<button class="btn-track-start stop" id="btn-track">${icons.pause}<span>${t('trackPause')}</span></button>`;
    row.querySelector('#btn-track').onclick = () => { pauseTracking(); syncTrackUI(root, trip); };
    if (hud) { hud.style.display = 'block'; refreshTrackHUD(); }
  }
}

function startTracking(trip) {
  if (_trackActive) return;
  if (!navigator.geolocation) { showToast(t('locationUnavailable')); return; }
  _trackActive = true;
  _trackPaused = false;
  _trackPoints = [];
  _trackElapsed = 0;
  _trackStartTime = Date.now();
  _beginGpsWatch(trip);
  _trackTimer = setInterval(refreshTrackHUD, 1000);
  refreshTrackHUD();
}

function pauseTracking() {
  if (!_trackActive || _trackPaused) return;
  _trackPaused = true;
  _trackElapsed += Math.floor((Date.now() - _trackStartTime) / 1000);
  if (_trackWatchId !== null) { navigator.geolocation.clearWatch(_trackWatchId); _trackWatchId = null; }
  refreshTrackHUD();
}

function resumeTracking(trip) {
  if (!_trackActive || !_trackPaused) return;
  _trackPaused = false;
  _trackStartTime = Date.now();
  _beginGpsWatch(trip);
  refreshTrackHUD();
}

function _beginGpsWatch(trip) {
  _trackWatchId = navigator.geolocation.watchPosition(
    pos => {
      const pt = { lat: pos.coords.latitude, lon: pos.coords.longitude, ts: pos.timestamp };
      _trackPoints.push(pt);
      if (_map) {
        const latlngs = _trackPoints.map(p => [p.lat, p.lon]);
        if (_trackLayer) {
          _trackLayer.setLatLngs(latlngs);
        } else {
          _trackLayer = L.polyline(latlngs, { color: '#e05c1f', weight: 5, opacity: .9 }).addTo(_map);
        }
        const latlng = [pt.lat, pt.lon];
        if (_trackDot) {
          _trackDot.setLatLng(latlng);
        } else {
          _trackDot = L.marker(latlng, { icon: L.divIcon({
            className: '',
            html: `<div style="width:16px;height:16px;background:#e05c1f;border:3px solid #fff;border-radius:50%;box-shadow:0 1px 5px rgba(0,0,0,.4)"></div>`,
            iconSize: [16,16], iconAnchor: [8,8],
          })}).addTo(_map);
          _map.setView(latlng, Math.max(_map.getZoom(), 15));
        }
      }
      refreshTrackHUD();
    },
    err => {
      finishTracking(trip, false);
      showToast(err.code === 1 ? t('locationDenied') : t('locationUnavailable'));
    },
    { enableHighAccuracy: true, maximumAge: 2000 }
  );
}

function refreshTrackHUD() {
  const hud = document.getElementById('track-hud');
  if (!hud || !_trackActive) return;
  const elapsed = _trackPaused
    ? _trackElapsed
    : _trackElapsed + Math.floor((Date.now() - _trackStartTime) / 1000);
  const dist = totalDistance(_trackPoints);

  let paceStr = '--:--';
  if (!_trackPaused && _trackPoints.length >= 2) {
    const cutoff = Date.now() - 30000;
    const recent = _trackPoints.filter(p => p.ts >= cutoff);
    if (recent.length >= 2) {
      let rd = 0;
      for (let i = 1; i < recent.length; i++)
        rd += haversine(recent[i-1].lat, recent[i-1].lon, recent[i].lat, recent[i].lon);
      const dt = (recent[recent.length-1].ts - recent[0].ts) / 1000;
      if (dt > 0 && rd > 10) paceStr = formatPace(rd / dt);
    }
  }

  hud.innerHTML = `
    <div class="track-hud-inner">
      <div class="track-hud-stat"><span class="track-hud-val">${(dist/1000).toFixed(2)}</span><span class="track-hud-label">km</span></div>
      <div class="track-hud-divider"></div>
      <div class="track-hud-stat"><span class="track-hud-val">${formatDuration(elapsed)}</span><span class="track-hud-label">${_trackPaused ? '⏸' : t('time')}</span></div>
      <div class="track-hud-divider"></div>
      <div class="track-hud-stat"><span class="track-hud-val">${paceStr}</span><span class="track-hud-label">min/km</span></div>
    </div>`;
}

async function routeToCanvas(points, gpxPoints = []) {
  const W = 360, H = 200;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#e8f0e8';
  ctx.fillRect(0, 0, W, H);
  if (points.length < 2) return canvas.toDataURL('image/png');

  // Bounding box includes both the tracked route and any GPX route
  const lats = points.map(p => p.lat), lons = points.map(p => p.lon);
  const allLats = [...lats, ...gpxPoints.map(p => p[0])];
  const allLons = [...lons, ...gpxPoints.map(p => p[1])];
  const minLat = Math.min(...allLats), maxLat = Math.max(...allLats);
  const minLon = Math.min(...allLons), maxLon = Math.max(...allLons);

  // Find zoom where route + 1-tile padding fits in ≤16 tiles
  let zoom = 16, tileNW, tileSE, tilesX = 1, tilesY = 1;
  for (let z = 16; z >= 8; z--) {
    const nw = lngLatToTile(maxLat, minLon, z);
    const se = lngLatToTile(minLat, maxLon, z);
    const tx = se.x - nw.x + 3, ty = se.y - nw.y + 3;
    tileNW = { x: nw.x - 1, y: nw.y - 1 };
    tileSE = { x: se.x + 1, y: se.y + 1 };
    tilesX = tx; tilesY = ty; zoom = z;
    if (tx * ty <= 16) break;
  }
  const maxIdx = (1 << zoom) - 1;
  tileNW.x = Math.max(0, tileNW.x); tileNW.y = Math.max(0, tileNW.y);
  tileSE.x = Math.min(maxIdx, tileSE.x); tileSE.y = Math.min(maxIdx, tileSE.y);
  tilesX = tileSE.x - tileNW.x + 1; tilesY = tileSE.y - tileNW.y + 1;

  const tpW = W / tilesX, tpH = H / tilesY;
  const subs = ['a','b','c'];
  await Promise.all(
    Array.from({ length: tilesX }, (_, tx) =>
      Array.from({ length: tilesY }, (_, ty) => ({ tx, ty }))
    ).flat().map(async ({ tx, ty }) => {
      const x = tileNW.x + tx, y = tileNW.y + ty;
      const url = `https://${subs[(x+y)%3]}.tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
      try {
        const img = await loadTileImage(url);
        ctx.drawImage(img, tx * tpW, ty * tpH, tpW, tpH);
      } catch { /* leave bg */ }
    })
  );

  const project = (lat, lon) => {
    const ft = lngLatToTileFloat(lat, lon, zoom);
    return { x: (ft.x - tileNW.x) / tilesX * W, y: (ft.y - tileNW.y) / tilesY * H };
  };

  // GPX route drawn first (below the tracked route)
  if (gpxPoints.length >= 2) {
    ctx.beginPath();
    ctx.strokeStyle = '#2d6a4f';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.7;
    gpxPoints.forEach(([lat, lon], i) => { const { x, y } = project(lat, lon); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Tracked route on top
  ctx.shadowColor = 'rgba(255,255,255,.85)';
  ctx.shadowBlur = 3;
  ctx.beginPath();
  ctx.strokeStyle = '#e05c1f';
  ctx.lineWidth = 4;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  points.forEach((p, i) => { const { x, y } = project(p.lat, p.lon); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
  ctx.stroke();
  ctx.shadowBlur = 0;

  const drawDot = (lat, lon, color) => {
    const { x, y } = project(lat, lon);
    ctx.beginPath(); ctx.fillStyle = color; ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
  };
  drawDot(points[0].lat, points[0].lon, '#2d6a4f');
  drawDot(points[points.length - 1].lat, points[points.length - 1].lon, '#dc2626');

  try { return canvas.toDataURL('image/png'); } catch { return null; }
}

function lngLatToTileFloat(lat, lng, zoom) {
  return {
    x: (lng + 180) / 360 * (1 << zoom),
    y: (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * (1 << zoom),
  };
}

async function loadTileImage(url) {
  // Try service worker cache first — works offline when area was pre-downloaded
  if ('caches' in window) {
    try {
      const cache = await caches.open('wandern-v1');
      const cached = await cache.match(url);
      if (cached) {
        const blob = await cached.blob();
        const objUrl = URL.createObjectURL(blob);
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => { URL.revokeObjectURL(objUrl); resolve(img); };
          img.onerror = () => { URL.revokeObjectURL(objUrl); reject(); };
          img.src = objUrl;
        });
      }
    } catch { /* cache unavailable */ }
  }
  // Fall back to network
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function finishTracking(trip, showSummary = true) {
  if (!_trackActive) return;
  const duration = _trackPaused
    ? _trackElapsed
    : _trackElapsed + Math.floor((Date.now() - _trackStartTime) / 1000);

  _trackActive = false;
  _trackPaused = false;
  if (_trackWatchId !== null) { navigator.geolocation.clearWatch(_trackWatchId); _trackWatchId = null; }
  if (_trackTimer) { clearInterval(_trackTimer); _trackTimer = null; }

  const hud = document.getElementById('track-hud');
  if (hud) hud.style.display = 'none';
  if (_trackLayer && _map) { _map.removeLayer(_trackLayer); _trackLayer = null; }
  if (_trackDot && _map) { _map.removeLayer(_trackDot); _trackDot = null; }

  if (!showSummary || _trackPoints.length < 2) return;

  const distance = totalDistance(_trackPoints);
  const avgPace = distance > 0 ? Math.round(duration / (distance / 1000)) : 0;
  const gpxPoints = trip.gpx ? parseGPX(trip.gpx.data) : [];
  routeToCanvas(_trackPoints, gpxPoints).then(mapImage => {
    openSaveHikeModal(trip, { duration, distance: Math.round(distance), avgPace, mapImage });
  });
}

function openSaveHikeModal(trip, stats) {
  const { duration, distance, avgPace, mapImage } = stats;
  const distKm = (distance / 1000).toFixed(2);
  const paceFmt = avgPace > 0 ? `${Math.floor(avgPace/60)}:${String(avgPace%60).padStart(2,'0')}` : '--:--';
  const dayOptions = (trip.days||[]).map(d =>
    `<option value="${esc(d.id)}">${esc(d.label)}${d.date ? ' – ' + formatDate(d.date) : ''}</option>`
  ).join('');

  openModal(`
    <div class="modal-title">${t('hikeSummary')}</div>
    ${mapImage ? `<img src="${mapImage}" class="hike-route-preview">` : ''}
    <div class="hike-summary-stats">
      <div class="hike-stat-block"><div class="hike-stat-val">${distKm}</div><div class="hike-stat-label">km</div></div>
      <div class="hike-stat-block"><div class="hike-stat-val">${formatDuration(duration)}</div><div class="hike-stat-label">${t('time')}</div></div>
      <div class="hike-stat-block"><div class="hike-stat-val">${paceFmt}</div><div class="hike-stat-label">min/km</div></div>
    </div>
    ${dayOptions ? `
    <div class="field" style="margin-top:4px;">
      <label>${t('saveToDay')}</label>
      <select id="m-hike-day" style="width:100%;padding:10px;border:1.5px solid var(--border);border-radius:8px;font-size:.93rem;background:var(--bg);color:var(--text)">
        <option value="">${t('hikeDontSave')}</option>
        ${dayOptions}
      </select>
    </div>` : ''}
    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal()">${t('discard')}</button>
      <button class="btn-primary" id="m-hike-save">${t('save')}</button>
    </div>
  `);

  document.getElementById('m-hike-save').onclick = () => {
    const dayId = document.getElementById('m-hike-day')?.value;
    if (dayId) {
      const day = getDay(trip, dayId);
      if (day) {
        if (!day.entries) day.entries = [];
        day.entries.push({ id: uid(), type: 'hike', date: new Date().toISOString(), duration, distance, avgPace, mapImage: mapImage || null });
        saveState();
        showToast(t('hikeSaved'));
      }
    }
    closeModal();
  };
}

// ── Offline tile download ──────────────────────────────────
function lngLatToTile(lat, lng, zoom) {
  const x = Math.floor((lng + 180) / 360 * (1 << zoom));
  const y = Math.floor(
    (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI)
    / 2 * (1 << zoom)
  );
  return { x, y };
}

function getTileUrls(bounds, minZ, maxZ) {
  const urls = [];
  const sub = ['a','b','c'];
  for (let z = minZ; z <= maxZ; z++) {
    const sw = lngLatToTile(bounds.getSouth(), bounds.getWest(), z);
    const ne = lngLatToTile(bounds.getNorth(), bounds.getEast(), z);
    const x0 = Math.min(sw.x,ne.x), x1 = Math.max(sw.x,ne.x);
    const y0 = Math.min(sw.y,ne.y), y1 = Math.max(sw.y,ne.y);
    for (let x = x0; x <= x1; x++)
      for (let y = y0; y <= y1; y++)
        urls.push(`https://${sub[(x+y)%3]}.tile.openstreetmap.org/${z}/${x}/${y}.png`);
  }
  return urls;
}

function renderSavedAreas(trip, container) {
  const areas = trip.offlineAreas || [];
  if (areas.length === 0) {
    container.innerHTML = `<p class="offline-empty">${t('noAreas')}</p>`;
    return;
  }
  const locale = settings.lang === 'de' ? 'de-DE' : 'en-GB';
  container.innerHTML = areas.map(a => `
    <div class="offline-area-row">
      <button class="offline-area-body" data-fly-area="${esc(a.id)}">
        <div class="offline-area-name">${esc(a.label)}</div>
        <div class="offline-area-meta">z${a.minZ}–${a.maxZ} · ${a.tileCount} Tiles · ${new Date(a.savedAt).toLocaleDateString(locale,{day:'numeric',month:'short'})}</div>
        <div class="offline-area-hint">${icons.map} ${t('showOnMap')}</div>
      </button>
      <button class="offline-area-del" data-del-area="${esc(a.id)}">${icons.trash}</button>
    </div>
  `).join('');

  container.querySelectorAll('[data-fly-area]').forEach(btn => {
    btn.onclick = () => {
      const area = (trip.offlineAreas||[]).find(a => a.id === btn.dataset.flyArea);
      if (area) flyToOfflineArea(area);
    };
  });

  container.querySelectorAll('[data-del-area]').forEach(btn => {
    btn.onclick = async e => {
      e.stopPropagation();
      const area = (trip.offlineAreas||[]).find(a => a.id === btn.dataset.delArea);
      if (!area) return;
      const b = area.bounds;
      const fb = { getSouth:()=>b.south, getWest:()=>b.west, getNorth:()=>b.north, getEast:()=>b.east };
      const cache = await caches.open('wandern-v1');
      await Promise.all(getTileUrls(fb, area.minZ, area.maxZ).map(u => cache.delete(u)));
      trip.offlineAreas = trip.offlineAreas.filter(a => a.id !== btn.dataset.delArea);
      saveState();
      btn.closest('.offline-area-row').remove();
      if (!container.querySelector('.offline-area-row'))
        container.innerHTML = `<p class="offline-empty">${t('noAreas')}</p>`;
      showToast('Bereich gelöscht');
    };
  });
}

function flyToOfflineArea(area) {
  closeModal();
  if (!_map) return;
  const b = area.bounds;
  const lb = [[b.south,b.west],[b.north,b.east]];
  if (_areaRect) _map.removeLayer(_areaRect);
  _areaRect = L.rectangle(lb, { color:'#2d6a4f', weight:2, fillColor:'#74c69d', fillOpacity:.12, dashArray:'6,4' }).addTo(_map);
  _map.fitBounds(lb, { padding:[24,24] });
}

function openOfflineModal(trip) {
  if (!_map) return;
  const bounds = _map.getBounds();
  const zoom = _map.getZoom();
  const minZ = Math.max(6, zoom - 2);
  const maxZ = Math.min(16, zoom + 2);
  const countTiles = (mn, mx) => getTileUrls(bounds, mn, mx).length;

  openModal(`
    <div class="modal-title">${t('offlineMaps')}</div>
    <div class="offline-section-label">${t('savedAreas')}</div>
    <div id="m-saved-areas" class="offline-areas-list"></div>
    <div class="offline-section-label" style="margin-top:16px;">${t('downloadArea')}</div>
    <div class="field" style="padding-top:6px;">
      <label style="font-size:.8rem;color:var(--text-muted);font-weight:400;">Karte auf die gewünschte Region zoomen, dann herunterladen.</label>
    </div>
    <div class="field">
      <label>${t('areaName')}</label>
      <input id="m-area-name" type="text" placeholder="${t('areaNamePlaceholder')}" maxlength="50">
    </div>
    <div class="field">
      <label>${t('zoomRange')} <span style="font-weight:400;color:var(--text-muted)">${t('zoomHint')}</span></label>
      <div style="display:flex;gap:8px;align-items:center;">
        <select id="m-minz" style="flex:1;padding:10px;border:1.5px solid var(--border);border-radius:8px;font-size:.93rem;background:var(--bg);color:var(--text)">
          ${[8,9,10,11,12,13,14].map(z=>`<option value="${z}" ${z===minZ?'selected':''}>${z}</option>`).join('')}
        </select>
        <span style="color:var(--text-muted)">–</span>
        <select id="m-maxz" style="flex:1;padding:10px;border:1.5px solid var(--border);border-radius:8px;font-size:.93rem;background:var(--bg);color:var(--text)">
          ${[10,11,12,13,14,15,16].map(z=>`<option value="${z}" ${z===maxZ?'selected':''}>${z}</option>`).join('')}
        </select>
      </div>
      <div id="m-tile-count" style="font-size:.8rem;color:var(--text-muted);margin-top:6px;">~${countTiles(minZ,maxZ)} Tiles</div>
    </div>
    <div id="m-dl-progress" style="display:none;padding:0 20px 8px;">
      <div style="font-size:.85rem;color:var(--text-soft);margin-bottom:6px;" id="m-dl-status">Lädt…</div>
      <div style="background:var(--border);border-radius:4px;height:6px;overflow:hidden;">
        <div id="m-dl-bar" style="background:var(--green);height:100%;width:0%;transition:width .2s;"></div>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal()">${t('close')}</button>
      <button class="btn-primary" id="m-dl-start">${t('download')}</button>
    </div>
  `);

  renderSavedAreas(trip, document.getElementById('m-saved-areas'));

  const updateCount = () => {
    const mn = parseInt(document.getElementById('m-minz').value);
    const mx = parseInt(document.getElementById('m-maxz').value);
    if (mx >= mn) document.getElementById('m-tile-count').textContent = `~${countTiles(mn,mx)} Tiles`;
  };
  document.getElementById('m-minz').onchange = updateCount;
  document.getElementById('m-maxz').onchange = updateCount;

  document.getElementById('m-dl-start').onclick = async () => {
    const mn = parseInt(document.getElementById('m-minz').value);
    const mx = parseInt(document.getElementById('m-maxz').value);
    if (mx < mn) { showToast('Max-Zoom muss ≥ Min-Zoom sein'); return; }
    const label = document.getElementById('m-area-name').value.trim()
      || `Bereich ${new Date().toLocaleDateString('de-DE',{day:'numeric',month:'short'})}`;
    const urls = getTileUrls(bounds, mn, mx);
    if (urls.length > 8000 && !confirm(`${urls.length} Tiles (~${Math.round(urls.length*25/1024)} MB). Fortfahren?`)) return;

    document.getElementById('m-dl-start').disabled = true;
    document.getElementById('m-dl-progress').style.display = 'block';
    const bar = document.getElementById('m-dl-bar');
    const status = document.getElementById('m-dl-status');

    let done = 0, failed = 0;
    const cache = await caches.open('wandern-v1');
    for (let i = 0; i < urls.length; i += 6) {
      await Promise.all(urls.slice(i, i+6).map(async url => {
        try {
          if (!(await cache.match(url))) {
            const res = await fetch(url, { mode:'cors' });
            if (res.ok) await cache.put(url, res);
          }
        } catch { failed++; }
        done++;
        bar.style.width = `${Math.round(done/urls.length*100)}%`;
        status.textContent = `${done} / ${urls.length} Tiles gespeichert`;
      }));
    }

    const success = done - failed;
    status.textContent = failed > 0 ? `Fertig — ${success} gespeichert, ${failed} fehlgeschlagen` : `Alle ${done} Tiles gespeichert`;
    bar.style.background = failed > 0 ? '#f59e0b' : 'var(--green)';
    document.getElementById('m-dl-start').disabled = false;

    if (success > 0) {
      const area = {
        id: uid(), label,
        bounds: { south:bounds.getSouth(), west:bounds.getWest(), north:bounds.getNorth(), east:bounds.getEast() },
        minZ: mn, maxZ: mx, tileCount: success, savedAt: Date.now(),
      };
      if (!trip.offlineAreas) trip.offlineAreas = [];
      trip.offlineAreas.push(area);
      saveState();
      renderSavedAreas(trip, document.getElementById('m-saved-areas'));
      document.getElementById('m-area-name').value = '';
    }
  };
}

// ── Init ───────────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}

applySettings();
handleRoute();
