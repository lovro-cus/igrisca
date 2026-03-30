/* ── Config ───────────────────────────────────────────────────────────── */
const BOOKINGS_API = "/api/bookings";
const USERS_API    = "/api/users";

/* ── Field definitions ────────────────────────────────────────────────── */
const FIELDS = [
  { id: "field-1",        name: "Multi-sport 1",    cat: "multi",  emoji: "⚽", desc: "Večnamensko igrišče" },
  { id: "field-2",        name: "Multi-sport 2",    cat: "multi",  emoji: "⚽", desc: "Večnamensko igrišče" },
  { id: "field-3",        name: "Multi-sport 3",    cat: "multi",  emoji: "⚽", desc: "Večnamensko igrišče" },
  { id: "field-4",        name: "Multi-sport 4",    cat: "multi",  emoji: "⚽", desc: "Večnamensko igrišče" },
  { id: "tennis-court-1", name: "Teniško igrišče 1", cat: "tennis", emoji: "🎾", desc: "Trda podlaga" },
  { id: "tennis-court-2", name: "Teniško igrišče 2", cat: "tennis", emoji: "🎾", desc: "Trda podlaga" },
  { id: "tennis-court-3", name: "Teniško igrišče 3", cat: "tennis", emoji: "🎾", desc: "Peščena podlaga" },
  { id: "paddle-court-1", name: "Padel igrišče 1",   cat: "paddle", emoji: "🏓", desc: "Kristalno steklo" },
  { id: "paddle-court-2", name: "Padel igrišče 2",   cat: "paddle", emoji: "🏓", desc: "Kristalno steklo" },
  { id: "paddle-court-3", name: "Padel igrišče 3",   cat: "paddle", emoji: "🏓", desc: "Panoramski pogled" },
];

const DATES = [
  { iso: "2026-04-04", label: "Sob, 4. apr" },
  { iso: "2026-04-05", label: "Ned, 5. apr" },
  { iso: "2026-04-11", label: "Sob, 11. apr" },
  { iso: "2026-04-12", label: "Ned, 12. apr" },
  { iso: "2026-04-18", label: "Sob, 18. apr" },
  { iso: "2026-04-19", label: "Ned, 19. apr" },
  { iso: "2026-04-25", label: "Sob, 25. apr" },
  { iso: "2026-04-26", label: "Ned, 26. apr" },
];

/* ── State ────────────────────────────────────────────────────────────── */
let currentUser     = null;
let activeFilter    = "all";
let activeDate      = DATES[0].iso;
let pendingBooking  = null;   // { fieldId, fieldName, date, timeSlot }

/* ── Views ────────────────────────────────────────────────────────────── */
function showView(name, catFilter) {
  document.querySelectorAll("[id^='view-']").forEach(el => el.style.display = "none");
  const el = document.getElementById("view-" + name);
  if (el) el.style.display = "block";

  if (name === "fields") {
    renderDateChips();
    if (catFilter) filterFields(catFilter, document.querySelector(`.tab[data-cat="${catFilter}"]`));
    else renderFields();
  }
  if (name === "my-bookings") loadMyBookings();
}

function requireAuth(fn) {
  if (currentUser) fn();
  else openModal("loginModal");
}

/* ── Date chips ───────────────────────────────────────────────────────── */
function renderDateChips() {
  const container = document.getElementById("dateChips");
  container.innerHTML = DATES.map(d => `
    <button class="date-chip ${d.iso === activeDate ? 'active' : ''}"
            onclick="selectDate('${d.iso}', this)">${d.label}</button>
  `).join("");
}

function selectDate(iso, el) {
  activeDate = iso;
  document.querySelectorAll(".date-chip").forEach(c => c.classList.remove("active"));
  if (el) el.classList.add("active");
  renderFields();
}

/* ── Fields ───────────────────────────────────────────────────────────── */
function filterFields(cat, el) {
  activeFilter = cat;
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  if (el) el.classList.add("active");
  renderFields();
}

function renderFields() {
  const grid = document.getElementById("fieldsGrid");
  const list = activeFilter === "all" ? FIELDS : FIELDS.filter(f => f.cat === activeFilter);
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
  `).join("");
}

/* ── Booking view ─────────────────────────────────────────────────────── */
async function openBookingView(fieldId, fieldName) {
  document.getElementById("bookingFieldName").textContent = fieldName;
  const dateObj = DATES.find(d => d.iso === activeDate);
  document.getElementById("bookingDateLabel").textContent = dateObj ? dateObj.label : activeDate;

  showView("booking");
  const grid = document.getElementById("slotsGrid");
  grid.innerHTML = `<p class="slots-empty">Nalagam termine…</p>`;

  const slots = await fetchSlots(fieldId, activeDate);
  if (!slots.length) {
    grid.innerHTML = `<div class="slots-empty">😔 Ni prostih terminov za ta datum.</div>`;
    return;
  }
  grid.innerHTML = slots.map(s => `
    <button class="slot-btn" onclick="openConfirm('${fieldId}','${fieldName}','${activeDate}','${s.timeSlot}')">
      ${s.timeSlot}
    </button>
  `).join("");
}

async function fetchSlots(fieldId, date) {
  try {
    const res = await fetch(`${BOOKINGS_API}/available?fieldId=${encodeURIComponent(fieldId)}&date=${encodeURIComponent(date)}`);
    return await res.json();
  } catch { return []; }
}

/* ── Confirm modal ────────────────────────────────────────────────────── */
function openConfirm(fieldId, fieldName, date, timeSlot) {
  if (!currentUser) { openModal("loginModal"); return; }
  pendingBooking = { fieldId, fieldName, date, timeSlot };
  const dateLabel = DATES.find(d => d.iso === date)?.label || date;
  document.getElementById("confirmDetails").innerHTML = `
    <div>🏟️ <strong>Igrišče:</strong> ${fieldName}</div>
    <div>📅 <strong>Datum:</strong> ${dateLabel}</div>
    <div>⏰ <strong>Termin:</strong> ${timeSlot}</div>
    <div>👤 <strong>Uporabnik:</strong> ${currentUser.username}</div>
  `;
  document.getElementById("confirmMsg").textContent = "";
  openModal("confirmModal");
}

async function confirmBooking() {
  if (!pendingBooking || !currentUser) return;
  const msgEl = document.getElementById("confirmMsg");
  try {
    const res = await fetch(BOOKINGS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId:   String(currentUser.id),
        fieldId:  pendingBooking.fieldId,
        date:     pendingBooking.date,
        timeSlot: pendingBooking.timeSlot,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Napaka pri rezervaciji");
    closeModal("confirmModal");
    pendingBooking = null;
    // Osveži termine (slot izgine)
    openBookingView(data.fieldId || "", document.getElementById("bookingFieldName").textContent);
    showView("my-bookings");
  } catch (e) {
    setMsg(msgEl, e.message, "err");
  }
}

/* ── My bookings ──────────────────────────────────────────────────────── */
async function loadMyBookings() {
  const listEl = document.getElementById("myBookingsList");
  listEl.innerHTML = `<p class="msg">Nalagam…</p>`;
  try {
    const res = await fetch(`${BOOKINGS_API}/user/${currentUser.id}`);
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
    const active    = bookings.filter(b => b.status === "active");
    const cancelled = bookings.filter(b => b.status !== "active");
    const renderCard = b => {
      const field = FIELDS.find(f => f.id === b.fieldId);
      const dateLabel = DATES.find(d => d.iso === b.date)?.label || b.date;
      return `
        <div class="booking-card">
          <div class="booking-info">
            <strong>${field ? field.emoji + " " + field.name : b.fieldId}</strong>
            <span class="meta">📅 ${dateLabel} &nbsp;·&nbsp; ⏰ ${b.timeSlot}</span>
            <span class="badge badge-${b.status}">${b.status === "active" ? "Aktivna" : "Preklicana"}</span>
          </div>
          ${b.status === "active" ? `<button class="btn btn-danger btn-sm" onclick="cancelBooking('${b.id}')">Prekliči</button>` : ""}
        </div>`;
    };
    listEl.innerHTML = `<div class="booking-list">${[...active, ...cancelled].map(renderCard).join("")}</div>`;
  } catch (e) {
    listEl.innerHTML = `<p class="msg err">${e.message}</p>`;
  }
}

async function cancelBooking(id) {
  if (!confirm("Res želite preklicati to rezervacijo?")) return;
  try {
    const res = await fetch(`${BOOKINGS_API}/${id}/cancel`, { method: "PATCH" });
    if (!res.ok) throw new Error("Napaka pri preklicu");
    loadMyBookings();
  } catch (e) { alert(e.message); }
}

/* ── Auth ─────────────────────────────────────────────────────────────── */
async function register() {
  const username = document.getElementById("regUsername").value.trim();
  const email    = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value;
  const msgEl    = document.getElementById("registerMsg");
  try {
    const res = await fetch(`${USERS_API}/register`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    if (!res.ok) throw new Error((await res.json()).error || "Napaka pri registraciji");
    setMsg(msgEl, "Uspešno! Prijavite se.", "ok");
    setTimeout(() => switchModal("registerModal", "loginModal"), 800);
  } catch (e) { setMsg(msgEl, e.message, "err"); }
}

async function login() {
  const email    = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const msgEl    = document.getElementById("loginMsg");
  try {
    const res = await fetch(`${USERS_API}/login`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Napačni podatki");
    const user = await res.json();
    setLoggedIn(user);
    closeModal("loginModal");
    setMsg(msgEl, "", "");
  } catch (e) { setMsg(msgEl, e.message, "err"); }
}

function setLoggedIn(user) {
  currentUser = user;
  document.getElementById("authButtons").style.display = "none";
  document.getElementById("userMenu").style.display    = "flex";
  document.getElementById("userBadge").textContent     = "👤 " + user.username;
  document.getElementById("navBookings").style.display = "inline";
}

function logout() {
  currentUser = null;
  document.getElementById("authButtons").style.display = "flex";
  document.getElementById("userMenu").style.display    = "none";
  document.getElementById("navBookings").style.display = "none";
  showView("home");
}

/* ── Modals ───────────────────────────────────────────────────────────── */
function openModal(id)  { document.getElementById(id).classList.add("open"); }
function closeModal(id) { document.getElementById(id).classList.remove("open"); }
function closeModalOutside(e, id) { if (e.target.id === id) closeModal(id); }
function switchModal(from, to) { closeModal(from); openModal(to); }

/* ── Helper ───────────────────────────────────────────────────────────── */
function setMsg(el, text, type) { el.textContent = text; el.className = "msg " + type; }

/* ── Init ─────────────────────────────────────────────────────────────── */
showView("home");
