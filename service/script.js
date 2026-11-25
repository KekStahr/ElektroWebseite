/* ===== Service ===== */
// Nur ein Geräte-Akkordeon gleichzeitig offen -> bleibt übersichtlich
document.querySelectorAll('#geraete details').forEach(d => d.addEventListener('toggle', () => {
  if (d.open) document.querySelectorAll('#geraete details[open]').forEach(o => o !== d && (o.open = false));
}));
