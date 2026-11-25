<?php
require __DIR__ . '/lib.php';
header('X-Frame-Options: DENY');
header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store'); // Admin nie aus dem Browser-Cache laden
$v = fn($f) => $f . '?v=' . filemtime(ROOT . $f); // Datei-Version, damit Änderungen sofort ankommen

$error = ''; $info = '';
$step = is_admin() ? 'dash' : (!empty($_SESSION['2fa']) ? 'code' : 'login');

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !is_admin()) {
  if (!hash_equals($_SESSION['csrf'], $_POST['csrf'] ?? '')) {
    $error = 'Sitzung abgelaufen. Bitte erneut versuchen.';
  } elseif (is_locked()) {
    $error = 'Zu viele Fehlversuche. Bitte in 15 Minuten erneut versuchen.';
  } elseif (($_POST['action'] ?? '') === 'login') {
    $user = (string)($_POST['user'] ?? ''); $pass = (string)($_POST['pass'] ?? '');
    // konstante Laufzeit: beide Zugänge immer prüfen
    $isAdmin = hash_equals(ADMIN_USER, $user) & hash_equals(ADMIN_PASS, $pass);
    $isSuper = hash_equals(SUPER_USER, $user) & hash_equals(SUPER_PASS, $pass);
    if ($isAdmin || $isSuper) {
      $role = $isSuper ? 'super' : 'admin';
      if (send_code($role)) { $step = 'code'; $info = 'Wir haben Ihnen einen 6-stelligen Code per E-Mail geschickt.'; }
      else { unset($_SESSION['2fa']); $error = 'Die E-Mail mit dem Code konnte nicht gesendet werden. Bitte Mail-Einstellungen des Hostings prüfen.'; }
    } else { register_fail(); usleep(600000); $error = 'Benutzername oder Passwort ist falsch.'; }
  } elseif (($_POST['action'] ?? '') === 'code' && !empty($_SESSION['2fa'])) {
    $c = &$_SESSION['2fa'];
    $code = preg_replace('/\D/', '', (string)($_POST['code'] ?? ''));
    if (time() > $c['exp'] || $c['tries'] >= 5) {
      unset($_SESSION['2fa']); $step = 'login'; $error = 'Der Code ist abgelaufen. Bitte neu anmelden.';
    } elseif (password_verify($code, $c['hash'])) {
      $role = $c['role'] ?? 'admin';
      unset($_SESSION['2fa']); clear_fails();
      session_regenerate_id(true);
      $_SESSION['admin'] = true; $_SESSION['role'] = $role; $_SESSION['seen'] = time();
      header('Location: /admin/'); exit;
    } else { $c['tries']++; register_fail(); $step = 'code'; $error = 'Der Code ist falsch. Noch ' . (5 - $c['tries']) . ' Versuche.'; }
  } elseif (($_POST['action'] ?? '') === 'resend' && !empty($_SESSION['2fa'])) {
    $step = 'code';
    if (time() - $_SESSION['2fa']['sent'] < 60) $error = 'Bitte warten Sie eine Minute, bevor Sie einen neuen Code anfordern.';
    elseif (send_code($_SESSION['2fa']['role'] ?? 'admin')) $info = 'Neuer Code wurde gesendet.';
    else $error = 'Die E-Mail konnte nicht gesendet werden.';
  } elseif (($_POST['action'] ?? '') === 'cancel') {
    unset($_SESSION['2fa']); $step = 'login';
  }
}
$csrf = h($_SESSION['csrf']);
?>
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>Admin – Scholz &amp; Partner</title>
  <link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="<?= $v('/assets/css/main.css') ?>">
  <link rel="stylesheet" href="<?= $v('/admin/style.css') ?>">
</head>
<body class="admin">

<?php if ($step !== 'dash'): ?>
<main class="login">
  <form class="login__card" method="post" autocomplete="off">
    <img src="/assets/img/favicon.svg" alt="" class="login__logo">
    <input type="hidden" name="csrf" value="<?= $csrf ?>">
    <?php if ($step === 'login'): ?>
      <h1>Admin-Bereich</h1>
      <p class="muted">Schritt 1 von 2 · Anmeldung</p>
      <?php if ($error): ?><p class="alert alert--err"><?= h($error) ?></p><?php endif ?>
      <div class="field"><label for="user">Benutzer-ID</label><input id="user" name="user" required autofocus autocomplete="username"></div>
      <div class="field"><label for="pass">Passwort</label><input id="pass" name="pass" type="password" required autocomplete="current-password"></div>
      <button class="btn btn--navy btn--block" name="action" value="login">Weiter</button>
    <?php else: ?>
      <h1>Bestätigungscode</h1>
      <?php $em = $_SESSION['2fa']['email'] ?? TWOFA_EMAIL; ?>
      <p class="muted">Schritt 2 von 2 · Code aus der E-Mail an <?= h(substr($em, 0, 3) . '•••' . strstr($em, '@')) ?></p>
      <?php if ($info): ?><p class="alert alert--ok"><?= h($info) ?></p><?php endif ?>
      <?php if ($error): ?><p class="alert alert--err"><?= h($error) ?></p><?php endif ?>
      <div class="field"><label for="code">6-stelliger Code</label>
        <input id="code" name="code" class="code-input" inputmode="numeric" pattern="[0-9 ]{6,7}" maxlength="7" required autofocus autocomplete="one-time-code"></div>
      <button class="btn btn--red btn--block" name="action" value="code">Anmelden</button>
      <div class="login__links">
        <button class="linkbtn" name="action" value="resend" formnovalidate>Code erneut senden</button>
        <button class="linkbtn" name="action" value="cancel" formnovalidate>Abbrechen</button>
      </div>
    <?php endif ?>
  </form>
  <a class="login__back" href="/home/">← Zur Website</a>
</main>

<?php else: ?>
<header class="ad-head">
  <div class="ad-head__brand"><img src="/assets/img/favicon.svg" alt=""><strong>Scholz &amp; Partner</strong><span<?= is_super() ? ' class="is-super"' : '' ?>><?= is_super() ? 'Super-Admin' : 'Admin' ?></span></div>
  <div class="ad-head__actions">
    <a class="btn btn--ghost btn--sm" href="/shop/" target="_blank">Shop ansehen ↗</a>
    <button class="btn btn--ghost btn--sm" id="logout" type="button">Abmelden</button>
  </div>
</header>

<main class="ad-main">
  <div class="ad-top">
    <div><h1>Geräte verwalten</h1><p class="muted" id="stats"></p></div>
    <div class="ad-top__actions">
      <?php if (is_super()): ?><button class="btn btn--ghost btn--sm" id="clear-demos" type="button">Beispielgeräte entfernen</button><?php endif ?>
      <button class="btn btn--red" id="new" type="button">+ Neues Gerät</button>
    </div>
  </div>
  <div class="ad-filter">
    <input type="search" id="search" placeholder="Suchen nach Name oder Marke …">
    <select id="fcat"><option value="">Alle Kategorien</option></select>
    <select id="fstate"><option value="">Alle</option><option value="1">Online</option><option value="0">Offline</option></select>
  </div>
  <div class="ad-list" id="list"><p class="muted">Lade …</p></div>
</main>

<!-- Editor -->
<div class="modal" id="modal" hidden>
  <form class="modal__box" id="editor" novalidate>
    <div class="modal__head"><h2 id="ed-title">Neues Gerät</h2><button type="button" class="modal__x" data-close aria-label="Schließen">×</button></div>
    <div class="modal__body">
      <input type="hidden" name="id">
      <div class="ed-grid">
        <div class="field span2"><label>Produktname *</label><input name="name" required maxlength="150" placeholder="z. B. Waschmaschine 8 kg, 1400 U/min"></div>
        <div class="field"><label>Marke *</label><input name="brand" required maxlength="60" list="brandlist"><datalist id="brandlist"></datalist></div>
        <div class="field"><label>Kategorie *</label><select name="category" required></select></div>
        <div class="field"><label>Zustand</label><select name="condition"><option value="neu">Neu</option><option value="lackschaden">Lackschaden</option><option value="gebraucht">Gebraucht</option></select></div>
        <div class="field"><label>Farbe</label><input name="color" maxlength="30" list="colorlist" placeholder="weiß, schwarz, edelstahl …">
          <datalist id="colorlist"><option>weiß</option><option>schwarz</option><option>edelstahl</option><option>silber</option><option>grau</option><option>anthrazit</option><option>rot</option><option>beige</option></datalist></div>
        <div class="field"><label>Unser Preis (€)</label><input name="price" type="number" min="0" step="0.01" placeholder="leer = Preis auf Anfrage"></div>
        <div class="field"><label>UVP / alter Preis (€)</label><input name="oldPrice" type="number" min="0" step="0.01" placeholder="wird durchgestrichen"></div>
        <div class="field"><label>Höhe (cm)</label><input name="height" type="number" min="0" step="0.1"></div>
        <div class="field"><label>Breite (cm)</label><input name="width" type="number" min="0" step="0.1"></div>
        <div class="field"><label>Tiefe (cm)</label><input name="depth" type="number" min="0" step="0.1"></div>
        <div class="field"><label>Energieeffizienz</label><input name="energy" maxlength="10" placeholder="z. B. A"></div>
        <div class="field span2"><label>Beschreibung</label><textarea name="description" maxlength="5000" rows="5"></textarea></div>
        <div class="field span2"><label>Merkmale (eine Zeile = ein Punkt)</label><textarea name="features" rows="4" maxlength="2000" placeholder="8 kg Fassungsvermögen&#10;1400 U/min"></textarea></div>
        <div class="field span2"><label>Bilder (erstes Bild = Hauptbild, max. 8)</label>
          <div class="drop" id="drop"><input type="file" id="files" accept="image/jpeg,image/png,image/webp,image/gif" multiple><p><strong>Bilder hierher ziehen</strong> oder klicken zum Auswählen<br><small>JPG, PNG, WEBP · max. 8 MB pro Bild</small></p></div>
          <div class="thumbs" id="thumbs"></div></div>
        <label class="switch span2"><input type="checkbox" name="active" checked><span></span> Im Shop sichtbar (online)</label>
      </div>
    </div>
    <div class="modal__foot"><span class="muted" id="ed-msg"></span><button type="button" class="btn btn--ghost" data-close>Abbrechen</button><button class="btn btn--red" id="save">Speichern &amp; veröffentlichen</button></div>
  </form>
</div>
<div class="toast" id="toast" hidden></div>

<script>window.CSRF = '<?= $csrf ?>'; window.ROLE = '<?= is_super() ? 'super' : 'admin' ?>';</script>
<script src="<?= $v('/assets/js/main.js') ?>"></script>
<script src="<?= $v('/admin/script.js') ?>"></script>
<?php endif ?>
</body>
</html>
