<?php
// Admin-API: nur mit Login + CSRF-Token. Antwortet mit JSON.
require __DIR__ . '/lib.php';
header('Content-Type: application/json; charset=utf-8');

function out($data, int $code = 200) { http_response_code($code); echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); exit; }

if (!is_admin()) out(['error' => 'Nicht angemeldet.'], 401);
$action = $_GET['action'] ?? '';
if ($action === 'list') out(['products' => products_read()]);

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !hash_equals($_SESSION['csrf'], $_SERVER['HTTP_X_CSRF'] ?? '')) out(['error' => 'Ungültige Anfrage.'], 403);

const CATS = ['waschmaschinen', 'trockner', 'kuehlschraenke', 'geschirrspueler', 'herde', 'kaffeemaschinen', 'staubsauger', 'kleingeraete'];
const CONDS = ['neu', 'lackschaden', 'gebraucht'];
const MIME_EXT = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];

$str = fn($k, $max) => mb_substr(trim((string)($_POST[$k] ?? '')), 0, $max);
$num = fn($k) => ($v = trim((string)($_POST[$k] ?? ''))) === '' ? 0 : max(0, round((float)str_replace(',', '.', $v), 2));

// Nur Dateien in unserem Upload-Ordner dürfen gelöscht werden
function delete_image(string $url): void {
  if (strpos($url, UPLOAD_URL . '/') !== 0) return;
  $file = UPLOAD_DIR . '/' . basename($url);
  if (is_file($file)) unlink($file);
}

switch ($action) {
  case 'logout':
    $_SESSION = []; session_destroy();
    out(['ok' => true]);

  case 'clear_demos': // nur Super-Admin: alle Beispielgeräte (demo-*) samt Bildern entfernen
    if (!is_super()) out(['error' => 'Nur für den Super-Admin.'], 403);
    $list = products_read(); $keep = []; $n = 0;
    foreach ($list as $p) {
      if (strpos($p['id'], 'demo-') === 0) { foreach ($p['images'] ?? [] as $img) delete_image($img); $n++; }
      else $keep[] = $p;
    }
    products_write($keep);
    out(['ok' => true, 'removed' => $n]);

  case 'toggle':
    $list = products_read();
    foreach ($list as &$p) if ($p['id'] === ($_POST['id'] ?? '')) { $p['active'] = empty($p['active']); $state = $p['active']; }
    unset($p);
    if (!isset($state)) out(['error' => 'Gerät nicht gefunden.'], 404);
    products_write($list);
    out(['ok' => true, 'active' => $state]);

  case 'delete':
    $list = products_read(); $id = $_POST['id'] ?? ''; $found = false;
    foreach ($list as $i => $p) if ($p['id'] === $id) { foreach ($p['images'] ?? [] as $img) delete_image($img); unset($list[$i]); $found = true; }
    if (!$found) out(['error' => 'Gerät nicht gefunden.'], 404);
    products_write($list);
    out(['ok' => true]);

  case 'save':
    $list = products_read();
    $id = $str('id', 80);
    $idx = null;
    foreach ($list as $i => $p) if ($p['id'] === $id) $idx = $i;
    if ($id !== '' && $idx === null) out(['error' => 'Gerät nicht gefunden.'], 404);
    $old = $idx !== null ? $list[$idx] : null;

    $name = $str('name', 150); $brand = $str('brand', 60);
    $cat = $_POST['category'] ?? ''; $cond = $_POST['condition'] ?? 'neu';
    if ($name === '' || $brand === '') out(['error' => 'Name und Marke sind Pflichtfelder.'], 422);
    if (!in_array($cat, CATS, true)) out(['error' => 'Bitte eine gültige Kategorie wählen.'], 422);
    if (!in_array($cond, CONDS, true)) $cond = 'neu';

    // Bilder: Reihenfolge kommt als order[] = "old:<url>" | "new:<index>"
    $oldImages = $old['images'] ?? [];
    $newFiles = $_FILES['new'] ?? null;
    $images = [];
    if (!is_dir(UPLOAD_DIR)) mkdir(UPLOAD_DIR, 0755, true);
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    foreach ((array)($_POST['order'] ?? []) as $o) {
      if (count($images) >= MAX_IMAGES) break;
      if (strpos($o, 'old:') === 0) {
        $url = substr($o, 4);
        if (in_array($url, $oldImages, true)) $images[] = $url; // nur eigene, bekannte Bilder
      } elseif (strpos($o, 'new:') === 0 && $newFiles) {
        $i = (int)substr($o, 4);
        if (!isset($newFiles['tmp_name'][$i]) || $newFiles['error'][$i] !== UPLOAD_ERR_OK) continue;
        if ($newFiles['size'][$i] > MAX_IMAGE_BYTES) out(['error' => 'Ein Bild ist größer als 8 MB.'], 422);
        $mime = $finfo->file($newFiles['tmp_name'][$i]);
        if (!isset(MIME_EXT[$mime]) || !getimagesize($newFiles['tmp_name'][$i])) out(['error' => 'Nur JPG, PNG, WEBP oder GIF erlaubt.'], 422);
        $fname = bin2hex(random_bytes(12)) . '.' . MIME_EXT[$mime]; // Endung aus echtem Dateityp -> nie ausführbar
        if (!move_uploaded_file($newFiles['tmp_name'][$i], UPLOAD_DIR . '/' . $fname)) out(['error' => 'Bild konnte nicht gespeichert werden.'], 500);
        $images[] = UPLOAD_URL . '/' . $fname;
      }
    }
    // entfernte alte Bilder vom Server löschen
    foreach (array_diff($oldImages, $images) as $gone) delete_image($gone);

    $features = array_values(array_filter(array_map(fn($l) => mb_substr(trim($l), 0, 150), explode("\n", $str('features', 2000)))));
    $slug = trim(preg_replace('/[^a-z0-9]+/', '-', strtolower(strtr("$brand $name", ['ä' => 'ae', 'ö' => 'oe', 'ü' => 'ue', 'ß' => 'ss', 'Ä' => 'ae', 'Ö' => 'oe', 'Ü' => 'ue']))), '-');
    $product = [
      'id' => $old['id'] ?? (substr($slug, 0, 50) . '-' . bin2hex(random_bytes(3))),
      'name' => $name, 'brand' => $brand, 'category' => $cat, 'condition' => $cond,
      'price' => $num('price'), 'oldPrice' => $num('oldPrice'),
      'color' => mb_strtolower($str('color', 30)),
      'height' => $num('height'), 'width' => $num('width'), 'depth' => $num('depth'),
      'energy' => $str('energy', 10), 'description' => $str('description', 5000), 'features' => $features,
      'images' => $images, 'active' => !empty($_POST['active']),
      'createdAt' => $old['createdAt'] ?? gmdate('c'), 'updatedAt' => gmdate('c'),
    ];
    if ($idx !== null) $list[$idx] = $product; else array_unshift($list, $product);
    products_write($list);
    out(['ok' => true, 'product' => $product]);
}
out(['error' => 'Unbekannte Aktion.'], 400);
