/* ─── SportField Shell ─────────────────────────────────────────────────────
 *  Orchestrira Micro Frontend module in zagotavlja skupno infrastrukturo.
 *  Vzorec: Shell / Orchestrator iz arhitekture Micro Frontends.
 *
 *  Odgovornosti:
 *    - EventBus: asinhroni komunikacijski kanal med MFE-ji
 *    - MFE Registry: centralni register vseh naloženih MFE-jev
 *    - Navigacija: skupna funkcija showView, ki obvesti vse MFE-je
 *    - Bootstrap: inicializira MFE-je po nalaganju DOM-a
 * ───────────────────────────────────────────────────────────────────────── */

/* EventBus – publish/subscribe za komunikacijo med MFE-ji */
const EventBus = (() => {
  const listeners = {};
  return {
    on(event, fn)     { (listeners[event] = listeners[event] || []).push(fn); },
    off(event, fn)    { listeners[event] = (listeners[event] || []).filter(f => f !== fn); },
    emit(event, data) { (listeners[event] || []).forEach(fn => fn(data)); },
  };
})();

/* MFE Registry – vsak MFE kliče registerMFE() ob nalaganju */
const MFERegistry = {};
function registerMFE(name, mfe) {
  MFERegistry[name] = mfe;
}

/* Skupna navigacija – posredovana vsem MFE-jem prek EventBus (navigate) */
function showView(name, extra) {
  document.querySelectorAll('[id^="view-"]').forEach(el => el.style.display = 'none');
  const el = document.getElementById('view-' + name);
  if (el) el.style.display = 'block';
  EventBus.emit('navigate', { view: name, extra });
}

/* Bootstrap – ko je DOM pripravljen, inicializira vse registrirane MFE-je */
document.addEventListener('DOMContentLoaded', () => {
  MFERegistry.users.mount(EventBus);
  MFERegistry.bookings.mount(EventBus);
  showView('home');
});
