/* ===== Admin: Geräte anlegen, bearbeiten, löschen ===== */
const $ = id => document.getElementById(id);
const api = async (action, body) => {
  const res = await fetch(`/admin/api.php?action=${action}`, body ? { method: 'POST', headers: { 'X-CSRF': window.CSRF }, body } : {});
  if (res.status === 401) { location.reload(); throw new Error('Bitte neu anmelden.'); }
  const data = await res.json().catch(() => ({ error: 'Serverfehler.' }));
  if (!res.ok || data.error) throw new Error(data.error || 'Fehler');
  return data;
};
const toast = (msg, err) => { const t = $('toast'); t.textContent = msg; t.className = 'toast' + (err ? ' is-err' : ''); t.hidden = false; clearTimeout(t._t); t._t = setTimeout(() => t.hidden = true, 3200); };

let PRODUCTS = [];
const form = $('editor');
let imgs = []; // [{type:'old', url} | {type:'new', file, url}]

// Auswahllisten
$('fcat').innerHTML += CATEGORIES.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
form.category.innerHTML = CATEGORIES.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
$('brandlist').innerHTML = BRANDS.map(b => `<option>${esc(b.name)}</option>`).join('');

async function load() {
  PRODUCTS = (await api('list')).products;
  renderList();
}

function renderList() {
  const q = $('search').value.toLowerCase(), cat = $('fcat').value, st = $('fstate').value;
  const list = PRODUCTS.filter(p => (!q || `${p.name} ${p.brand}`.toLowerCase().includes(q)) && (!cat || p.category === cat) && (st === '' || String(+!!p.active) === st));
  const on = PRODUCTS.filter(p => p.active).length;
  $('stats').textContent = `${PRODUCTS.length} Geräte · ${on} online · ${PRODUCTS.length - on} offline`;
  $('list').innerHTML = list.length ? list.map(p => `
    <div class="row ${p.active ? '' : 'is-off'}" data-id="${esc(p.id)}">
      <div class="row__img">${p.images?.length ? `<img src="${esc(p.images[0])}" alt="">` : icon(category(p.category).icon)}</div>
      <div class="row__info"><strong>${esc(p.name)}</strong>
        <span>${esc(p.brand)} · ${esc(category(p.category).name)} · <span class="badge badge--${esc(p.condition)}">${CONDITIONS[p.condition]}</span>${p.id.startsWith('demo-') ? ' <span class="badge badge--sale">Beispiel – ersetzen</span>' : ''}</span></div>
      <div class="row__price">${p.price ? euro(p.price) : '<em>auf Anfrage</em>'}${p.oldPrice > p.price && p.price ? `<small>UVP ${euro(p.oldPrice)}</small>` : ''}</div>
      <label class="switch" title="Online / Offline"><input type="checkbox" data-act="toggle" ${p.active ? 'checked' : ''}><span></span></label>
      <div class="row__actions">
        <a class="btn btn--ghost btn--sm" href="/shop/produkt/?id=${encodeURIComponent(p.id)}" target="_blank" title="Ansehen">↗</a>
        <button class="btn btn--navy btn--sm" data-act="edit">Bearbeiten</button>
        <button class="btn btn--ghost btn--sm danger" data-act="delete" title="Löschen">Löschen</button>
      </div>
    </div>`).join('') : '<p class="muted empty-list">Keine Geräte gefunden.</p>';
}

$('list').addEventListener('click', async e => {
  const b = e.target.closest('[data-act]'); if (!b || b.dataset.act === 'toggle') return;
  const id = b.closest('.row').dataset.id, p = PRODUCTS.find(x => x.id === id);
  if (b.dataset.act === 'edit') openEditor(p);
  if (b.dataset.act === 'delete') {
    if (!confirm(`„${p.brand} ${p.name}“ endgültig löschen?\nDie Bilder werden ebenfalls gelöscht. Das kann nicht rückgängig gemacht werden.\n\nTipp: Mit dem Schalter können Sie ein Gerät auch nur offline nehmen.`)) return;
    const fd = new FormData(); fd.append('id', id);
    try { await api('delete', fd); toast('Gerät gelöscht.'); load(); } catch (err) { toast(err.message, true); }
  }
});
$('list').addEventListener('change', async e => {
  if (e.target.dataset.act !== 'toggle') return;
  const fd = new FormData(); fd.append('id', e.target.closest('.row').dataset.id);
  try { const r = await api('toggle', fd); toast(r.active ? 'Gerät ist jetzt online.' : 'Gerät ist jetzt offline.'); load(); } catch (err) { toast(err.message, true); e.target.checked = !e.target.checked; }
});
['search', 'fcat', 'fstate'].forEach(id => $(id).addEventListener('input', renderList));

/* --- Editor --- */
function openEditor(p) {
  form.reset();
  $('ed-title').textContent = p ? 'Gerät bearbeiten' : 'Neues Gerät';
  $('ed-msg').textContent = '';
  const v = p || { condition: 'neu', active: true, category: CATEGORIES[0].id };
  ['id', 'name', 'brand', 'category', 'condition', 'color', 'energy', 'description'].forEach(k => form[k].value = v[k] ?? '');
  ['price', 'oldPrice', 'height', 'width', 'depth'].forEach(k => form[k].value = v[k] || '');
  form.features.value = (v.features || []).join('\n');
  form.active.checked = v.active !== false;
  imgs = (v.images || []).map(url => ({ type: 'old', url }));
  renderThumbs();
  $('modal').hidden = false;
  document.documentElement.classList.add('menu-open');
  form.name.focus();
}
const closeEditor = () => { $('modal').hidden = true; document.documentElement.classList.remove('menu-open'); imgs.forEach(i => i.type === 'new' && URL.revokeObjectURL(i.url)); };
$('new').addEventListener('click', () => openEditor());
$('modal').addEventListener('click', e => { if (e.target.matches('[data-close]') || e.target === $('modal')) closeEditor(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('modal').hidden) closeEditor(); });

function renderThumbs() {
  $('thumbs').innerHTML = imgs.map((im, i) => `<div class="thumb ${i ? '' : 'is-main'}"><img src="${esc(im.url)}" alt="">
    ${i ? `<button type="button" data-main="${i}" title="Als Hauptbild">★</button>` : '<span>Hauptbild</span>'}
    <button type="button" class="thumb__x" data-rm="${i}" title="Entfernen">×</button></div>`).join('');
}
$('thumbs').addEventListener('click', e => {
  const m = e.target.dataset.main, r = e.target.dataset.rm;
  if (m) imgs.unshift(...imgs.splice(+m, 1));
  if (r) { const [x] = imgs.splice(+r, 1); if (x.type === 'new') URL.revokeObjectURL(x.url); }
  renderThumbs();
});
function addFiles(files) {
  for (const f of files) {
    if (imgs.length >= 8) { toast('Maximal 8 Bilder pro Gerät.', true); break; }
    if (!/^image\/(jpeg|png|webp|gif)$/.test(f.type)) { toast(`${f.name}: nur JPG, PNG, WEBP oder GIF.`, true); continue; }
    if (f.size > 8 * 1024 * 1024) { toast(`${f.name} ist größer als 8 MB.`, true); continue; }
    imgs.push({ type: 'new', file: f, url: URL.createObjectURL(f) });
  }
  renderThumbs();
}
$('files').addEventListener('change', e => { addFiles(e.target.files); e.target.value = ''; });
const drop = $('drop');
['dragenter', 'dragover'].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.add('is-over'); }));
['dragleave', 'drop'].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.remove('is-over'); }));
drop.addEventListener('drop', e => addFiles(e.dataTransfer.files));

form.addEventListener('submit', async e => {
  e.preventDefault();
  if (!form.name.value.trim() || !form.brand.value.trim()) { $('ed-msg').textContent = 'Bitte Name und Marke ausfüllen.'; return; }
  const fd = new FormData(form);
  fd.delete('active'); if (form.active.checked) fd.append('active', '1');
  let n = 0;
  imgs.forEach(im => {
    if (im.type === 'old') fd.append('order[]', 'old:' + im.url);
    else { fd.append('new[]', im.file); fd.append('order[]', 'new:' + n++); }
  });
  const btn = $('save'); btn.disabled = true; btn.textContent = 'Speichere …';
  try {
    await api('save', fd);
    closeEditor(); toast('Gespeichert – das Gerät ist im Shop aktualisiert.'); load();
  } catch (err) { $('ed-msg').textContent = err.message; }
  finally { btn.disabled = false; btn.textContent = 'Speichern & veröffentlichen'; }
});

$('logout').addEventListener('click', async () => { try { await api('logout', new FormData()); } finally { location.href = '/admin/'; } });

// Super-Admin: alle Beispielgeräte auf einmal entfernen
$('clear-demos')?.addEventListener('click', async () => {
  const demos = PRODUCTS.filter(p => p.id.startsWith('demo-')).length;
  if (!demos) return toast('Keine Beispielgeräte vorhanden.');
  if (!confirm(`${demos} Beispielgeräte endgültig entfernen? Das kann nicht rückgängig gemacht werden.`)) return;
  try { const r = await api('clear_demos', new FormData()); toast(`${r.removed} Beispielgeräte entfernt.`); load(); } catch (err) { toast(err.message, true); }
});

load().catch(err => { $('list').innerHTML = `<p class="alert alert--err">${esc(err.message)}</p>`; });
