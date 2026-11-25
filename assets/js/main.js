/* ==========================================================================
   Scholz & Partner, gemeinsames Script für alle Seiten
   Header, Footer, Öffnungsstatus, Icons, Produkt-Helfer.
   Firmendaten nur HIER pflegen, alle Seiten lesen daraus.
   ========================================================================== */
const SITE = {
  name: 'Scholz & Partner',
  sub: 'Elektro-Hausgeräte-Service',
  phone: '(02203) 540 41',
  phoneHref: 'tel:+49220354041',
  fax: '(02203) 540 43',
  email: 'info@scholz-hausgeraeteservice.de',
  street: 'Kaiserstraße 40',
  city: '51145 Köln-Porz',
  owner: 'Joachim Scholz',
  mapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Kaiserstra%C3%9Fe+40%2C+51145+K%C3%B6ln',
  reviewsUrl: 'https://www.google.com/maps/search/?api=1&query=Scholz+%26+Partner+Kaiserstra%C3%9Fe+40+K%C3%B6ln',
  facebook: 'https://www.facebook.com/scholzshop/',
  instagram: 'https://www.instagram.com/scholz.shop/',
  // [Wochentag 0=So..6=Sa] -> Zeitfenster in Minuten
  hours: {
    1: [[540, 780], [840, 1080]], 2: [[540, 780], [840, 1080]], 3: [[540, 780], [840, 1080]], 4: [[540, 780], [840, 1080]],
    5: [[540, 780], [840, 1020]], 6: [], 0: []
  },
  hoursText: [['Mo bis Do', '9:00–13:00 · 14:00–18:00'], ['Freitag', '9:00–13:00 · 14:00–17:00'], ['Sa & So', 'geschlossen']]
};

// Partner-Marken (Startseite-Laufband + Shop-Filter). Logo-Dateien später unter /assets/img/brands/ ablegen und hier "logo" ergänzen.
const BRANDS = [
  { name: 'Miele', url: 'https://www.miele.de' },
  { name: 'Bosch', url: 'https://www.bosch-home.com/de' },
  { name: 'Siemens', url: 'https://www.siemens-home.bsh-group.com/de' },
  { name: 'AEG', url: 'https://www.aeg.de' },
  { name: 'Liebherr', url: 'https://home.liebherr.com/de/' },
  { name: 'Grundig', url: 'https://www.grundig.com/de-de' },
  { name: 'Jura', url: 'https://www.jura.com/de-de' },
  { name: 'Nivona', url: 'https://www.nivona.com/de' },
  { name: 'Moccamaster', url: 'https://www.moccamaster.de' },
  { name: 'Graef', url: 'https://www.graef.de' },
  { name: 'Braun', url: 'https://www.braunhousehold.com/de-de' },
  { name: 'Cloer', url: 'https://www.cloer.de' },
  { name: 'Rommelsbacher', url: 'https://www.rommelsbacher.de' },
  { name: 'Miomondo', url: 'https://www.miomondo.de' } // URL bitte einmal prüfen
];

// Gerätekategorien, Farben aus dem 4-Farben-Kreis der Visitenkarte
const CATEGORIES = [
  { id: 'waschmaschinen', name: 'Waschmaschinen', icon: 'washer', color: 'green' },
  { id: 'trockner', name: 'Trockner', icon: 'dryer', color: 'green' },
  { id: 'kuehlschraenke', name: 'Kühl- & Gefriergeräte', icon: 'fridge', color: 'yellow' },
  { id: 'geschirrspueler', name: 'Geschirrspüler', icon: 'dishwasher', color: 'blue' },
  { id: 'herde', name: 'Herde & Backöfen', icon: 'oven', color: 'blue' },
  { id: 'kaffeemaschinen', name: 'Kaffeemaschinen', icon: 'coffee', color: 'red' },
  { id: 'staubsauger', name: 'Staubsauger', icon: 'vacuum', color: 'red' },
  { id: 'kleingeraete', name: 'Kleingeräte', icon: 'small', color: 'red' }
];
const CONDITIONS = { neu: 'Neu', lackschaden: 'Lackschaden', gebraucht: 'Gebraucht' };

const ICONS = {
  washer: '<rect x="4" y="2.5" width="16" height="19" rx="2"/><path d="M4 7h16"/><circle cx="12" cy="14" r="4.5"/><path d="M7 4.8h.01"/>',
  dryer: '<rect x="4" y="2.5" width="16" height="19" rx="2"/><path d="M4 7h16M7 4.8h.01"/><circle cx="12" cy="14" r="4.5"/><path d="M10 13.5c1-1 3 1 4 0"/>',
  fridge: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M5 9h14M8 5v2M8 12v3"/>',
  dishwasher: '<rect x="4" y="2.5" width="16" height="19" rx="2"/><path d="M4 7h16M8 11h8M7 16h10M7 4.8h.01"/>',
  oven: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 8h18M7 5.5h.01M11 5.5h.01"/><rect x="7" y="11" width="10" height="7" rx="1"/>',
  coffee: '<path d="M5 8h11v6a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z"/><path d="M16 10h2a2 2 0 0 1 0 4h-2M8 2v3M12 2v3M4 22h14"/>',
  vacuum: '<circle cx="8" cy="16" r="5"/><path d="M12 13 18 3h2M8 16h.01M3 21h18"/>',
  small: '<rect x="3" y="9" width="18" height="11" rx="3"/><path d="M8 9V6M16 9V6M7 14h4"/>',
  kitchen: '<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 12h18M12 12v9M7 7h3M14 7h3M10 16h.01M14 16h.01"/>',
  layers: '<path d="m12 2 10 5-10 5L2 7zM2 12l10 5 10-5M2 17l10 5 10-5"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z"/>',
  truck: '<path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  store: '<path d="M3 9l1.5-5h15L21 9M3 9v11h18V9M3 9h18M9 20v-6h6v6"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  star: '<path fill="currentColor" stroke="none" d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z"/><path d="M2 21c0-3 1.9-5.4 5.2-6"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  award: '<circle cx="12" cy="8" r="6"/><path d="M15.5 13 17 22l-5-3-5 3 1.5-9"/>',
  heart: '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/>',
  euro: '<path d="M4 10h12M4 14h9M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12c0 4.4 3.5 8 7.8 8 2 0 3.8-.8 5.2-2"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  newspaper: '<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2M18 14h-8M15 18h-5M10 6h8v4h-8z"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  instagram: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
  facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
  sparkle: '<path d="M12 3l1.9 5.8L20 10l-6.1 1.2L12 17l-1.9-5.8L4 10l6.1-1.2z"/><path d="M19 17v4M17 19h4"/>'
};
const icon = (name, cls = '') => `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;

// Logo: der 4-Farben-Kreis der Visitenkarte als Wiedererkennungs-Anker
const LOGO_SVG = `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="23" fill="#fff"/>
<path d="M24 24V2A22 22 0 0 0 2 24z" fill="#3aa845"/><path d="M24 24V2a22 22 0 0 1 22 22z" fill="#f2bf1d"/>
<path d="M24 24h22a22 22 0 0 1-22 22z" fill="#d7262e"/><path d="M24 24v22A22 22 0 0 1 2 24z" fill="#2459b8"/>
<circle cx="24" cy="24" r="8.5" fill="#fff"/><path d="M20.5 24.2l2.4 2.4 4.6-5" fill="none" stroke="#262a7a" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- Öffnungsstatus (Berliner Zeit) ---------- */
function openStatus(date = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Berlin', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(date).map(p => [p.type, p.value]));
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
  const min = +parts.hour * 60 + +parts.minute;
  const fmt = m => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
  const slots = SITE.hours[day];
  const today = slots.map(([a, b]) => `${fmt(a)}–${fmt(b)}`).join(' & ');
  for (const [a, b] of slots) if (min >= a && min < b) return { open: true, text: `Jetzt geöffnet · heute ${today} Uhr` };
  const later = slots.find(([a]) => a > min);
  if (later) return { open: false, text: min > slots[0][0] ? `Mittagspause · ab ${fmt(later[0])} Uhr wieder da` : `Geschlossen · öffnet heute ${fmt(later[0])} Uhr` };
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    if (SITE.hours[d].length) return { open: false, text: `Geschlossen · öffnet ${i === 1 ? 'morgen' : ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][d]} ${fmt(SITE.hours[d][0][0])} Uhr` };
  }
}

/* ---------- Header / Footer ---------- */
function renderHeader() {
  const page = document.body.dataset.page;
  const st = openStatus();
  // Einträge bekommen ein Symbol, das nur im Handy-Menü sichtbar ist
  const a = (href, label, key, ico) => `<a href="${href}" class="${page === key ? 'active' : ''}"><span class="nav__ico">${icon(ico)}</span>${label}</a>`;
  const drop = (label, key, ico, items) => `<div class="nav__drop ${page === key ? 'active' : ''}"><button type="button" aria-expanded="false"><span class="nav__ico">${icon(ico)}</span>${label}${icon('chevron')}</button>
    <div class="nav__menu">${items.map(([h, l, i]) => `<a href="${h}">${icon(i)}${l}</a>`).join('')}</div></div>`;
  document.getElementById('site-header').outerHTML = `
  <div class="topbar"><div class="container">
    <span class="open-badge ${st.open ? 'is-open' : ''}">${st.text}</span>
    <span class="topbar__hide-sm">${icon('pin', '')} ${SITE.street}, ${SITE.city}</span>
  </div></div>
  <header class="header"><div class="container">
    <a class="logo" href="/home/" aria-label="Scholz & Partner, Startseite">${LOGO_SVG}<span class="logo__text"><span class="logo__name">Scholz &amp; Partner</span><span class="logo__sub">Elektro-Hausgeräte-Service</span></span></a>
    <div class="nav-backdrop" hidden></div>
    <nav class="nav" id="nav" aria-label="Hauptnavigation">
      <div class="nav__head"><span class="nav__title">Menü</span><button class="nav__close" type="button" aria-label="Menü schließen">${icon('x')}</button></div>
      ${a('/home/', 'Home', 'home', 'home')}
      ${drop('Service', 'service', 'wrench', [['/service/#reparatur', 'Reparaturservice', 'wrench'], ['/service/#kaffee', 'Kaffeemaschinen-Reparatur', 'coffee'], ['/service/#lieferung', 'Lieferung & Anschluss', 'truck'], ['/service/#beratung', 'Beratung vor Ort', 'home'], ['/service/#kueche', 'Küchenmodernisierung', 'kitchen']])}
      ${a('/shop/', 'Shop', 'shop', 'store')}
      ${drop('Unternehmen', 'ueber-uns', 'users', [['/ueber-uns/', 'Über uns', 'users'], ['/ueber-uns/#team', 'Unser Team', 'heart'], ['/ueber-uns/#kuechenstudio', 'Küchenstudio', 'kitchen'], ['/ueber-uns/#standort', 'Standort', 'pin'], ['/ueber-uns/#presse', 'Presse', 'newspaper']])}
      ${a('/kontakt/', 'Kontakt', 'kontakt', 'mail')}
      <div class="nav__foot">
        <span class="open-badge ${st.open ? 'is-open' : ''}">${st.text}</span>
        <a class="btn btn--red btn--block" href="/kontakt/?anliegen=reparatur">${icon('wrench')} Reparatur anfragen</a>
        <a class="btn btn--ghost btn--block" href="${SITE.phoneHref}">${icon('phone')} ${SITE.phone}</a>
      </div>
    </nav>
    <div class="header__cta">
      <a class="header__phone" href="${SITE.phoneHref}">${icon('phone')}<span>${SITE.phone}</span></a>
      <a class="btn btn--red btn--sm" href="/kontakt/?anliegen=reparatur">Reparatur anfragen</a>
      <button class="burger" type="button" aria-label="Menü öffnen" aria-controls="nav" aria-expanded="false">${icon('menu')}</button>
    </div>
  </div></header>`;

  const burger = document.querySelector('.burger'), nav = document.getElementById('nav'), backdrop = document.querySelector('.nav-backdrop');
  // Scroll-Sperre über <html>, nicht <body>: sonst verliert der klebende Kopfbereich seinen Halt und verschwindet
  const setMenu = open => {
    nav.classList.toggle('is-open', open);
    backdrop.hidden = !open;
    document.documentElement.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    if (!open) nav.querySelectorAll('.nav__drop.is-open').forEach(d => { d.classList.remove('is-open'); d.firstElementChild.setAttribute('aria-expanded', 'false'); });
  };
  burger.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  nav.querySelector('.nav__close').addEventListener('click', () => setMenu(false));
  backdrop.addEventListener('click', () => setMenu(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('is-open')) setMenu(false); });
  nav.querySelectorAll('.nav__drop > button').forEach(b => b.addEventListener('click', () => {
    const open = b.parentElement.classList.toggle('is-open');
    b.setAttribute('aria-expanded', open);
  }));
  nav.querySelectorAll('a').forEach(l => l.addEventListener('click', () => setMenu(false)));
  matchMedia('(min-width: 901px)').addEventListener('change', e => { if (e.matches) setMenu(false); });
}

function renderFooter() {
  document.getElementById('site-footer').outerHTML = `
  <footer class="footer"><div class="container">
    <div class="footer__grid">
      <div>
        <a class="logo" href="/home/">${LOGO_SVG}<span class="logo__text"><span class="logo__name">Scholz &amp; Partner</span><span class="logo__sub">Elektro-Hausgeräte-Service</span></span></a>
        <p>Reparieren statt wegwerfen. Seit fast 30 Jahren Ihr Fachbetrieb für Hausgeräte in Köln-Porz.</p>
        <div class="social"><a href="${SITE.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${icon('facebook')}</a><a href="${SITE.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${icon('instagram')}</a></div>
      </div>
      <div><h4>Service</h4><ul>
        <li><a href="/service/#reparatur">Reparaturservice</a></li><li><a href="/service/#kaffee">Kaffeemaschinen</a></li>
        <li><a href="/service/#lieferung">Lieferung &amp; Anschluss</a></li><li><a href="/service/#beratung">Beratung vor Ort</a></li><li><a href="/shop/">Shop</a></li></ul></div>
      <div><h4>Unternehmen</h4><ul>
        <li><a href="/ueber-uns/">Über uns</a></li><li><a href="/ueber-uns/#kuechenstudio">Küchenstudio</a></li>
        <li><a href="/ueber-uns/#standort">Standort</a></li><li><a href="/ueber-uns/#presse">Presse</a></li><li><a href="/kontakt/">Kontakt</a></li></ul></div>
      <div><h4>So erreichen Sie uns</h4>
        <p><a href="${SITE.phoneHref}"><strong>${SITE.phone}</strong></a><br><a href="mailto:${SITE.email}">${SITE.email}</a><br>${SITE.street}<br>${SITE.city}</p>
        <div class="footer__hours">${SITE.hoursText.map(([d, t]) => `<span>${d}</span><span>${t}</span>`).join('')}</div>
      </div>
    </div>
    <div class="footer__bottom"><span>© ${new Date().getFullYear()} Scholz &amp; Partner Elektro-Hausgeräte-Service · Inh. ${SITE.owner}</span>
      <nav><a href="/impressum/">Impressum</a><a href="/datenschutz/">Datenschutz</a><a class="footer__by" href="https://kekstahr.github.io" target="_blank" rel="noopener">Made by Reşo</a></nav></div>
  </div></footer>
  <nav class="mobilebar" aria-label="Schnellzugriff">
    <a href="${SITE.phoneHref}">${icon('phone')}Anrufen</a>
    <a href="${SITE.mapsUrl}" target="_blank" rel="noopener">${icon('pin')}Route</a>
    <a class="is-primary" href="/kontakt/?anliegen=reparatur">${icon('wrench')}Reparatur</a>
  </nav>`;
}

/* ---------- Produkte ---------- */
async function loadProducts() {
  const res = await fetch('/data/products.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('Produkte konnten nicht geladen werden');
  return (await res.json()).filter(p => p.active !== false);
}
const category = id => CATEGORIES.find(c => c.id === id) || { name: id, icon: 'small', color: 'navy' };
const euro = n => Number(n).toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: Number(n) % 1 ? 2 : 0 });
const savePct = p => p.price && p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;

function productImage(p, cls = '') {
  const c = category(p.category);
  return p.images && p.images.length
    ? `<img src="${esc(p.images[0])}" alt="${esc(p.brand + ' ' + p.name)}" loading="lazy" class="${cls}">`
    : `<div class="product__placeholder c-${c.color}" style="color:var(--c)">${icon(c.icon)}</div>`;
}
function priceHtml(p) {
  if (!p.price) return '<span class="price price--ask">Preis auf Anfrage</span>';
  const s = savePct(p);
  return `<span class="price">${euro(p.price)}</span>${s ? `<span class="price-old">UVP ${euro(p.oldPrice)}</span><span class="price-save">Sie sparen ${euro(p.oldPrice - p.price)}</span>` : ''}`;
}
function productCard(p) {
  const s = savePct(p);
  const size = [p.height && `H ${p.height}`, p.width && `B ${p.width}`, p.depth && `T ${p.depth}`].filter(Boolean).join(' × ');
  return `<a class="product reveal" href="/shop/produkt/?id=${encodeURIComponent(p.id)}">
    <div class="product__img">${productImage(p)}<div class="product__badges">
      <span class="badge badge--${esc(p.condition)}">${CONDITIONS[p.condition] || 'Neu'}</span>${s ? `<span class="badge badge--sale">−${s}%</span>` : ''}</div></div>
    <div class="product__body"><span class="product__brand">${esc(p.brand)}</span><span class="product__name">${esc(p.name)}</span>
      <span class="product__meta">${esc(category(p.category).name)}${size ? ' · ' + esc(size) + ' cm' : ''}</span>
      <div class="product__price">${priceHtml(p)}</div></div></a>`;
}

/* ---------- Scroll-Reveal ---------- */
function initReveal(root = document) {
  const els = root.querySelectorAll('.reveal:not(.is-visible)');
  if (!('IntersectionObserver' in window)) return els.forEach(e => e.classList.add('is-visible'));
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  els.forEach(e => io.observe(e));
}

/* ---------- Init ---------- */
if (document.getElementById('site-header')) renderHeader();
if (document.getElementById('site-footer')) renderFooter();
document.querySelectorAll('[data-icon]').forEach(el => el.insertAdjacentHTML('afterbegin', icon(el.dataset.icon)));
document.querySelectorAll('[data-phone]').forEach(el => { el.textContent = SITE.phone; el.href = SITE.phoneHref; });
initReveal();
