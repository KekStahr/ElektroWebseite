/* ===== Shop: Kategorien, Filter, Sortierung, Daten kommen aus /data/products.json (Admin) ===== */
const SWATCH = { 'weiß': '#ffffff', 'schwarz': '#1f1f24', 'edelstahl': 'linear-gradient(135deg,#d9dce1,#9aa0a8,#e9ebee)', 'silber': '#c7cacf', 'grau': '#8b8f98', 'rot': '#d7262e', 'blau': '#2459b8', 'beige': '#e8dcc4', 'creme': '#f4ecd8', 'grün': '#3aa845', 'gelb': '#f2bf1d', 'anthrazit': '#3a3d44' };
const $ = id => document.getElementById(id);
const params = new URLSearchParams(location.search);
const S = {
  cat: params.get('kategorie') || '', q: params.get('q') || '',
  cond: new Set(params.getAll('zustand')), brand: new Set(params.getAll('marke')), color: new Set(),
  pmin: '', pmax: '', hmax: '', wmax: '', sort: 'empfohlen'
};
let ALL = [];

const sorters = {
  empfohlen: (a, b) => (savePct(b) > 0) - (savePct(a) > 0) || (b.createdAt || '').localeCompare(a.createdAt || ''),
  ersparnis: (a, b) => savePct(b) - savePct(a),
  'preis-auf': (a, b) => (a.price || 1e9) - (b.price || 1e9),
  'preis-ab': (a, b) => (b.price || 0) - (a.price || 0),
  neu: (a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')
};

function match(p, skip) {
  const q = S.q.trim().toLowerCase();
  if (skip !== 'cat' && S.cat && p.category !== S.cat) return false;
  if (q && !`${p.name} ${p.brand} ${p.description} ${category(p.category).name}`.toLowerCase().includes(q)) return false;
  if (skip !== 'cond' && S.cond.size && !S.cond.has(p.condition)) return false;
  if (skip !== 'brand' && S.brand.size && !S.brand.has(p.brand)) return false;
  if (skip !== 'color' && S.color.size && !S.color.has((p.color || '').toLowerCase())) return false;
  if (S.pmin !== '' && (!p.price || p.price < +S.pmin)) return false;
  if (S.pmax !== '' && (!p.price || p.price > +S.pmax)) return false;
  if (S.hmax !== '' && p.height && p.height > +S.hmax) return false;
  if (S.wmax !== '' && p.width && p.width > +S.wmax) return false;
  return true;
}

// Optionen mit Trefferzahl (facettiert: ignoriert den eigenen Filter)
function renderOptions(id, key, field, labelFn) {
  const counts = {};
  ALL.filter(p => match(p, key)).forEach(p => { const v = field === 'color' ? (p.color || '').toLowerCase() : p[field]; if (v) counts[v] = (counts[v] || 0) + 1; });
  const values = [...new Set([...ALL.map(p => field === 'color' ? (p.color || '').toLowerCase() : p[field]).filter(Boolean), ...S[key]])].sort();
  $(id).innerHTML = values.map(v => `<label class="opt-row ${counts[v] ? '' : 'is-zero'}"><input type="checkbox" data-key="${key}" value="${esc(v)}" ${S[key].has(v) ? 'checked' : ''}>
    ${key === 'color' ? `<i class="sw" style="background:${SWATCH[v] || '#ccc'}"></i>` : ''}<span>${esc(labelFn ? labelFn(v) : v)}</span><em>${counts[v] || 0}</em></label>`).join('');
}

function renderCats() {
  const counts = {}; ALL.filter(p => match(p, 'cat')).forEach(p => counts[p.category] = (counts[p.category] || 0) + 1);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  $('cats').innerHTML = `<button class="cat ${!S.cat ? 'is-active' : ''}" data-cat="" role="tab">${icon('store')}<span>Alle Geräte</span><em>${total}</em></button>` +
    CATEGORIES.map(c => `<button class="cat c-${c.color} ${S.cat === c.id ? 'is-active' : ''}" data-cat="${c.id}" role="tab">${icon(c.icon)}<span>${c.name}</span><em>${counts[c.id] || 0}</em></button>`).join('');
}

function renderChips() {
  const chips = [];
  if (S.cat) chips.push(['cat', '', category(S.cat).name]);
  if (S.q) chips.push(['q', '', `„${S.q}“`]);
  S.cond.forEach(v => chips.push(['cond', v, CONDITIONS[v]]));
  S.brand.forEach(v => chips.push(['brand', v, v]));
  S.color.forEach(v => chips.push(['color', v, v]));
  if (S.pmin !== '' || S.pmax !== '') chips.push(['price', '', `${S.pmin || 0}, ${S.pmax || '∞'} €`]);
  if (S.hmax !== '') chips.push(['hmax', '', `Höhe ≤ ${S.hmax} cm`]);
  if (S.wmax !== '') chips.push(['wmax', '', `Breite ≤ ${S.wmax} cm`]);
  $('chips').innerHTML = chips.map(([k, v, l]) => `<button class="chip-x" data-k="${k}" data-v="${esc(v)}">${esc(l)} ${icon('x')}</button>`).join('');
}

function render() {
  const list = ALL.filter(p => match(p)).sort(sorters[S.sort]);
  $('grid').innerHTML = list.map(productCard).join('');
  $('empty').hidden = list.length > 0;
  $('count').innerHTML = `<strong>${list.length}</strong> ${list.length === 1 ? 'Gerät' : 'Geräte'}`;
  $('filters-apply').textContent = `${list.length} Ergebnisse anzeigen`;
  renderCats(); renderChips();
  renderOptions('f-condition', 'cond', 'condition', v => CONDITIONS[v] || v);
  renderOptions('f-brand', 'brand', 'brand');
  renderOptions('f-color', 'color', 'color', v => v[0].toUpperCase() + v.slice(1));
  initReveal($('grid'));
  // URL aktuell halten -> teilbare Links ("Schau mal, Lackschaden-Waschmaschinen")
  const u = new URLSearchParams();
  if (S.cat) u.set('kategorie', S.cat); if (S.q) u.set('q', S.q);
  S.cond.forEach(v => u.append('zustand', v)); S.brand.forEach(v => u.append('marke', v));
  history.replaceState(null, '', location.pathname + (u.toString() ? '?' + u : ''));
}

/* --- Events --- */
$('cats').addEventListener('click', e => { const b = e.target.closest('.cat'); if (b) { S.cat = b.dataset.cat; render(); } });
$('filters').addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.key) { t.checked ? S[t.dataset.key].add(t.value) : S[t.dataset.key].delete(t.value); render(); }
});
['pmin', 'pmax', 'hmax', 'wmax'].forEach(k => $(k).addEventListener('input', e => { S[k] = e.target.value; render(); }));
$('quick-price').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  S.pmin = $('pmin').value = b.dataset.min || ''; S.pmax = $('pmax').value = b.dataset.max || ''; render();
});
let qT; $('q').value = S.q;
$('q').addEventListener('input', e => { clearTimeout(qT); qT = setTimeout(() => { S.q = e.target.value; render(); }, 150); });
$('sort').addEventListener('change', e => { S.sort = e.target.value; render(); });
$('chips').addEventListener('click', e => {
  const b = e.target.closest('.chip-x'); if (!b) return;
  const { k, v } = b.dataset;
  if (k === 'cat') S.cat = ''; else if (k === 'q') S.q = $('q').value = '';
  else if (k === 'price') S.pmin = S.pmax = $('pmin').value = $('pmax').value = '';
  else if (k === 'hmax' || k === 'wmax') S[k] = $(k).value = '';
  else S[k].delete(v);
  render();
});
$('reset').addEventListener('click', () => {
  Object.assign(S, { cat: '', q: '', pmin: '', pmax: '', hmax: '', wmax: '' });
  ['cond', 'brand', 'color'].forEach(k => S[k].clear());
  ['q', 'pmin', 'pmax', 'hmax', 'wmax'].forEach(k => $(k).value = '');
  render();
});
// Mobile Filter-Schublade
const drawer = open => { $('filters').classList.toggle('is-open', open); $('backdrop').hidden = !open; document.documentElement.classList.toggle('menu-open', open); };
$('filters-open').addEventListener('click', () => drawer(true));
[$('filters-close'), $('backdrop'), $('filters-apply')].forEach(el => el.addEventListener('click', () => drawer(false)));

loadProducts().then(list => { ALL = list; render(); })
  .catch(() => { $('grid').innerHTML = '<p class="alert alert--err">Die Produkte konnten gerade nicht geladen werden. Bitte versuchen Sie es später erneut oder rufen Sie uns an.</p>'; });
