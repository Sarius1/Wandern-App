/* ──────────────────────────────────────────────────────────
   Wandern – Hiking Vacation Planner
   Vanilla JS SPA with hash routing + localStorage persistence
────────────────────────────────────────────────────────── */

// ── Storage ────────────────────────────────────────────────
const DB_KEY = 'wandern_v1';

function loadState() {
  try { return JSON.parse(localStorage.getItem(DB_KEY)) || { trips: [] }; }
  catch { return { trips: [] }; }
}
function saveState() {
  localStorage.setItem(DB_KEY, JSON.stringify(state));
}

let state = loadState();

// ── Helpers ────────────────────────────────────────────────
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
function formatDateRange(start, end) {
  if (!start && !end) return '';
  if (start && !end) return formatDate(start);
  return `${formatDate(start)} – ${formatDate(end)}`;
}
function getTrip(id) { return state.trips.find(t => t.id === id); }
function getDay(trip, id) { return trip?.days?.find(d => d.id === id); }

// ── Router ─────────────────────────────────────────────────
function navigate(path) { window.location.hash = path; }

function handleRoute() {
  // Stop location watch when navigating away from map
  if (_watchId !== null) {
    navigator.geolocation.clearWatch(_watchId);
    _watchId = null;
  }

  const hash = decodeURIComponent(window.location.hash.slice(1)) || '/';
  const parts = hash.split('/').filter(Boolean);
  const app = document.getElementById('app');
  app.innerHTML = '';

  if (parts.length === 0 || parts[0] === '') {
    renderDashboard(app);
  } else if (parts[0] === 'trip' && parts[1]) {
    const tab = parts[2] || 'days';
    if (tab === 'day' && parts[3]) {
      renderDayView(app, parts[1], parts[3]);
    } else {
      renderTripView(app, parts[1], tab);
    }
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
  edit:     `<svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  locate:   `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.94 11A8 8 0 0 0 13 4.06V2h-2v2.06A8 8 0 0 0 4.06 11H2v2h2.06A8 8 0 0 0 11 19.94V22h2v-2.06A8 8 0 0 0 19.94 13H22v-2h-2.06z"/></svg>`,
  gpx:      `<svg viewBox="0 0 24 24"><path d="M3 12h4l3-9 4 18 3-9h4"/></svg>`,
  days:     `<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="8" y2="14"/><line x1="12" y1="14" x2="12" y2="14"/><line x1="16" y1="14" x2="16" y2="14"/></svg>`,
  ticket:   `<svg viewBox="0 0 24 24"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/></svg>`,
  more:     `<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>`,
};

// ── Modal system ───────────────────────────────────────────
let _modalCloseCallback = null;

function openModal(contentHTML, onClose) {
  const modal = document.getElementById('modal');
  document.getElementById('modal-body').innerHTML = contentHTML;
  modal.classList.remove('hidden');
  document.getElementById('modal-backdrop').onclick = closeModal;
  _modalCloseCallback = onClose || null;
  // focus first input
  const first = modal.querySelector('input, textarea');
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
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.add('hidden'), 2200);
}

// ── Dashboard ──────────────────────────────────────────────
function renderDashboard(root) {
  const el = document.createElement('div');
  el.className = 'view';

  el.innerHTML = `
    <div class="dashboard-header">
      <div class="dashboard-logo">
        ${icons.mountain}
        <span class="dashboard-logo-text">Wandern</span>
      </div>
      <div class="dashboard-tagline">Your hiking trips</div>
    </div>
    <div class="scroll-area">
      ${state.trips.length === 0 ? renderEmptyDashboard() : renderTripCards()}
      <div class="section-spacer"></div>
    </div>
    <button class="fab" id="fab-add-trip" aria-label="Add trip">${icons.plus}</button>
  `;
  root.appendChild(el);

  el.querySelector('#fab-add-trip').onclick = () => openAddTripModal();

  el.querySelectorAll('.trip-card').forEach(card => {
    card.onclick = () => navigate(`/trip/${card.dataset.id}`);
  });
}

function renderEmptyDashboard() {
  return `
    <div class="empty-state">
      ${icons.mountain}
      <p>No trips yet.<br>Tap <strong>+</strong> to plan your first hike.</p>
    </div>`;
}

function renderTripCards() {
  return `<div class="trip-list">${state.trips.map(t => {
    const dayCount = t.days?.length || 0;
    const dateStr = formatDateRange(t.dateStart, t.dateEnd);
    return `
      <div class="trip-card" data-id="${esc(t.id)}">
        ${t.photo
          ? `<div class="trip-card-photo"><img src="${t.photo}" alt=""></div>`
          : `<div class="trip-card-accent"></div>`}
        <div class="trip-card-body">
          <div class="trip-card-name">${esc(t.name)}</div>
          <div class="trip-card-meta">
            ${t.destination ? `<span>${icons.pin}${esc(t.destination)}</span>` : ''}
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
    <div class="modal-title">New Trip</div>
    <div class="field">
      <label>Cover photo</label>
      <label class="photo-upload-label" id="m-photo-label" for="m-trip-photo">
        ${icons.image}<span>Tap to choose a photo</span>
      </label>
      <input type="file" id="m-trip-photo" accept="image/*" style="display:none">
    </div>
    <div class="field">
      <label>Trip name *</label>
      <input id="m-trip-name" type="text" placeholder="e.g. Norway 2025" maxlength="60">
    </div>
    <div class="field">
      <label>Destination</label>
      <input id="m-trip-dest" type="text" placeholder="e.g. Jotunheimen, Norway" maxlength="60">
    </div>
    <div class="field">
      <label>Start date</label>
      <input id="m-trip-start" type="date">
    </div>
    <div class="field">
      <label>End date</label>
      <input id="m-trip-end" type="date">
    </div>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" id="m-save-trip">Create Trip</button>
    </div>
  `);
  document.getElementById('m-trip-photo').onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      pendingPhoto = ev.target.result;
      const label = document.getElementById('m-photo-label');
      label.innerHTML = `<img src="${pendingPhoto}" alt="Cover photo">`;
      label.classList.add('has-photo');
    };
    reader.readAsDataURL(file);
  };
  document.getElementById('m-save-trip').onclick = () => {
    const name = document.getElementById('m-trip-name').value.trim();
    if (!name) { document.getElementById('m-trip-name').focus(); return; }
    const trip = {
      id: uid(),
      name,
      destination: document.getElementById('m-trip-dest').value.trim(),
      dateStart: document.getElementById('m-trip-start').value,
      dateEnd: document.getElementById('m-trip-end').value,
      photo: pendingPhoto,
      days: [],
      tickets: [],
      gpx: null,
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
      <button class="btn-icon" id="btn-back" aria-label="Back">${icons.back}</button>
      <div>
        <div class="header-title">${esc(trip.name)}</div>
        ${trip.destination ? `<div class="header-subtitle">${esc(trip.destination)}</div>` : ''}
      </div>
      <button class="btn-icon" id="btn-trip-menu" aria-label="More">${icons.more}</button>
    </div>
    <div class="tabs" id="tabs">
      <button class="tab-btn ${tab==='days'?'active':''}" data-tab="days">${icons.days}<span>Days</span></button>
      <button class="tab-btn ${tab==='tickets'?'active':''}" data-tab="tickets">${icons.ticket}<span>Tickets</span></button>
      <button class="tab-btn ${tab==='map'?'active':''}" data-tab="map">${icons.map}<span>Map</span></button>
    </div>
    <div id="tab-content" class="tab-content scroll-area"></div>
  `;
  root.appendChild(el);

  el.querySelector('#btn-back').onclick = () => navigate('/');
  el.querySelector('#btn-trip-menu').onclick = () => openTripMenu(trip);
  el.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => navigate(`/trip/${tripId}/${btn.dataset.tab}`);
  });

  const content = el.querySelector('#tab-content');
  if (tab === 'days')    renderDaysTab(content, trip);
  else if (tab === 'tickets') renderTicketsTab(content, trip);
  else if (tab === 'map') renderMapTab(content, trip);
}

function openTripMenu(trip) {
  let pendingPhoto = trip.photo || null;
  openModal(`
    <div class="modal-title">${esc(trip.name)}</div>
    <div class="field">
      <label>Cover photo</label>
      <label class="photo-upload-label ${trip.photo ? 'has-photo' : ''}" id="m-photo-label" for="m-edit-trip-photo">
        ${trip.photo
          ? `<img src="${trip.photo}" alt="Cover photo">`
          : `${icons.image}<span>Tap to choose a photo</span>`}
      </label>
      <input type="file" id="m-edit-trip-photo" accept="image/*" style="display:none">
    </div>
    <div class="field" style="padding-bottom:0">
      <label>Trip name</label>
      <input id="m-edit-name" type="text" value="${esc(trip.name)}" maxlength="60">
    </div>
    <div class="field" style="padding-bottom:0">
      <label>Destination</label>
      <input id="m-edit-dest" type="text" value="${esc(trip.destination||'')}" maxlength="60">
    </div>
    <div class="field" style="padding-bottom:0">
      <label>Start date</label>
      <input id="m-edit-start" type="date" value="${esc(trip.dateStart||'')}">
    </div>
    <div class="field">
      <label>End date</label>
      <input id="m-edit-end" type="date" value="${esc(trip.dateEnd||'')}">
    </div>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" id="m-save-edit">Save</button>
    </div>
    <button class="btn-danger" id="m-delete-trip">Delete Trip</button>
  `);
  document.getElementById('m-edit-trip-photo').onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      pendingPhoto = ev.target.result;
      const label = document.getElementById('m-photo-label');
      label.innerHTML = `<img src="${pendingPhoto}" alt="Cover photo">`;
      label.classList.add('has-photo');
    };
    reader.readAsDataURL(file);
  };
  document.getElementById('m-save-edit').onclick = () => {
    const name = document.getElementById('m-edit-name').value.trim();
    if (!name) return;
    trip.name = name;
    trip.destination = document.getElementById('m-edit-dest').value.trim();
    trip.dateStart = document.getElementById('m-edit-start').value;
    trip.dateEnd = document.getElementById('m-edit-end').value;
    trip.photo = pendingPhoto;
    saveState();
    closeModal();
    navigate(`/trip/${trip.id}`);
  };
  document.getElementById('m-delete-trip').onclick = () => {
    if (!confirm(`Delete "${trip.name}"? This cannot be undone.`)) return;
    state.trips = state.trips.filter(t => t.id !== trip.id);
    saveState();
    closeModal();
    navigate('/');
  };
}

// ── Days Tab ───────────────────────────────────────────────
function renderDaysTab(root, trip) {
  const days = trip.days || [];
  root.innerHTML = `
    <div class="days-list">
      ${days.length === 0 ? `
        <div class="empty-state" style="padding:40px 0;">
          ${icons.calendar}
          <p>No days yet.<br>Tap below to add your first day.</p>
        </div>` :
        days.map((day, i) => {
          const count = day.entries?.length || 0;
          return `
            <div class="day-card" data-day="${esc(day.id)}">
              <div class="day-card-num">${i+1}</div>
              <div class="day-card-info">
                <div class="day-card-label">${esc(day.label)}</div>
                ${day.date ? `<div class="day-card-date">${formatDate(day.date)}</div>` : ''}
              </div>
              ${count > 0 ? `<span class="day-card-count">${count} entr${count===1?'y':'ies'}</span>` : ''}
              <div class="day-card-arrow">${icons.chevron}</div>
            </div>`;
        }).join('')
      }
    </div>
    <button class="add-day-row" id="btn-add-day">${icons.plus} Add Day</button>
    <div class="section-spacer"></div>
  `;

  root.querySelectorAll('.day-card').forEach(card => {
    card.onclick = () => navigate(`/trip/${trip.id}/day/${card.dataset.day}`);
  });
  root.querySelector('#btn-add-day').onclick = () => openAddDayModal(trip);
}

function openAddDayModal(trip) {
  const dayNum = (trip.days?.length || 0) + 1;
  const suggestLabel = `Day ${dayNum}`;
  openModal(`
    <div class="modal-title">Add Day</div>
    <div class="field">
      <label>Label</label>
      <input id="m-day-label" type="text" value="${esc(suggestLabel)}" maxlength="40">
    </div>
    <div class="field">
      <label>Date (optional)</label>
      <input id="m-day-date" type="date" value="${esc(trip.dateStart||'')}">
    </div>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" id="m-save-day">Add</button>
    </div>
  `);
  const save = () => {
    const label = document.getElementById('m-day-label').value.trim() || suggestLabel;
    if (!trip.days) trip.days = [];
    trip.days.push({ id: uid(), label, date: document.getElementById('m-day-date').value, entries: [] });
    saveState();
    closeModal();
    navigate(`/trip/${trip.id}`);
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
      <button class="btn-icon" id="btn-back" aria-label="Back">${icons.back}</button>
      <div>
        <div class="header-title">${esc(day.label)}</div>
        ${day.date ? `<div class="header-subtitle">${formatDate(day.date)}</div>` : ''}
      </div>
      <button class="btn-icon" id="btn-day-menu" aria-label="More">${icons.more}</button>
    </div>
    <div class="scroll-area" style="flex:1;">
      <div class="entries-list" id="entries-list">
        ${(day.entries||[]).map(e => renderEntry(e)).join('')}
      </div>
      <button class="add-entry-row" id="btn-add-entry">${icons.plus} Add Entry</button>
      <div class="section-spacer"></div>
    </div>
  `;
  root.appendChild(el);

  el.querySelector('#btn-back').onclick = () => navigate(`/trip/${tripId}`);
  el.querySelector('#btn-day-menu').onclick = () => openDayMenu(trip, day);
  el.querySelector('#btn-add-entry').onclick = () => openAddEntryModal(trip, day, el);
  bindEntryEvents(el, trip, day);
}

function renderEntry(entry) {
  if (entry.type === 'note') {
    return `
      <div class="entry-card" data-entry="${esc(entry.id)}">
        <div class="entry-header">
          <span class="entry-type-badge">Note</span>
          <button class="entry-delete" data-del="${esc(entry.id)}" aria-label="Delete">${icons.trash}</button>
        </div>
        <textarea class="entry-textarea" data-save="${esc(entry.id)}" rows="3" placeholder="Write something…">${esc(entry.content)}</textarea>
      </div>`;
  }
  if (entry.type === 'checklist') {
    const items = entry.items || [];
    return `
      <div class="entry-card" data-entry="${esc(entry.id)}">
        <div class="entry-header">
          <span class="entry-type-badge checklist">Checklist</span>
          <button class="entry-delete" data-del="${esc(entry.id)}" aria-label="Delete">${icons.trash}</button>
        </div>
        <input class="checklist-title-input" type="text" data-title="${esc(entry.id)}" value="${esc(entry.title)}" placeholder="List title…">
        <div class="checklist-items" id="cl-items-${esc(entry.id)}">
          ${items.map(item => renderChecklistItem(entry.id, item)).join('')}
        </div>
        <button class="checklist-add-item" data-add-item="${esc(entry.id)}">${icons.plus} Add item</button>
      </div>`;
  }
  return '';
}

function renderChecklistItem(entryId, item) {
  return `
    <div class="checklist-item" data-item="${esc(item.id)}">
      <input type="checkbox" ${item.done ? 'checked' : ''} data-check="${esc(entryId)}|${esc(item.id)}">
      <input type="text" class="checklist-item-text ${item.done?'done':''}" value="${esc(item.text)}" placeholder="Item…" data-item-text="${esc(entryId)}|${esc(item.id)}">
      <button class="checklist-item-del" data-del-item="${esc(entryId)}|${esc(item.id)}" aria-label="Remove">${icons.trash}</button>
    </div>`;
}

function bindEntryEvents(root, trip, day) {
  const list = root.querySelector('#entries-list');
  if (!list) return;

  // Auto-save note textarea on input
  list.addEventListener('input', e => {
    const ta = e.target.closest('[data-save]');
    if (ta) {
      const entry = day.entries.find(en => en.id === ta.dataset.save);
      if (entry) { entry.content = ta.value; saveState(); }
    }
    const ti = e.target.closest('[data-title]');
    if (ti) {
      const entry = day.entries.find(en => en.id === ti.dataset.title);
      if (entry) { entry.title = ti.value; saveState(); }
    }
    const it = e.target.closest('[data-item-text]');
    if (it) {
      const [eid, iid] = it.dataset.itemText.split('|');
      const entry = day.entries.find(en => en.id === eid);
      const item = entry?.items?.find(i => i.id === iid);
      if (item) { item.text = it.value; saveState(); }
    }
  });

  // Checkbox toggle
  list.addEventListener('change', e => {
    const cb = e.target.closest('[data-check]');
    if (cb) {
      const [eid, iid] = cb.dataset.check.split('|');
      const entry = day.entries.find(en => en.id === eid);
      const item = entry?.items?.find(i => i.id === iid);
      if (item) {
        item.done = cb.checked;
        saveState();
        const textEl = cb.parentElement.querySelector('.checklist-item-text');
        if (textEl) textEl.classList.toggle('done', item.done);
      }
    }
  });

  // Delete entry
  list.addEventListener('click', e => {
    const delBtn = e.target.closest('[data-del]');
    if (delBtn) {
      day.entries = day.entries.filter(en => en.id !== delBtn.dataset.del);
      saveState();
      delBtn.closest('.entry-card').remove();
      return;
    }
    // Delete checklist item
    const delItem = e.target.closest('[data-del-item]');
    if (delItem) {
      const [eid, iid] = delItem.dataset.delItem.split('|');
      const entry = day.entries.find(en => en.id === eid);
      if (entry) {
        entry.items = entry.items.filter(i => i.id !== iid);
        saveState();
        delItem.closest('.checklist-item').remove();
      }
      return;
    }
    // Add checklist item
    const addItem = e.target.closest('[data-add-item]');
    if (addItem) {
      const eid = addItem.dataset.addItem;
      const entry = day.entries.find(en => en.id === eid);
      if (entry) {
        const item = { id: uid(), text: '', done: false };
        if (!entry.items) entry.items = [];
        entry.items.push(item);
        saveState();
        const container = list.querySelector(`#cl-items-${eid}`);
        if (container) {
          container.insertAdjacentHTML('beforeend', renderChecklistItem(eid, item));
          const newInput = container.lastElementChild.querySelector('input[type="text"]');
          if (newInput) newInput.focus();
        }
      }
    }
  });
}

function openAddEntryModal(trip, day, root) {
  openModal(`
    <div class="modal-title">Add Entry</div>
    <div class="option-list">
      <button class="option-item" id="opt-note">
        <div class="option-icon">${icons.note}</div>
        <div>
          <div class="option-label">Note</div>
          <div class="option-desc">Free text, plans, ideas, reminders</div>
        </div>
      </button>
      <button class="option-item" id="opt-checklist">
        <div class="option-icon yellow">${icons.check}</div>
        <div>
          <div class="option-label">Checklist</div>
          <div class="option-desc">Packing list, tasks, items to do</div>
        </div>
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
      // event delegation already active on list — no rebind needed
      const ta = list.lastElementChild?.querySelector('textarea');
      if (ta) ta.focus();
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
      const ti = list.lastElementChild?.querySelector('.checklist-title-input');
      if (ti) ti.focus();
    }
  };
}

function openDayMenu(trip, day) {
  openModal(`
    <div class="modal-title">Edit Day</div>
    <div class="field">
      <label>Label</label>
      <input id="m-edit-day-label" type="text" value="${esc(day.label)}" maxlength="40">
    </div>
    <div class="field">
      <label>Date</label>
      <input id="m-edit-day-date" type="date" value="${esc(day.date||'')}">
    </div>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" id="m-save-day-edit">Save</button>
    </div>
    <button class="btn-danger" id="m-del-day">Delete Day</button>
  `);
  document.getElementById('m-save-day-edit').onclick = () => {
    day.label = document.getElementById('m-edit-day-label').value.trim() || day.label;
    day.date = document.getElementById('m-edit-day-date').value;
    saveState();
    closeModal();
    navigate(`/trip/${trip.id}/day/${day.id}`);
  };
  document.getElementById('m-del-day').onclick = () => {
    if (!confirm(`Delete "${day.label}"?`)) return;
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
        ${icons.upload}
        <span>Upload Ticket / Screenshot</span>
      </label>
      <input type="file" id="ticket-file-input" accept="image/*,application/pdf" multiple>
      ${(trip.tickets||[]).map(t => renderTicketCard(t)).join('')}
    </div>
    <div class="section-spacer"></div>
  `;

  root.querySelector('#ticket-file-input').onchange = e => handleTicketUpload(e, trip, root);

  root.querySelectorAll('[data-ticket-del]').forEach(btn => {
    btn.onclick = ev => {
      ev.stopPropagation();
      const id = btn.dataset.ticketDel;
      trip.tickets = trip.tickets.filter(t => t.id !== id);
      saveState();
      btn.closest('.ticket-card').remove();
    };
  });

  root.querySelectorAll('.ticket-card[data-ticket-open]').forEach(card => {
    card.onclick = () => openTicket(trip.tickets.find(t => t.id === card.dataset.ticketOpen));
  });
}

function renderTicketCard(t) {
  const isImage = t.fileType?.startsWith('image/');
  const icon = isImage
    ? `<div class="ticket-icon"><img src="${t.data}" alt="${esc(t.name)}"></div>`
    : `<div class="ticket-icon">${icons.file}</div>`;
  return `
    <div class="ticket-card" data-ticket-open="${esc(t.id)}">
      ${icon}
      <div class="ticket-info">
        <div class="ticket-name">${esc(t.name)}</div>
        <div class="ticket-meta">${esc(t.fileType)} · ${esc(t.sizeFmt)}</div>
      </div>
      <button class="ticket-del" data-ticket-del="${esc(t.id)}" aria-label="Delete">${icons.trash}</button>
    </div>`;
}

function handleTicketUpload(e, trip, root) {
  const files = Array.from(e.target.files);
  if (!files.length) return;
  let loaded = 0;
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = ev => {
      const ticket = {
        id: uid(),
        name: file.name,
        fileType: file.type,
        sizeFmt: formatBytes(file.size),
        data: ev.target.result,
      };
      if (!trip.tickets) trip.tickets = [];
      trip.tickets.push(ticket);
      saveState();
      const list = root.querySelector('.tickets-list');
      list.insertAdjacentHTML('beforeend', renderTicketCard(ticket));
      // rebind events for new card
      const card = list.lastElementChild;
      card.onclick = () => openTicket(ticket);
      const delBtn = card.querySelector('[data-ticket-del]');
      if (delBtn) delBtn.onclick = ev => {
        ev.stopPropagation();
        trip.tickets = trip.tickets.filter(t => t.id !== ticket.id);
        saveState();
        card.remove();
      };
      loaded++;
      if (loaded === files.length) showToast(`${loaded} file${loaded>1?'s':''} added`);
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

function openTicket(ticket) {
  if (!ticket) return;
  const a = document.createElement('a');
  a.href = ticket.data;
  a.target = '_blank';
  a.rel = 'noopener';
  // For PDFs open in new tab; for images too
  a.click();
}

// ── Map Tab ────────────────────────────────────────────────
let _map = null;
let _routeLayer = null;
let _locationMarker = null;
let _watchId = null;
let _areaRect = null;

function renderMapTab(root, trip) {
  // Keep flex:1 from scroll-area but disable scrolling so map fills height
  root.style.overflowY = 'hidden';
  root.innerHTML = `
    <div class="map-container">
      <div id="map"></div>
      ${trip.gpx ? `<div class="gpx-filename">${esc(trip.gpx.filename)}</div>` : ''}
    </div>
    <div class="map-toolbar">
      <button class="map-btn" id="btn-gpx">
        ${icons.gpx}<span>GPX</span>
      </button>
      <button class="map-btn" id="btn-locate">
        ${icons.locate}<span>Location</span>
      </button>
      <button class="map-btn" id="btn-offline">
        ${icons.upload}<span>Save offline</span>
      </button>
      ${trip.gpx ? `<button class="map-btn" id="btn-clear-gpx">${icons.trash}<span>Clear</span></button>` : ''}
    </div>
    <input type="file" id="gpx-file-input" accept=".gpx,application/gpx+xml,text/xml">
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
    const label = root.querySelector('.gpx-filename');
    if (label) label.remove();
    showToast('Route cleared');
  };

  // Init map after DOM is painted
  requestAnimationFrame(() => initMap(trip));
}

function initMap(trip) {
  if (_map) { _map.remove(); _map = null; _routeLayer = null; _locationMarker = null; _areaRect = null; }

  _map = L.map('map', {
    zoomControl: true,
    attributionControl: true,
  }).setView([47.5, 10.5], 10); // default: Allgäu area

  // OSM tile layer — structured so provider can be swapped for offline support
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
    // For offline support: replace with a local tile server URL
    // e.g. 'http://localhost:8080/tiles/{z}/{x}/{y}.png'
  }).addTo(_map);

  if (trip.gpx) {
    const points = parseGPX(trip.gpx.data);
    if (points.length > 0) {
      _routeLayer = L.polyline(points, { color: '#2d6a4f', weight: 4, opacity: .85 }).addTo(_map);
      _map.fitBounds(_routeLayer.getBounds(), { padding: [24, 24] });
    }
  }
}

function handleGpxUpload(e, trip, root) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const xml = ev.target.result;
    const points = parseGPX(xml);
    if (points.length === 0) { showToast('No track points found in GPX'); return; }
    trip.gpx = { filename: file.name, data: xml };
    saveState();

    if (_routeLayer) { _map.removeLayer(_routeLayer); }
    _routeLayer = L.polyline(points, { color: '#2d6a4f', weight: 4, opacity: .85 }).addTo(_map);
    _map.fitBounds(_routeLayer.getBounds(), { padding: [24, 24] });
    showToast(`Route loaded: ${points.length} points`);

    // Update filename label
    let label = root.querySelector('.gpx-filename');
    if (!label) {
      root.querySelector('.map-container').insertAdjacentHTML('beforeend',
        `<div class="gpx-filename">${esc(file.name)}</div>`);
    } else {
      label.textContent = file.name;
    }
    // Show clear button if not there
    if (!root.querySelector('#btn-clear-gpx')) {
      const toolbar = root.querySelector('.map-toolbar');
      toolbar.insertAdjacentHTML('beforeend',
        `<button class="map-btn" id="btn-clear-gpx">${icons.trash}<span>Clear</span></button>`);
      root.querySelector('#btn-clear-gpx').onclick = () => {
        trip.gpx = null;
        saveState();
        if (_routeLayer) { _map.removeLayer(_routeLayer); _routeLayer = null; }
        root.querySelector('#btn-clear-gpx').remove();
        root.querySelector('.gpx-filename')?.remove();
        showToast('Route cleared');
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

  // Try track points, then route points, then waypoints
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
  if (!navigator.geolocation) { showToast('Geolocation not supported'); return; }
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
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
        _locationMarker = L.marker(latlng, { icon: dot }).addTo(_map);
        _map.setView(latlng, Math.max(_map.getZoom(), 14));
      }
    },
    err => {
      showToast('Location unavailable');
      btn.classList.remove('active');
      _watchId = null;
    },
    { enableHighAccuracy: true, maximumAge: 5000 }
  );
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
  const subdomains = ['a', 'b', 'c'];
  for (let z = minZ; z <= maxZ; z++) {
    const sw = lngLatToTile(bounds.getSouth(), bounds.getWest(), z);
    const ne = lngLatToTile(bounds.getNorth(), bounds.getEast(), z);
    const x0 = Math.min(sw.x, ne.x), x1 = Math.max(sw.x, ne.x);
    const y0 = Math.min(sw.y, ne.y), y1 = Math.max(sw.y, ne.y);
    for (let x = x0; x <= x1; x++) {
      for (let y = y0; y <= y1; y++) {
        const s = subdomains[(x + y) % 3];
        urls.push(`https://${s}.tile.openstreetmap.org/${z}/${x}/${y}.png`);
      }
    }
  }
  return urls;
}

function renderSavedAreas(trip, container) {
  const areas = trip.offlineAreas || [];
  if (areas.length === 0) {
    container.innerHTML = `<p class="offline-empty">No areas saved yet.</p>`;
    return;
  }
  container.innerHTML = areas.map(a => `
    <div class="offline-area-row">
      <button class="offline-area-body" data-fly-area="${esc(a.id)}">
        <div class="offline-area-name">${esc(a.label)}</div>
        <div class="offline-area-meta">z${a.minZ}–${a.maxZ} · ${a.tileCount} tiles · ${new Date(a.savedAt).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</div>
        <div class="offline-area-hint">${icons.map} Show on map</div>
      </button>
      <button class="offline-area-del" data-del-area="${esc(a.id)}" aria-label="Delete">${icons.trash}</button>
    </div>
  `).join('');

  container.querySelectorAll('[data-fly-area]').forEach(btn => {
    btn.onclick = () => {
      const area = (trip.offlineAreas || []).find(a => a.id === btn.dataset.flyArea);
      if (area) flyToOfflineArea(area);
    };
  });

  container.querySelectorAll('[data-del-area]').forEach(btn => {
    btn.onclick = async e => {
      e.stopPropagation();
      const areaId = btn.dataset.delArea;
      const area = (trip.offlineAreas || []).find(a => a.id === areaId);
      if (!area) return;
      const b = area.bounds;
      const fakeBounds = {
        getSouth: () => b.south, getWest: () => b.west,
        getNorth: () => b.north, getEast: () => b.east,
      };
      const urls = getTileUrls(fakeBounds, area.minZ, area.maxZ);
      const cache = await caches.open('wandern-v1');
      await Promise.all(urls.map(u => cache.delete(u)));
      trip.offlineAreas = trip.offlineAreas.filter(a => a.id !== areaId);
      saveState();
      btn.closest('.offline-area-row').remove();
      if (!container.querySelector('.offline-area-row')) {
        container.innerHTML = `<p class="offline-empty">No areas saved yet.</p>`;
      }
      showToast('Area deleted');
    };
  });
}

function flyToOfflineArea(area) {
  closeModal();
  if (!_map) return;
  const b = area.bounds;
  const leafletBounds = [[b.south, b.west], [b.north, b.east]];
  if (_areaRect) { _map.removeLayer(_areaRect); }
  _areaRect = L.rectangle(leafletBounds, {
    color: '#2d6a4f',
    weight: 2,
    fillColor: '#74c69d',
    fillOpacity: 0.12,
    dashArray: '6,4',
  }).addTo(_map);
  _map.fitBounds(leafletBounds, { padding: [24, 24] });
}

function openOfflineModal(trip) {
  if (!_map) return;
  const bounds = _map.getBounds();
  const zoom = _map.getZoom();
  const minZ = Math.max(6, zoom - 2);
  const maxZ = Math.min(16, zoom + 2);

  const countTiles = (mn, mx) => getTileUrls(bounds, mn, mx).length;

  openModal(`
    <div class="modal-title">Offline Maps</div>

    <div class="offline-section-label">Saved areas</div>
    <div id="m-saved-areas" class="offline-areas-list"></div>

    <div class="offline-section-label" style="margin-top:16px;">Download visible area</div>
    <div class="field" style="padding-top:6px;">
      <label style="font-size:.8rem;color:var(--text-muted);font-weight:400;">Pan and zoom the map to your hiking region first, then download.</label>
    </div>
    <div class="field">
      <label>Name</label>
      <input id="m-area-name" type="text" placeholder="e.g. Jotunheimen North" maxlength="50">
    </div>
    <div class="field">
      <label>Zoom range <span style="font-weight:400;color:var(--text-muted)">(higher = more detail, more data)</span></label>
      <div style="display:flex;gap:8px;align-items:center;">
        <select id="m-minz" style="flex:1;padding:10px;border:1.5px solid var(--border);border-radius:8px;font-size:.93rem;background:var(--bg)">
          ${[8,9,10,11,12,13,14].map(z => `<option value="${z}" ${z===minZ?'selected':''}>${z}</option>`).join('')}
        </select>
        <span style="color:var(--text-muted)">to</span>
        <select id="m-maxz" style="flex:1;padding:10px;border:1.5px solid var(--border);border-radius:8px;font-size:.93rem;background:var(--bg)">
          ${[10,11,12,13,14,15,16].map(z => `<option value="${z}" ${z===maxZ?'selected':''}>${z}</option>`).join('')}
        </select>
      </div>
      <div id="m-tile-count" style="font-size:.8rem;color:var(--text-muted);margin-top:6px;">~${countTiles(minZ, maxZ)} tiles</div>
    </div>
    <div id="m-dl-progress" style="display:none;padding:0 20px 8px;">
      <div style="font-size:.85rem;color:var(--text-soft);margin-bottom:6px;" id="m-dl-status">Downloading…</div>
      <div style="background:var(--border);border-radius:4px;height:6px;overflow:hidden;">
        <div id="m-dl-bar" style="background:var(--green);height:100%;width:0%;transition:width .2s;"></div>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn-secondary" id="m-dl-cancel" onclick="closeModal()">Close</button>
      <button class="btn-primary" id="m-dl-start">Download</button>
    </div>
  `);

  renderSavedAreas(trip, document.getElementById('m-saved-areas'));

  const updateCount = () => {
    const mn = parseInt(document.getElementById('m-minz').value);
    const mx = parseInt(document.getElementById('m-maxz').value);
    if (mx < mn) return;
    document.getElementById('m-tile-count').textContent = `~${countTiles(mn, mx)} tiles`;
  };
  document.getElementById('m-minz').onchange = updateCount;
  document.getElementById('m-maxz').onchange = updateCount;

  document.getElementById('m-dl-start').onclick = async () => {
    const mn = parseInt(document.getElementById('m-minz').value);
    const mx = parseInt(document.getElementById('m-maxz').value);
    if (mx < mn) { showToast('Max zoom must be ≥ min zoom'); return; }
    const label = document.getElementById('m-area-name').value.trim()
      || `Area ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
    const urls = getTileUrls(bounds, mn, mx);
    if (urls.length > 8000) {
      if (!confirm(`${urls.length} tiles (~${Math.round(urls.length * 25 / 1024)} MB). Continue?`)) return;
    }

    document.getElementById('m-dl-start').disabled = true;
    document.getElementById('m-dl-progress').style.display = 'block';
    const bar = document.getElementById('m-dl-bar');
    const status = document.getElementById('m-dl-status');

    let done = 0, failed = 0;
    const cache = await caches.open('wandern-v1');
    const BATCH = 6;

    for (let i = 0; i < urls.length; i += BATCH) {
      const batch = urls.slice(i, i + BATCH);
      await Promise.all(batch.map(async url => {
        try {
          if (!(await cache.match(url))) {
            const res = await fetch(url, { mode: 'cors' });
            if (res.ok) await cache.put(url, res);
          }
        } catch { failed++; }
        done++;
        bar.style.width = `${Math.round(done / urls.length * 100)}%`;
        status.textContent = `${done} / ${urls.length} tiles saved`;
      }));
    }

    const success = done - failed;
    status.textContent = failed > 0 ? `Done — ${success} saved, ${failed} failed` : `All ${done} tiles saved`;
    bar.style.background = failed > 0 ? '#f59e0b' : 'var(--green)';
    document.getElementById('m-dl-start').disabled = false;

    if (success > 0) {
      const area = {
        id: uid(),
        label,
        bounds: { south: bounds.getSouth(), west: bounds.getWest(), north: bounds.getNorth(), east: bounds.getEast() },
        minZ: mn, maxZ: mx,
        tileCount: success,
        savedAt: Date.now(),
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
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

handleRoute();
