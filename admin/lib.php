<?php
require __DIR__ . '/config.php';
require __DIR__ . '/mailer.php';

$https = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
session_set_cookie_params(['lifetime' => 0, 'path' => '/admin', 'secure' => $https, 'httponly' => true, 'samesite' => 'Strict']);
session_name('sp_admin');
session_start();

// Inaktivitäts-Timeout
if (!empty($_SESSION['admin']) && time() - ($_SESSION['seen'] ?? 0) > SESSION_TTL) { $_SESSION = []; session_regenerate_id(true); }
if (!empty($_SESSION['admin'])) $_SESSION['seen'] = time();
if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));

function is_admin(): bool { return !empty($_SESSION['admin']); }
function is_super(): bool { return ($_SESSION['role'] ?? '') === 'super'; }
function h($s): string { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }

/* --- Fehlversuche pro IP (Datei ist .php, damit sie nie als Text ausgeliefert wird) --- */
const ATTEMPTS_FILE = __DIR__ . '/storage/attempts.php';
function attempts_load(): array {
  if (!is_file(ATTEMPTS_FILE)) return [];
  $raw = substr((string)file_get_contents(ATTEMPTS_FILE), strlen('<?php exit; ?>'));
  return json_decode($raw, true) ?: [];
}
function attempts_save(array $a): void {
  $now = time();
  $a = array_filter($a, fn($e) => $now - $e['t'] < LOCK_SECONDS);
  file_put_contents(ATTEMPTS_FILE, '<?php exit; ?>' . json_encode($a), LOCK_EX);
}
function ip_key(): string { return hash('sha256', $_SERVER['REMOTE_ADDR'] ?? ''); }
function is_locked(): bool {
  $e = attempts_load()[ip_key()] ?? null;
  return $e && $e['n'] >= MAX_FAILS && time() - $e['t'] < LOCK_SECONDS;
}
function register_fail(): void {
  $a = attempts_load(); $k = ip_key();
  $a[$k] = ['n' => ($a[$k]['n'] ?? 0) + 1, 't' => time()];
  attempts_save($a);
}
function clear_fails(): void { $a = attempts_load(); unset($a[ip_key()]); attempts_save($a); }

/* --- 2FA-Code per E-Mail. Rolle bestimmt Empfänger-Adresse. --- */
function send_code(string $role): bool {
  $email = $role === 'super' ? SUPER_EMAIL : TWOFA_EMAIL;
  $code = (string)random_int(100000, 999999);
  $_SESSION['2fa'] = ['hash' => password_hash($code, PASSWORD_DEFAULT), 'exp' => time() + CODE_TTL, 'tries' => 0, 'sent' => time(), 'role' => $role, 'email' => $email];
  $body = "Ihr Login-Code für den Admin-Bereich:\n\n    $code\n\nDer Code ist 10 Minuten gültig.\n"
    . "Anmeldeversuch am " . date('d.m.Y H:i') . " Uhr.\n\nWaren Sie das nicht? Dann ignorieren Sie diese E-Mail und ändern Sie das Passwort in admin/config.php.\n";
  return send_mail($email, "Scholz & Partner Admin: Login-Code $code", $body);
}

/* --- Produkte lesen/schreiben (atomar + Sperre) --- */
function products_read(): array {
  return is_file(PRODUCTS_FILE) ? (json_decode((string)file_get_contents(PRODUCTS_FILE), true) ?: []) : [];
}
function products_write(array $list): void {
  $tmp = PRODUCTS_FILE . '.tmp';
  file_put_contents($tmp, json_encode(array_values($list), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), LOCK_EX);
  rename($tmp, PRODUCTS_FILE);
}
