/* ===== Startseite ===== */

/* --- Marken-Laufband: 3 Reihen, um 1/3 phasenverschoben, Hover-Fenster mit Preisanfrage ---
   Gleiche Liste, gleiche Dauer/Richtung, Start um je 1/3 versetzt: dadurch ist jede Marke
   zu jedem Zeitpunkt in mindestens einer Reihe sichtbar (Fensterbreite >= Listenbreite/3). --- */
(() => {
  const wrap = document.getElementById('marquee');
  const pop = document.getElementById('brand-pop');
  const item = b => `<a class="brand" href="${b.url}" target="_blank" rel="noopener" data-brand="${esc(b.name)}">${b.logo ? `<img src="${b.logo}" alt="${esc(b.name)}">` : esc(b.name)}</a>`;
  const ROWS = 3, DUR = 60;
  // Inhalt doppelt, damit die Animation (-50%) nahtlos läuft
  const set = BRANDS.map(item).join('').repeat(2);
  wrap.innerHTML = Array.from({ length: ROWS }, (_, i) =>
    `<div class="marquee__row" style="--dur:${DUR}s;animation-delay:-${(DUR / ROWS * i).toFixed(1)}s">${set}</div>`).join('');
  wrap.querySelectorAll('.marquee__row').forEach(r => [...r.children].slice(BRANDS.length).forEach(c => { c.setAttribute('aria-hidden', 'true'); c.tabIndex = -1; }));

  let hideT;
  const show = el => {
    clearTimeout(hideT);
    const b = BRANDS.find(x => x.name === el.dataset.brand);
    pop.innerHTML = `<strong>${esc(b.name)}</strong><p>Fragen Sie den Preis an, bei uns ist es sicherlich günstiger.</p>
      <a class="btn btn--red btn--sm" href="/kontakt/?anliegen=preisanfrage&marke=${encodeURIComponent(b.name)}">Preis anfragen</a>
      <a class="ext" href="${b.url}" target="_blank" rel="noopener">Zur Herstellerseite ↗</a>`;
    const r = el.getBoundingClientRect();
    const below = r.top < 200;
    pop.style.left = Math.min(Math.max(r.left + r.width / 2, 150), innerWidth - 150) + 'px';
    pop.style.top = (below ? r.bottom + 14 : r.top) + 'px';
    pop.style.transform = below ? 'translate(-50%, 0)' : '';
    pop.classList.toggle('is-below', below);
    pop.hidden = false;
    wrap.classList.add('is-paused');
  };
  const hide = () => { hideT = setTimeout(() => { pop.hidden = true; wrap.classList.remove('is-paused'); }, 180); };

  const touch = matchMedia('(hover: none)').matches;
  wrap.addEventListener('mouseover', e => { const el = e.target.closest('.brand'); if (el && !touch) show(el); });
  wrap.addEventListener('mouseout', e => { if (e.target.closest('.brand') && !touch) hide(); });
  wrap.addEventListener('focusin', e => { const el = e.target.closest('.brand'); if (el) show(el); });
  wrap.addEventListener('focusout', hide);
  pop.addEventListener('mouseenter', () => clearTimeout(hideT));
  pop.addEventListener('mouseleave', hide);
  // Touch: erster Tipp öffnet das Fenster (dort gibt's den Hersteller-Link)
  if (touch) wrap.addEventListener('click', e => { const el = e.target.closest('.brand'); if (el) { e.preventDefault(); show(el); } });
  document.addEventListener('click', e => { if (!e.target.closest('.brand, .brand-pop')) { pop.hidden = true; wrap.classList.remove('is-paused'); } });
  addEventListener('scroll', () => { if (!pop.hidden) { pop.hidden = true; wrap.classList.remove('is-paused'); } }, { passive: true });
})();

/* --- Zähler im Vertrauensband --- */
(() => {
  const els = document.querySelectorAll('[data-count]');
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    const el = e.target, end = +el.dataset.count, pre = el.dataset.prefix || '', t0 = performance.now();
    const tick = t => { const k = Math.min((t - t0) / 1200, 1); el.textContent = pre + Math.round(end * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }));
  els.forEach(e => io.observe(e));
})();

/* --- Reparatur-Check --- */
(() => {
  const BIG = 'Großgerät';
  const DEVICES = [
    { id: 'Waschmaschine', icon: 'washer', kv: 35, type: BIG, problems: ['Pumpt nicht ab', 'Schleudert nicht', 'Verliert Wasser', 'Trommel dreht nicht', 'Startet nicht / Fehlercode', 'Laute Geräusche'] },
    { id: 'Trockner', icon: 'dryer', kv: 35, type: BIG, problems: ['Wird nicht warm', 'Trommel dreht nicht', 'Startet nicht / Fehlercode', 'Laute Geräusche'] },
    { id: 'Geschirrspüler', icon: 'dishwasher', kv: 35, type: BIG, problems: ['Pumpt nicht ab', 'Spült nicht sauber', 'Verliert Wasser', 'Wird nicht warm', 'Startet nicht / Fehlercode'] },
    { id: 'Kühlschrank', icon: 'fridge', kv: 35, type: BIG, problems: ['Kühlt nicht mehr', 'Vereist stark', 'Wasser im Gerät', 'Laute Geräusche'] },
    { id: 'Herd / Backofen', icon: 'oven', kv: 35, type: BIG, problems: ['Wird nicht heiß', 'Kochfeld ohne Funktion', 'Sicherung fliegt raus', 'Tür / Dichtung defekt'] },
    { id: 'Kaffeevollautomat', icon: 'coffee', kv: 45, type: 'Kaffee', problems: ['Kein Kaffee / tröpfelt', 'Mahlwerk blockiert', 'Milchschaum geht nicht', 'Verliert Wasser', 'Fehlermeldung'] },
    { id: 'Kleingerät', icon: 'small', kv: 25, type: 'Klein', problems: ['Geht nicht mehr an', 'Riecht verbrannt', 'Mechanisch defekt', 'Sonstiges'] }
  ];
  const $dev = document.getElementById('check-devices'), $prob = document.getElementById('check-problems'), $res = document.getElementById('check-result');
  const step2 = document.querySelector('[data-step="2"]');
  let device;
  $dev.innerHTML = DEVICES.map((d, i) => `<button class="opt" type="button" data-i="${i}">${icon(d.icon)}${d.id}</button>`).join('');
  $dev.addEventListener('click', e => {
    const b = e.target.closest('.opt'); if (!b) return;
    device = DEVICES[b.dataset.i];
    $dev.querySelectorAll('.opt').forEach(o => o.classList.toggle('is-active', o === b));
    $prob.innerHTML = device.problems.map(p => `<button class="opt" type="button">${p}</button>`).join('');
    step2.hidden = false; $res.hidden = true;
  });
  $prob.addEventListener('click', e => {
    const b = e.target.closest('.opt'); if (!b) return;
    $prob.querySelectorAll('.opt').forEach(o => o.classList.toggle('is-active', o === b));
    const problem = b.textContent;
    const q = new URLSearchParams({ anliegen: 'reparatur', geraet: device.id, problem, ort: device.type === BIG ? 'vor-ort' : 'geschaeft' });
    const big = device.type === BIG;
    $res.innerHTML = `<h3>${device.id}: „${problem}“, das bekommen wir hin.</h3>
      <p>${big
        ? 'Großgeräte reparieren wir meist direkt bei Ihnen zu Hause. Kleinere Arbeiten erledigt der Techniker oft gleich beim ersten Besuch.'
        : 'Bringen Sie das Gerät einfach zu uns in die Kaiserstraße. Wir prüfen es in unserer Werkstatt und melden uns mit dem Kostenvoranschlag.'}</p>
      <div class="check__price">${big
        ? `<strong>ab 79 €</strong><span>Vor-Ort-Pauschale in Porz, inkl. Anfahrt, Prüfung und kleiner Reparaturen. Wird bei Auftrag angerechnet.</span>`
        : `<strong>${device.kv} €</strong><span>Kostenvoranschlag im Geschäft, wird bei Reparatur vollständig angerechnet.</span>`}</div>
      <div class="check__actions"><a class="btn btn--red" href="/kontakt/?${q}">Jetzt Reparatur anfragen</a><a class="btn btn--ghost" href="${SITE.phoneHref}">${icon('phone')} Anrufen</a></div>`;
    $res.hidden = false;
  });
})();

/* --- Angebote aus dem Admin-Bereich: höchste Ersparnis zuerst --- */
loadProducts().then(list => {
  const top = list.sort((a, b) => savePct(b) - savePct(a) || (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 4);
  if (!top.length) return;
  document.getElementById('deals').innerHTML = top.map(productCard).join('');
  document.getElementById('angebote').hidden = false;
  initReveal(document.getElementById('deals'));
}).catch(() => {});

/* --- Rezensionen: echte Google-Bewertungen in /data/reviews.json eintragen --- */
fetch('/data/reviews.json', { cache: 'no-store' }).then(r => r.json()).then(list => {
  document.getElementById('reviews').innerHTML = list.map(r => `<figure class="review reveal">
    <div class="review__stars" aria-label="${r.stars} von 5 Sternen">${icon('star').repeat(r.stars)}</div>
    <p>„${esc(r.text)}“</p><footer>${esc(r.name)}${r.source ? ` · ${esc(r.source)}` : ''}</footer></figure>`).join('');
  initReveal(document.getElementById('reviews'));
}).catch(() => {});

document.getElementById('google-reviews').href = SITE.reviewsUrl;
document.getElementById('route-btn').href = SITE.mapsUrl;
document.getElementById('visit-status').textContent = openStatus().text;
