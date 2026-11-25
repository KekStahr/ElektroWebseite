/* ===== Über uns ===== */
// Team: Initialen einsetzen; wenn data-photo gesetzt ist, stattdessen das Foto zeigen
document.querySelectorAll('.tm__photo').forEach(el => {
  if (el.dataset.photo) el.innerHTML = `<img src="${el.dataset.photo}" alt="" loading="lazy">`;
  else el.innerHTML = `<span>${el.dataset.initials || ''}</span>`;
});
document.getElementById('route').href = SITE.mapsUrl;
document.getElementById('loc-status').textContent = openStatus().text;
// Google Maps erst nach Klick laden (keine Datenübertragung ohne Zustimmung)
document.getElementById('map-load').addEventListener('click', () => {
  document.getElementById('map').innerHTML = '<iframe title="Karte: Kaiserstraße 40, 51145 Köln" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=Kaiserstra%C3%9Fe%2040%2C%2051145%20K%C3%B6ln&z=16&output=embed"></iframe>';
});
