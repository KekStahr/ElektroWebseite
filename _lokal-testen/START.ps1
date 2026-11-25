# Startet die Website lokal zum Testen.
#   Website + Admin:  http://localhost:8081
#   Test-Postfach:    http://localhost:8025   (zeigt Login-Codes und Kontakt-Mails, solange kein Gmail-App-Passwort eingetragen ist)
# Beenden: die beiden schwarzen Fenster schließen.
# Voraussetzung: PHP und Python sind installiert (siehe README.md, Abschnitt "Lokal testen").

$root = Split-Path $PSScriptRoot -Parent

$php = (Get-Command php -ErrorAction SilentlyContinue).Source
if (-not $php) { Write-Host "PHP wurde nicht gefunden. Bitte PHP installieren (siehe README.md)." -ForegroundColor Red; Read-Host "Enter zum Schließen"; exit 1 }
$python = (Get-Command python -ErrorAction SilentlyContinue).Source
if (-not $python) { Write-Host "Python wurde nicht gefunden. Bitte Python installieren (siehe README.md)." -ForegroundColor Red; Read-Host "Enter zum Schließen"; exit 1 }

# Test-Postfach (fängt Mails auf Port 2525 ab, zeigt sie auf Port 8025)
Start-Process $python -ArgumentList "`"$PSScriptRoot\test-postfach.py`""

# PHP-Server mit den nötigen Erweiterungen; Mails ohne App-Passwort gehen ins Test-Postfach
$ext = Join-Path (Split-Path $php) 'ext'
$phpArgs = @(
  "-d", "extension_dir=`"$ext`"", "-d", "extension=openssl", "-d", "extension=fileinfo", "-d", "extension=mbstring",
  "-d", "SMTP=127.0.0.1", "-d", "smtp_port=2525",
  "-d", "upload_max_filesize=10M", "-d", "post_max_size=80M",
  "-S", "localhost:8081", "-t", "`"$root`""
)
Start-Process $php -ArgumentList $phpArgs -WorkingDirectory $root

Start-Sleep -Seconds 2
Start-Process "http://localhost:8081/home/"
Start-Process "http://localhost:8025"
