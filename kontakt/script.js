/* ===== Kontakt: Formular wird über URL-Parameter vorausgefüllt (z. B. aus Shop oder Reparatur-Check) ===== */
const P = new URLSearchParams(location.search);
const form = document.getElementById('form');
const TITLES = { reparatur: 'Reparatur anfragen', preisanfrage: 'Preis anfragen', reservierung: 'Gerät reservieren', beratung: 'Beratungstermin vereinbaren', kueche: 'Küchenberatung vereinbaren' };

const topic = P.get('anliegen');
if (topic && form.anliegen && [...form.anliegen].some(r => r.value === topic)) form.anliegen.value = topic;
if (TITLES[topic]) document.getElementById('k-title').textContent = TITLES[topic];
const device = P.get('produkt') || [P.get('marke'), P.get('geraet')].filter(Boolean).join(' ');
if (device) form.geraet.value = device;
const lines = [];
if (P.get('problem')) lines.push(`Problem: ${P.get('problem')}`);
if (topic === 'reservierung') lines.push('Ich möchte dieses Gerät unverbindlich reservieren.');
if (topic === 'preisanfrage' && device) lines.push(`Bitte nennen Sie mir Ihren Preis für: ${device}`);
form.nachricht.value = lines.join('\n');

// Reparatur-Ort: nur bei "Reparatur" sichtbar, per Link vorauswählbar (?ort=vor-ort | geschaeft)
const place = document.getElementById('place');
const ortParam = P.get('ort');
if (ortParam && [...form.ort].some(r => r.value === ortParam)) form.ort.value = ortParam;
const syncPlace = () => { place.hidden = form.anliegen.value !== 'reparatur'; };
form.addEventListener('change', e => { if (e.target.name === 'anliegen') syncPlace(); if (e.target.name === 'ort') place.classList.remove('has-error'); });
syncPlace();

document.getElementById('k-open').textContent = openStatus().text;
document.getElementById('k-route').href = SITE.mapsUrl;

form.addEventListener('submit', async e => {
  e.preventDefault();
  const msg = document.getElementById('form-msg');
  form.querySelectorAll('.has-error').forEach(f => f.classList.remove('has-error'));
  const bad = [...form.querySelectorAll('[required]')].filter(el => el.type === 'checkbox' ? !el.checked : !el.value.trim());
  if (form.email.value && !form.email.checkValidity()) bad.push(form.email);
  const needPlace = !place.hidden && !form.ort.value;
  if (bad.length || needPlace) {
    bad.forEach(el => el.closest('.field')?.classList.add('has-error'));
    place.classList.toggle('has-error', needPlace);
    msg.innerHTML = `<p class="alert alert--err">${needPlace && !bad.length ? 'Bitte wählen Sie, ob Sie das Gerät vorbeibringen oder ein Techniker zu Ihnen kommen soll.' : 'Bitte füllen Sie alle Pflichtfelder aus und bestätigen Sie den Datenschutz-Hinweis.'}</p>`;
    (bad[0] || form.ort[0]).focus();
    return;
  }
  const btn = document.getElementById('submit');
  const data = new FormData(form);
  if (place.hidden) data.delete('ort');
  btn.disabled = true; btn.textContent = 'Wird gesendet …';
  try {
    const res = await fetch('/kontakt/send.php', { method: 'POST', body: data });
    const out = await res.json();
    if (!out.ok) throw new Error(out.error);
    form.innerHTML = `<div class="alert alert--ok" style="font-size:1.1rem">Vielen Dank! Ihre Anfrage ist bei uns angekommen. Wir melden uns schnellstmöglich bei Ihnen.</div>
      <p>Eilt es? Rufen Sie uns gern direkt an: <a href="${SITE.phoneHref}"><strong>${SITE.phone}</strong></a></p>`;
  } catch (err) {
    msg.innerHTML = `<p class="alert alert--err">${esc(err.message || 'Senden fehlgeschlagen.')} Bitte rufen Sie uns an: <a href="${SITE.phoneHref}">${SITE.phone}</a></p>`;
    btn.disabled = false; btn.textContent = 'Anfrage senden';
  }
});
