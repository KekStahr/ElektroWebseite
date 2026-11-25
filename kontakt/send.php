<?php
// Kontaktformular -> E-Mail an den Laden. Antwortet mit JSON.
require __DIR__ . '/../admin/mailer.php';
header('Content-Type: application/json; charset=utf-8');
session_start();

function out($ok, $error = '') { echo json_encode(['ok' => $ok, 'error' => $error]); exit; }
function clean($s, $max) { return mb_substr(trim(str_replace(["\r", "\0"], '', (string)$s)), 0, $max); }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') out(false, 'Ungültige Anfrage.');
if (!empty($_POST['website'])) out(true); // Honeypot: Bot bekommt "ok", es wird nichts versendet
if (isset($_SESSION['last_contact']) && time() - $_SESSION['last_contact'] < 30) out(false, 'Bitte warten Sie einen Moment, bevor Sie erneut senden.');

$TO = 'info@scholz-hausgeraeteservice.de';
$topics = ['reparatur' => 'Reparatur', 'preisanfrage' => 'Preisanfrage', 'reservierung' => 'Reservierung', 'beratung' => 'Beratung vor Ort', 'kueche' => 'Küchenstudio', 'sonstiges' => 'Sonstiges'];

$name = clean($_POST['name'] ?? '', 100);
$tel = clean($_POST['tel'] ?? '', 40);
$email = clean($_POST['email'] ?? '', 150);
$geraet = clean($_POST['geraet'] ?? '', 200);
$text = clean($_POST['nachricht'] ?? '', 4000);
$rueckruf = clean($_POST['rueckruf'] ?? '', 60);
$topic = $topics[$_POST['anliegen'] ?? ''] ?? 'Sonstiges';
$orte = ['geschaeft' => 'Kunde bringt das Gerät vorbei', 'vor-ort' => 'Techniker-Termin beim Kunden'];
$ort = $orte[$_POST['ort'] ?? ''] ?? '';

if ($name === '' || $tel === '' || $text === '' || empty($_POST['datenschutz'])) out(false, 'Bitte füllen Sie alle Pflichtfelder aus.');
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) out(false, 'Die E-Mail-Adresse ist ungültig.');

$oneLine = fn($s) => str_replace("\n", ' ', $s); // keine Zeilenumbrüche in Headern / Betreff
$subject = "Website-Anfrage: $topic, " . $oneLine($name);
$body = "Neue Anfrage über die Website\n\n"
  . "Anliegen:  $topic\nName:      $name\nTelefon:   $tel\nE-Mail:    " . ($email ?: '-') . "\n"
  . "Gerät:     " . ($geraet ?: '-') . "\n" . ($ort ? "Reparatur: $ort\n" : '')
  . "Rückruf:   $rueckruf\n\nNachricht:\n$text\n";

if (!send_mail($TO, $subject, $body, $email)) out(false, 'Die Nachricht konnte nicht gesendet werden.');
$_SESSION['last_contact'] = time();

// Eingangsbestätigung an den Kunden (nur wenn E-Mail angegeben). Fehler hier blockieren die Anfrage nicht.
if ($email !== '') {
  require __DIR__ . '/bestaetigung.php';
  $ortKunde = ['geschaeft' => 'Sie bringen das Gerät vorbei', 'vor-ort' => 'Techniker-Termin bei Ihnen zu Hause'][$_POST['ort'] ?? ''] ?? '';
  [$cText, $cHtml] = confirmation_mail(['name' => $oneLine($name), 'topic' => $topic, 'geraet' => $geraet, 'ort' => $ortKunde, 'tel' => $tel, 'rueckruf' => $rueckruf]);
  send_mail($email, 'Ihre Anfrage bei Scholz & Partner ist eingegangen', $cText, 'info@scholz-hausgeraeteservice.de', $cHtml);
}
out(true);
