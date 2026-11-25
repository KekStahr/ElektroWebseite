<?php
// E-Mail-Versand. Ist in config.php ein SMTP-Konto eingetragen, wird darüber verschickt
// (zuverlässig, landet nicht im Spam). Sonst über den Webserver mit PHP mail().
// Mit $html wird eine schöne HTML-Mail (mit eingebettetem Logo) plus Text-Version verschickt.
require_once __DIR__ . '/config.php';

const MAIL_LOGO = __DIR__ . '/../assets/img/logo-mail.png'; // in HTML-Mails als <img src="cid:logo">

function send_mail(string $to, string $subject, string $text, string $replyTo = '', string $html = ''): bool {
  [$headers, $body] = build_mime($text, $html);
  $subj = '=?UTF-8?B?' . base64_encode($subject) . '?=';
  $from = 'From: =?UTF-8?B?' . base64_encode(MAIL_FROM_NAME) . '?= <' . (smtp_on() ? SMTP_USER : MAIL_FROM) . ">\r\n";
  $headers = $from . ($replyTo ? "Reply-To: $replyTo\r\n" : '') . "MIME-Version: 1.0\r\n" . $headers;
  if (!smtp_on()) return mail($to, $subj, $body, rtrim($headers));
  return smtp_send($to, "To: <$to>\r\nSubject: $subj\r\nDate: " . date('r') . "\r\n"
    . 'Message-ID: <' . bin2hex(random_bytes(12)) . '@' . (substr(strrchr(SMTP_USER, '@'), 1) ?: 'localhost') . ">\r\n"
    . $headers . "\r\n" . $body);
}

function smtp_on(): bool { return SMTP_HOST !== '' && SMTP_PASS !== ''; }

// Liefert [Content-Header, Body]. Base64 überall: keine Probleme mit Umlauten oder Zeilen mit nur ".".
function build_mime(string $text, string $html): array {
  $b64 = fn($s) => chunk_split(base64_encode($s));
  if ($html === '') return ["Content-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n", $b64($text)];
  $alt = 'alt_' . bin2hex(random_bytes(8)); $rel = 'rel_' . bin2hex(random_bytes(8));
  $body = "--$rel\r\nContent-Type: multipart/alternative; boundary=\"$alt\"\r\n\r\n"
    . "--$alt\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . $b64($text)
    . "--$alt\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . $b64($html)
    . "--$alt--\r\n";
  if (is_file(MAIL_LOGO)) {
    $body .= "--$rel\r\nContent-Type: image/png; name=\"logo.png\"\r\nContent-Transfer-Encoding: base64\r\n"
      . "Content-ID: <logo>\r\nContent-Disposition: inline; filename=\"logo.png\"\r\n\r\n" . $b64(file_get_contents(MAIL_LOGO));
  }
  return ["Content-Type: multipart/related; boundary=\"$rel\"\r\n", $body . "--$rel--\r\n"];
}

function smtp_send(string $to, string $message): bool {
  $ssl = (int)SMTP_PORT === 465;
  $fp = @stream_socket_client(($ssl ? 'ssl://' : 'tcp://') . SMTP_HOST . ':' . SMTP_PORT, $errno, $errstr, 15);
  if (!$fp) { error_log("SMTP: Verbindung fehlgeschlagen: $errstr"); return false; }
  stream_set_timeout($fp, 15);
  $cmd = function (?string $line, array $ok) use ($fp): void {
    if ($line !== null) fwrite($fp, $line . "\r\n");
    $resp = '';
    while (($l = fgets($fp, 515)) !== false) { $resp .= $l; if (($l[3] ?? ' ') === ' ') break; }
    if (!in_array((int)substr($resp, 0, 3), $ok, true)) throw new RuntimeException(trim($resp) ?: 'keine Antwort');
  };
  try {
    $cmd(null, [220]);
    $cmd('EHLO scholz-hausgeraeteservice.de', [250]);
    if (!$ssl) { // Port 587: erst verschlüsseln
      $cmd('STARTTLS', [220]);
      if (!stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) throw new RuntimeException('TLS fehlgeschlagen');
      $cmd('EHLO scholz-hausgeraeteservice.de', [250]);
    }
    $cmd('AUTH LOGIN', [334]);
    $cmd(base64_encode(SMTP_USER), [334]);
    $cmd(base64_encode(SMTP_PASS), [235]);
    $cmd('MAIL FROM:<' . SMTP_USER . '>', [250]);
    $cmd("RCPT TO:<$to>", [250, 251]);
    $cmd('DATA', [354]);
    $cmd($message . '.', [250]);
    $cmd('QUIT', [221]);
    fclose($fp);
    return true;
  } catch (Throwable $e) {
    error_log('SMTP: ' . $e->getMessage());
    fclose($fp);
    return false;
  }
}
