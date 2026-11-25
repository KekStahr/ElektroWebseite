/* ===== Produktdetail: /shop/produkt/?id=... ===== */
const COND_TEXT = {
  neu: 'Fabrikneues Gerät mit voller Herstellergarantie.',
  lackschaden: 'Neues Gerät mit kleinem optischen Makel (z. B. Kratzer oder Delle), technisch einwandfrei, aber deutlich günstiger.',
  gebraucht: 'Geprüftes Gebrauchtgerät aus unserer Werkstatt, gereinigt, getestet und mit Gewährleistung.'
};
const id = new URLSearchParams(location.search).get('id');
const $pd = document.getElementById('pd');

loadProducts().then(all => {
  const p = all.find(x => x.id === id);
  if (!p) {
    $pd.innerHTML = `<div class="empty" style="margin:64px 0"><h1 style="font-size:2rem">Dieses Gerät ist leider nicht mehr verfügbar.</h1>
      <p>Vielleicht wurde es gerade verkauft. Schauen Sie sich unsere anderen Angebote an, oder fragen Sie uns nach einem ähnlichen Modell.</p>
      <a class="btn btn--navy" href="/shop/">Zum Shop</a> <a class="btn btn--ghost" href="/kontakt/?anliegen=preisanfrage">Ähnliches Gerät anfragen</a></div>`;
    return;
  }
  const c = category(p.category), s = savePct(p);
  const title = `${p.brand} ${p.name}`;
  document.title = `${title}, Scholz & Partner Köln-Porz`;
  document.querySelector('meta[name=description]').content = `${title}${p.price ? ' für ' + euro(p.price) : ''} bei Scholz & Partner in Köln-Porz. ${CONDITIONS[p.condition] || ''}. Lieferung & Anschluss möglich.`;
  const ref = encodeURIComponent(`${title} (Nr. ${p.id})`);
  const specs = [['Marke', p.brand], ['Kategorie', c.name], ['Zustand', CONDITIONS[p.condition]], ['Farbe', p.color],
    ['Höhe', p.height && p.height + ' cm'], ['Breite', p.width && p.width + ' cm'], ['Tiefe', p.depth && p.depth + ' cm'],
    ['Energieeffizienz', p.energy], ['Artikel-Nr.', p.id]].filter(r => r[1]);
  const imgs = p.images || [];

  $pd.innerHTML = `
  <nav class="breadcrumb"><a href="/home/">Home</a> / <a href="/shop/">Shop</a> / <a href="/shop/?kategorie=${c.id}">${esc(c.name)}</a> / ${esc(p.name)}</nav>
  <div class="pd__grid">
    <div class="gallery">
      <div class="gallery__main">${productImage(p)}
        <div class="product__badges"><span class="badge badge--${esc(p.condition)}">${CONDITIONS[p.condition] || 'Neu'}</span>${s ? `<span class="badge badge--sale">−${s}%</span>` : ''}</div></div>
      ${imgs.length > 1 ? `<div class="gallery__thumbs">${imgs.map((src, i) => `<button type="button" class="${i ? '' : 'is-active'}" data-src="${esc(src)}"><img src="${esc(src)}" alt="Ansicht ${i + 1}"></button>`).join('')}</div>` : ''}
    </div>
    <div class="buy">
      <span class="product__brand">${esc(p.brand)}</span>
      <h1>${esc(p.name)}</h1>
      <p class="buy__cond">${COND_TEXT[p.condition] || ''}</p>
      <div class="buy__price">${priceHtml(p)}</div>
      ${s ? `<p class="buy__save">Sie sparen <strong>${euro(p.oldPrice - p.price)}</strong> gegenüber der UVP.</p>` : ''}
      <p class="buy__stock"><span class="dot"></span> Im Geschäft in Köln-Porz verfügbar · <span id="pd-open"></span></p>
      <div class="buy__actions">
        <a class="btn btn--red btn--block" href="/kontakt/?anliegen=reservierung&produkt=${ref}">${icon('check')} Jetzt unverbindlich reservieren</a>
        <div class="buy__row">
          <a class="btn btn--ghost" href="${SITE.phoneHref}">${icon('phone')} Anrufen</a>
          <a class="btn btn--ghost" href="/kontakt/?anliegen=preisanfrage&produkt=${ref}">${icon('euro')} Preis anfragen</a>
        </div>
      </div>
      <ul class="buy__perks">
        <li>${icon('truck')}<span><strong>Lieferung &amp; Anschluss</strong> durch unser eigenes Team</span></li>
        <li>${icon('leaf')}<span><strong>Altgerät-Mitnahme</strong> auf Wunsch direkt bei Lieferung</span></li>
        <li>${icon('wrench')}<span><strong>Service vom Fachbetrieb</strong>, auch Jahre nach dem Kauf</span></li>
        <li>${icon('store')}<span><strong>Ansehen vor Ort</strong> in der ${SITE.street}</span></li>
      </ul>
    </div>
  </div>
  <div class="pd__details">
    <section><h2>Beschreibung</h2><p>${esc(p.description).replace(/\n/g, '<br>')}</p>
      ${p.features && p.features.length ? `<ul class="check-list">${p.features.map(f => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}</section>
    <section><h2>Technische Daten</h2><table class="specs">${specs.map(([k, v]) => `<tr><th>${k}</th><td>${esc(v)}</td></tr>`).join('')}</table></section>
  </div>`;

  document.getElementById('pd-open').textContent = openStatus().text;
  $pd.querySelector('.gallery__thumbs')?.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $pd.querySelector('.gallery__main img').src = b.dataset.src;
    $pd.querySelectorAll('.gallery__thumbs button').forEach(x => x.classList.toggle('is-active', x === b));
  });

  // Zoom direkt im Rahmen. Maus: Lupe, Klick zoomt, Bild folgt der Maus. Handy: Doppeltippen oder zwei Finger, ein Finger verschiebt.
  if (imgs.length) {
    const main = $pd.querySelector('.gallery__main');
    const touch = matchMedia('(hover: none)').matches;
    main.classList.add('is-zoomable');
    main.insertAdjacentHTML('beforeend', `<span class="gallery__hint">${icon('search')} ${touch ? 'Doppeltippen oder mit zwei Fingern zoomen' : 'Klicken zum Zoomen'}</span>`);
    const MAX = 4, STEP = 2.5;
    let scale = 1;
    const pos = p => { const r = main.getBoundingClientRect(); return [p.clientX - r.left, p.clientY - r.top]; };
    const setZoom = (s, x, y) => {
      scale = Math.min(MAX, Math.max(1, s));
      const img = main.querySelector('img'), r = main.getBoundingClientRect();
      if (x != null) img.style.transformOrigin = `${x / r.width * 100}% ${y / r.height * 100}%`;
      img.style.transform = scale > 1 ? `scale(${scale})` : '';
      main.classList.toggle('is-zoomed', scale > 1);
    };
    // Maus
    main.addEventListener('click', e => { if (!touch) setZoom(scale > 1 ? 1 : STEP, ...pos(e)); });
    main.addEventListener('mousemove', e => { if (scale > 1) setZoom(scale, ...pos(e)); });
    main.addEventListener('mouseleave', () => setZoom(1));
    // Touch
    let lastTap = 0, pinch = null;
    main.addEventListener('touchstart', e => {
      if (e.touches.length === 2) {
        const [a, b] = e.touches;
        pinch = { d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), s: scale };
        setZoom(scale, ...pos({ clientX: (a.clientX + b.clientX) / 2, clientY: (a.clientY + b.clientY) / 2 }));
      } else if (e.touches.length === 1) {
        const now = Date.now();
        if (now - lastTap < 300) { e.preventDefault(); setZoom(scale > 1 ? 1 : STEP, ...pos(e.touches[0])); lastTap = 0; }
        else lastTap = now;
      }
    }, { passive: false });
    main.addEventListener('touchmove', e => {
      if (pinch && e.touches.length === 2) {
        e.preventDefault();
        const [a, b] = e.touches;
        setZoom(pinch.s * Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) / pinch.d);
      } else if (scale > 1 && e.touches.length === 1) { e.preventDefault(); setZoom(scale, ...pos(e.touches[0])); }
    }, { passive: false });
    main.addEventListener('touchend', e => { if (e.touches.length < 2) pinch = null; });
    $pd.querySelector('.gallery__thumbs')?.addEventListener('click', () => setZoom(1)); // neues Bild = ungezoomt
  }

  // Strukturierte Daten für Google
  const ld = document.createElement('script'); ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Product', name: title, brand: p.brand, description: p.description, image: imgs.map(i => location.origin + i),
    ...(p.price ? { offers: { '@type': 'Offer', price: p.price, priceCurrency: 'EUR', availability: 'https://schema.org/InStoreOnly', itemCondition: p.condition === 'gebraucht' ? 'https://schema.org/UsedCondition' : 'https://schema.org/NewCondition' } } : {}) });
  document.head.appendChild(ld);

  // Ähnliche Geräte: gleiche Kategorie zuerst, dann Rest
  const rel = all.filter(x => x.id !== p.id).sort((a, b) => (b.category === p.category) - (a.category === p.category) || savePct(b) - savePct(a)).slice(0, 4);
  if (rel.length) {
    document.getElementById('related').innerHTML = rel.map(productCard).join('');
    document.getElementById('related-wrap').hidden = false;
    initReveal(document.getElementById('related'));
  }
}).catch(() => { $pd.innerHTML = '<p class="alert alert--err" style="margin:48px 0">Das Gerät konnte gerade nicht geladen werden. Bitte versuchen Sie es später erneut.</p>'; });
