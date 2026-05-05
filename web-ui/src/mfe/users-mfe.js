/* ─── Users Micro Frontend ─────────────────────────────────────────────────
 *  Odgovoren za: avtentikacijo, registracijo in upravljanje seje.
 *  Komunicira z BookingsMFE prek EventBus:
 *    emitira  → user:login  (ob uspešni prijavi)
 *    emitira  → user:logout (ob odjavi)
 * ───────────────────────────────────────────────────────────────────────── */

(function () {
  const USERS_API = '/api/users';
  let _bus;
  let currentUser = null;

  /* ── Stanje prijave ─────────────────────────────────────────────────── */

  function setLoggedIn(user) {
    currentUser = user;
    document.getElementById('authButtons').style.display = 'none';
    document.getElementById('userMenu').style.display    = 'flex';
    document.getElementById('userBadge').textContent     = '👤 ' + user.username;
    document.getElementById('navBookings').style.display = 'inline';
    _bus.emit('user:login', user);
  }

  function logout() {
    currentUser = null;
    document.getElementById('authButtons').style.display = 'flex';
    document.getElementById('userMenu').style.display    = 'none';
    document.getElementById('navBookings').style.display = 'none';
    _bus.emit('user:logout', null);
    showView('home');
  }

  /* ── Registracija ───────────────────────────────────────────────────── */

  async function register() {
    const username = document.getElementById('regUsername').value.trim();
    const email    = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const msgEl    = document.getElementById('registerMsg');
    try {
      const res = await fetch(`${USERS_API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Napaka pri registraciji');
      setMsg(msgEl, 'Uspešno! Prijavite se.', 'ok');
      setTimeout(() => switchModal('registerModal', 'loginModal'), 800);
    } catch (e) { setMsg(msgEl, e.message, 'err'); }
  }

  /* ── Prijava ────────────────────────────────────────────────────────── */

  async function login() {
    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const msgEl    = document.getElementById('loginMsg');
    try {
      const res = await fetch(`${USERS_API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Napačni podatki');
      const user = await res.json();
      setLoggedIn(user);
      closeModal('loginModal');
      setMsg(msgEl, '', '');
    } catch (e) { setMsg(msgEl, e.message, 'err'); }
  }

  /* ── Pomočniki ──────────────────────────────────────────────────────── */

  function openModal(id)  { document.getElementById(id).classList.add('open'); }
  function closeModal(id) { document.getElementById(id).classList.remove('open'); }
  function closeModalOutside(e, id) { if (e.target.id === id) closeModal(id); }
  function switchModal(from, to) { closeModal(from); openModal(to); }
  function setMsg(el, text, type) { el.textContent = text; el.className = 'msg ' + type; }
  function requireAuth(fn) { if (currentUser) fn(); else openModal('loginModal'); }

  /* ── Globalni izvoz (klicani iz HTML onclick in BookingsMFE) ────────── */
  window.login             = login;
  window.register          = register;
  window.logout            = logout;
  window.requireAuth       = requireAuth;
  window.openModal         = openModal;
  window.closeModal        = closeModal;
  window.closeModalOutside = closeModalOutside;
  window.switchModal       = switchModal;
  window.getCurrentUser    = () => currentUser;

  /* ── MFE registracija ───────────────────────────────────────────────── */
  registerMFE('users', {
    mount(bus) {
      _bus = bus;
      console.log('[UsersMFE] mounted');
    },
    unmount() {
      _bus = null;
      console.log('[UsersMFE] unmounted');
    },
  });
})();
