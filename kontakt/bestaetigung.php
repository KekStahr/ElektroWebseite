<?php
// Eingangsbestätigung an den Kunden (Text + HTML). Absichtlich OHNE den Freitext der Nachricht:
// sonst könnte jemand das Formular nutzen, um beliebigen Text an fremde Adressen zu schicken.
function confirmation_mail(array $d): array {
  $rows = array_filter([
    'Anliegen' => $d['topic'],
    'Gerät / Produkt' => $d['geraet'],
    'Reparatur' => $d['ort'],
    'Telefon' => $d['tel'],
    'Rückruf' => $d['rueckruf'],
  ], fn($v) => $v !== '');

  $text = "Guten Tag {$d['name']},\n\n"
    . "vielen Dank für Ihre Anfrage. Sie ist bei uns eingegangen.\n"
    . "Einer unserer Experten schaut sich Ihr Anliegen schnellstmöglich an und meldet sich danach bei Ihnen.\n\n"
    . "Ihre Angaben:\n" . implode('', array_map(fn($k, $v) => "  $k: $v\n", array_keys($rows), $rows))
    . "\nEilt es? Rufen Sie uns gern an: (02203) 540 41\n\n"
    . "Mit freundlichen Grüßen\nIhr Team von Scholz & Partner\n\n"
    . "--\nScholz & Partner Elektro-Hausgeräte-Service · Inh. Joachim Scholz\n"
    . "Kaiserstraße 40 · 51145 Köln-Porz\nTelefon (02203) 540 41 · info@scholz-hausgeraeteservice.de\n"
    . "www.scholz-hausgeraeteservice.de\n";

  $e = fn($s) => htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8');
  $tr = '';
  foreach ($rows as $k => $v) {
    $tr .= '<tr><td style="padding:8px 0;border-bottom:1px solid #e3e5ee;color:#5d6178;font-size:14px;width:40%;vertical-align:top">' . $e($k) . '</td>'
      . '<td style="padding:8px 0;border-bottom:1px solid #e3e5ee;color:#171a4f;font-size:14px;font-weight:600">' . $e($v) . '</td></tr>';
  }
  $font = "font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
  $html = <<<HTML
<!DOCTYPE html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ihre Anfrage ist eingegangen</title></head>
<body style="margin:0;padding:0;background:#f6f7fb;$font">
<div style="display:none;max-height:0;overflow:hidden">Vielen Dank, Ihre Anfrage ist bei uns eingegangen. Wir melden uns schnellstmöglich.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7fb;padding:32px 12px">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(23,26,79,.08)">
  <tr><td style="height:6px;line-height:6px;font-size:0;background:linear-gradient(90deg,#3aa845 0 25%,#f2bf1d 25% 50%,#d7262e 50% 75%,#2459b8 75%);background-color:#262a7a">&nbsp;</td></tr>
  <tr><td style="padding:28px 32px 8px">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td style="padding-right:14px;vertical-align:middle"><img src="cid:logo" width="52" height="52" alt="Scholz &amp; Partner" style="display:block;border:0"></td>
      <td style="vertical-align:middle"><div style="font-size:20px;font-weight:800;color:#171a4f;line-height:1.1">Scholz &amp; Partner</div>
        <div style="font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#d7262e;margin-top:3px">Elektro-Hausgeräte-Service</div></td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:20px 32px 8px">
    <div style="display:inline-block;background:#e7f7ea;color:#1d6b29;font-size:13px;font-weight:700;padding:6px 12px;border-radius:999px">&#10003; Anfrage eingegangen</div>
    <h1 style="margin:16px 0 12px;font-size:24px;line-height:1.25;color:#171a4f">Guten Tag {$e($d['name'])},</h1>
    <p style="margin:0 0 12px;font-size:16px;line-height:1.6;color:#3a3d52">vielen Dank für Ihre Anfrage. Sie ist bei uns eingegangen.</p>
    <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#3a3d52">Einer unserer Experten schaut sich Ihr Anliegen <strong>schnellstmöglich</strong> an und meldet sich danach bei Ihnen.</p>
  </td></tr>
  <tr><td style="padding:0 32px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7fb;border-radius:12px;padding:6px 18px 10px">
      <tr><td colspan="2" style="padding:12px 0 4px;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#262a7a">Ihre Angaben</td></tr>
      $tr
    </table>
  </td></tr>
  <tr><td style="padding:24px 32px 8px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1.5px solid #e3e5ee;border-radius:12px">
      <tr><td style="padding:16px 18px;font-size:15px;color:#3a3d52">Eilt es? Rufen Sie uns gern direkt an:<br>
        <a href="tel:+49220354041" style="font-size:20px;font-weight:800;color:#d7262e;text-decoration:none">(02203) 540 41</a></td></tr>
    </table>
  </td></tr>
  <tr><td style="padding:20px 32px 28px;font-size:16px;line-height:1.6;color:#3a3d52">Mit freundlichen Grüßen<br><strong style="color:#171a4f">Ihr Team von Scholz &amp; Partner</strong></td></tr>
  <tr><td style="background:#171a4f;padding:24px 32px;color:#b9bde8;font-size:13px;line-height:1.7">
    <strong style="color:#ffffff">Scholz &amp; Partner Elektro-Hausgeräte-Service</strong><br>
    Inh. Joachim Scholz · Kaiserstraße 40 · 51145 Köln-Porz<br>
    Telefon <a href="tel:+49220354041" style="color:#ffffff;text-decoration:none">(02203) 540 41</a> ·
    <a href="mailto:info@scholz-hausgeraeteservice.de" style="color:#ffffff;text-decoration:none">info@scholz-hausgeraeteservice.de</a><br>
    <a href="https://scholz-hausgeraeteservice.de/home/" style="color:#ffffff">www.scholz-hausgeraeteservice.de</a><br>
    <span style="color:#8f94c9">Mo bis Do 9:00–13:00 &amp; 14:00–18:00 · Fr 9:00–13:00 &amp; 14:00–17:00</span>
  </td></tr>
</table>
<p style="max-width:560px;margin:16px auto 0;font-size:12px;line-height:1.5;color:#8a8ea6;text-align:center">Diese E-Mail wurde automatisch verschickt, weil über unsere Website eine Anfrage mit dieser Adresse gestellt wurde. Falls Sie das nicht waren, können Sie diese Nachricht einfach ignorieren.</p>
</td></tr></table>
</body></html>
HTML;
  return [$text, $html];
}
