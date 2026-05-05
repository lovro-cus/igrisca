/* ─── Bookings Micro Frontend ──────────────────────────────────────────────
 *  Odgovoren za: prikaz igrišč, razpoložljivost terminov, rezervacije.
 *  Komunicira s UsersMFE prek EventBus:
 *    posluša → user:login  (posodobi referenco na prijavljenega uporabnika)
 *    posluša → user:logout (počisti referenco)
 *    posluša → navigate    (nalaga vsebino ob menjavi pogleda)
 * ───────────────────────────────────────────────────────────────────────── */

(function () {
  const BOOKINGS_API = '/api/bookings';

  /* ── Podatki o igriščih ─────────────────────────────────────────────── */

  const FIELDS = [
    { id: 'field-1',        name: 'Multi-sport 1',     cat: 'multi',  emoji: '⚽', desc: 'Večnamensko igrišče' },
    { id: 'field-2',        name: 'Multi-sport 2',     cat: 'multi',  emoji: '⚽', desc: 'Večnamensko igrišče' },
    { id: 'field-3',        name: 'Multi-sport 3',     cat: 'multi',  emoji: '⚽', desc: 'Večnamensko igrišče' },
    { id: 'field-4',        name: 'Multi-sport 4',     cat: 'multi',  emoji: '⚽', desc: 'Večnamensko igrišče' },
    { id: 'tennis-court-1', name: 'Teniško igrišče 1', cat: 'tennis', emoji: '🎾', desc: 'Trda podlaga' },
    { id: 'tennis-court-2', name: 'Teniško igrišče 2', cat: 'tennis', emoji: '🎾', desc: 'Trda podlaga' },
    { id: 'tennis-court-3', name: 'Teniško igrišče 3', cat: 'tennis', emoji: '🎾', desc: 'Peščena podlaga' },
    { id: 'paddle-court-1', name: 'Padel igrišče 1',   cat: 'paddle', emoji: '🏓', desc: 'Kristalno steklo' },
    { id: 'paddle-court-2', name: 'Padel igrišče 2',   cat: 'paddle', emoji: '🏓', desc: 'Kristalno steklo' },
    { id: 'paddle-court-3', name: 'Padel igrišče 3',   cat: 'paddle', emoji: '🏓', desc: 'Panoramski pogled' },
  ];

  const DATES = [
    { iso: '2026-04-04', label: 'Sob, 4. apr' },
    { iso: '2026-04-05', label: 'Ned, 5. apr' },
    { iso: '2026-04-11', label: 'Sob, 11. apr' },
    { iso: '2026-04-12', label: 'Ned, 12. apr' },
    { iso: '2026-04-18', label: 'Sob, 18. apr' },
    { iso: '2026-04-19', label: 'Ned, 19. apr' },
    { iso: '2026-04-25', label: 'Sob, 25. apr' },
    { iso: '2026-04-26', label: 'Ned, 26. apr' },
  ];

  /* ── Stanje ─────────────────────────────────────────────────────────── */

  let activeFilter   = 'all';
  let activeDate     = DATES[0].iso;
  let pendingBooking = null;

  /* ── Datumski žetoni ────────────────────────────────────────────────── */

  function renderDateChips() {
    const container = document.getElementById('dateChips');
    container.innerHTML = DATES.map(d => `
      <button class="date-chip ${d.iso === activeDate ? 'active' : ''}"
              onclick="selectDate('${d.iso}', this)">${d.label}</button>
    `).join('');
  }

  function selectDate(iso, el) {
    activeDate = iso;
    document.querySelectorAll('.date-chip').forEach(c => c.classList.remove('active'));
    if (el) el.classList.add('active');
    renderFields();
  }

  /* ── Igrišča ────────────────────────────────────────────────────────── */

  function filterFields(cat, el) {
    activeFilter = cat;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    if (el) el.classList.add('active');
    renderFields();
  }

  function renderFields() {
    const grid = document.getElementById('fieldsGrid');
    const list = activeFilter === 'all' ? FIELDS : FIELDS.filter(f => f.cat === activeFilter);
    grid.innerHTML = list.map(f => `
      <div class="field-card" onclick="openBookingView('${f.id}','${f.name}')">
        <div class="field-card-header">
          <span class="field-emoji">${f.emoji}</span>
          <div>
            <h3>${f.name}</h3>
            <p>${f.desc}</p>
          </div>
        </div>
        <div class="field-card-body">
          <button class="btn btn-primary btn-sm" style="width:100%">Izberi termin →</button>
        </div>
      </div>
    `).join('');
  }

  /* ── Pogled rezervacije ─────────────────────────────────────────────── */

  async function openBookingView(fieldId, fieldName) {
    document.getElementById('bookingFieldName').textContent = fieldName;
    const dateObj = DATES.find(d => d.iso === activeDate);
    document.getElementById('bookingDateLabel').textContent = dateObj ? dateObj.label : activeDate;

    showView('booking');
    const grid = document.getElementById('slotsGrid');
    grid.innerHTML = '<p class="slots-empty">Nalagam termine…</p>';

    const slots = await fetchSlots(fieldId, activeDate);
    if (!slots.length) {
      grid.innerHTML = '<div class="slots-empty">😔 Ni prostih terminov za ta datum.</div>';
      return;
    }
    grid.innerHTML = slots.map(s => `
      <button class="slot-btn" onclick="openConfirm('${fieldId}','${fieldName}','${activeDate}','${s.timeSlot}')">
        ${s.timeSlot}
      </button>
    `).join('');
  }

  async function fetchSlots(fieldId, date) {
    try {
      const res = await fetch(`${BOOKINGS_API}/available?fieldId=${encodeURIComponent(fieldId)}&date=${encodeURIComponent(date)}`);
      return await res.json();
    } catch { return []; }
  }

  /* ── Potrditveni modal ──────────────────────────────────────────────── */

  function openConfirm(fieldId, fieldName, date, timeSlot) {
    const user = getCurrentUser();
    if (!user) { openModal('loginModal'); return; }
    pendingBooking = { fieldId, fieldName, date, timeSlot };
    const dateLabel = DATES.find(d => d.iso === date)?.label || date;
    document.getElementById('confirmDetails').innerHTML = `
      <div>🏟️ <strong>Igrišče:</strong> ${fieldName}</div>
      <div>📅 <strong>Datum:</strong> ${dateLabel}</div>
      <div>⏰ <strong>Termin:</strong> ${timeSlot}</div>
      <div>👤 <strong>Uporabnik:</strong> ${user.username}</div>
    `;
    document.getElementById('confirmMsg').textContent = '';
    openModal('confirmModal');
  }

  async function confirmBooking() {
    const user = getCurrentUser();
    if (!pendingBooking || !user) return;
    const msgEl = document.getElementById('confirmMsg');
    try {
      const res = await fetch(BOOKINGS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId:   String(user.id),
          fieldId:  pendingBooking.fieldId,
          date:     pendingBooking.date,
          timeSlot: pendingBooking.timeSlot,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Napaka pri rezervaciji');
      closeModal('confirmModal');
      pendingBooking = null;
      openBookingView(data.fieldId || '', document.getElementById('bookingFieldName').textContent);
      showView('my-bookings');
    } catch (e) {
      msgEl.textContent = e.message;
      msgEl.className = 'msg err';
    }
  }

  /* ── Moje rezervacije ───────────────────────────────────────────────── */

  async function loadMyBookings() {
    const user = getCurrentUser();
    const listEl = document.getElementById('myBookingsList');
    listEl.innerHTML = '<p class="msg">Nalagam…</p>';
    try {
      const res = await fetch(`${BOOKINGS_API}/user/${user.id}`);
      const bookings = await res.json();
      if (!bookings.length) {
        listEl.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">📋</div>
            <p>Nimate še nobene rezervacije.</p>
            <button class="btn btn-primary" style="margin-top:1rem" onclick="showView('fields')">Rezerviraj termin</button>
          </div>`;
        return;
      }
      const active    = bookings.filter(b => b.status === 'active');
      const cancelled = bookings.filter(b => b.status !== 'active');
      const renderCard = b => {
        const field     = FIELDS.find(f => f.id === b.fieldId);
        const dateLabel = DATES.find(d => d.iso === b.date)?.label || b.date;
        return `
          <div class="booking-card">
            <div class="booking-info">
              <strong>${field ? field.emoji + ' ' + field.name : b.fieldId}</strong>
              <span class="meta">📅 ${dateLabel} &nbsp;·&nbsp; ⏰ ${b.timeSlot}</span>
              <span class="badge badge-${b.status}">${b.status === 'active' ? 'Aktivna' : 'Preklicana'}</span>
            </div>
            ${b.status === 'active' ? `<button class="btn btn-danger btn-sm" onclick="cancelBooking('${b.id}')">Prekliči</button>` : ''}
          </div>`;
      };
      listEl.innerHTML = `<div class="booking-list">${[...active, ...cancelled].map(renderCard).join('')}</div>`;
    } catch (e) {
      listEl.innerHTML = `<p class="msg err">${e.message}</p>`;
    }
  }

  async function cancelBooking(id) {
    if (!confirm('Res želite preklicati to rezervacijo?')) return;
    try {
      const res = await fetch(`${BOOKINGS_API}/${id}/cancel`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Napaka pri preklicu');
      loadMyBookings();
    } catch (e) { alert(e.message); }
  }

  /* ── Globalni izvoz (klicani iz HTML onclick) ───────────────────────── */
  window.filterFields    = filterFields;
  window.selectDate      = selectDate;
  window.openBookingView = openBookingView;
  window.openConfirm     = openConfirm;
  window.confirmBooking  = confirmBooking;
  window.loadMyBookings  = loadMyBookings;
  window.cancelBooking   = cancelBooking;

  /* ── MFE registracija ───────────────────────────────────────────────── */
  registerMFE('bookings', {
    mount(bus) {
      bus.on('navigate', ({ view, extra }) => {
        if (view === 'fields') {
          renderDateChips();
          if (extra) filterFields(extra, document.querySelector(`.tab[data-cat="${extra}"]`));
          else renderFields();
        }
        if (view === 'my-bookings') loadMyBookings();
      });
      console.log('[BookingsMFE] mounted');
    },
    unmount() {
      console.log('[BookingsMFE] unmounted');
    },
  });
})();
