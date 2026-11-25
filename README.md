# Scholz & Partner – Website

Statische Seiten + kleines PHP-Backend (läuft auf jedem normalen PHP-Webhosting, keine Datenbank nötig).

## Seiten

| URL | Ordner |
|---|---|
| `/home/` | Startseite (`/` leitet dorthin weiter) |
| `/service/` | Reparatur (Vergleich Geschäft / Vor Ort), Kaffeemaschinen, Lieferung, Beratung, Küche |
| `/shop/` | Shop mit Kategorien + Filtern (Preis, Marke, Farbe, Zustand, Größe) |
| `/shop/produkt/?id=…` | Produktdetail |
| `/ueber-uns/` | Über uns, `#kuechenstudio`, `#standort`, `#presse` |
| `/kontakt/` | Kontaktformular (`send.php` mailt an info@) |
| `/impressum/`, `/datenschutz/` | Rechtliches |
| `/admin/` | Admin-Bereich (Login + 2FA-Code per E-Mail) |

Jeder Seitenordner hat `index.html`, `style.css`, `script.js` und `img/`, `video/`, `gif/` für eigene Medien.
Gemeinsames liegt in `/assets/` (Design, Header/Footer, Firmendaten in `assets/js/main.js` → `SITE`, `BRANDS`).

## Admin

Aufruf: `/admin/`. Anmeldung in zwei Schritten: ID + Passwort, dann 6-stelliger Code aus der E-Mail.

Zwei Zugänge (in `admin/config.php`):
- **Laden-Admin:** `ElektroLaden` / `ElektroladenScholz`, Code geht an onemillionbaby100@gmail.com. Kann Geräte anlegen, bearbeiten, online/offline schalten und löschen.
- **Super-Admin:** `Reso` / `ResoSuperAdmin`, Code geht an ahmed.bilgic1998@gmail.com. Hat alle Rechte des Laden-Admins plus den Knopf „Beispielgeräte entfernen“ (löscht alle `demo-…` auf einmal). Oben rechts erscint das Abzeichen „Super-Admin“.

- Produkte landen in `data/products.json`, Bilder in `uploads/products/`.
- Die 8 Produkte mit `demo-…` sind **Beispiele** – vor dem Livegang im Admin löschen/ersetzen (als Super-Admin mit einem Klick).
- Ordner `data/`, `uploads/products/`, `admin/storage/` müssen vom Webserver **beschreibbar** sein.

### Schutz gegen Angriffe
Login mit 2-Faktor-Code, CSRF-Token bei jeder Änderung, Sperre nach 5 Fehlversuchen (15 Min), automatische Abmeldung nach 2 Std. Hochgeladene Bilder werden auf echten Bildtyp geprüft und per `.htaccess` nie als Skript ausgeführt. Alle Eingaben werden maskiert ausgegeben (kein XSS). **Nach dem Livegang beide Passwörter in `admin/config.php` ändern.**

## Hochladen

Alles per FTP in das Web-Verzeichnis der Domain kopieren (inkl. `.htaccess`-Dateien), **außer** den Ordnern `_lokal-testen` und `.claude`. Voraussetzungen: PHP ≥ 7.4 mit `fileinfo` und `openssl`.

## E-Mail-Versand (Login-Codes + Kontaktformular)

Verschickt wird über das Gmail-Konto onemillionbaby100@gmail.com (SMTP, verschlüsselt). Einmalig einrichten:
1. Google-Konto → Sicherheit → **2-Schritt-Bestätigung** einschalten.
2. https://myaccount.google.com/apppasswords öffnen, App-Passwort mit Namen „Website“ erstellen.
3. Das 16-stellige Passwort ohne Leerzeichen in `admin/config.php` bei `SMTP_PASS` eintragen.

Ist `SMTP_PASS` leer, wird über den Webserver (`mail()`) verschickt. Lokal landen die Mails dann im Test-Postfach unter http://localhost:8025.
Ist `SMTP_PASS` eingetragen, gehen die Mails **auch beim lokalen Testen echt raus** (an die Gmail-Adressen und an Kunden).

Wer bekommt was:
| Mail | Empfänger |
|---|---|
| Login-Code Laden-Admin | `TWOFA_EMAIL` (onemillionbaby100@gmail.com) |
| Login-Code Super-Admin | `SUPER_EMAIL` (ahmed.bilgic1998@gmail.com) |
| Neue Anfrage aus dem Kontaktformular | info@scholz-hausgeraeteservice.de (in `kontakt/send.php`, Variable `$TO`) |
| Eingangsbestätigung mit Logo | der Kunde, wenn er seine E-Mail angibt |

Kommt nichts an: zuerst Spam-Ordner prüfen. Meldet die Seite „E-Mail konnte nicht gesendet werden“, ist das App-Passwort falsch oder die 2-Schritt-Bestätigung aus.

## Vor dem Livegang noch zu tun

- Echte Fotos einfügen (Hero, Inhaber, Ausstellung), Marken-Logos in `BRANDS` (`logo: '/assets/img/brands/miele.svg'`).
- Echte Google-Bewertungen in `data/reviews.json` eintragen: `[{"name":"…","stars":5,"text":"…","source":"Google"}]`
- Datenschutzerklärung rechtlich prüfen lassen; AGB und Batteriehinweis von der alten Seite übernehmen.
- Admin-Passwort in `admin/config.php` ändern.

## Lokal testen (auf einem beliebigen Windows-PC)

**Einmalig installieren:**
1. **PHP:** https://windows.php.net/download → bei „VS16 x64 Non Thread Safe“ das **Zip** laden, nach `C:\php` entpacken.
   Dann `C:\php` zur Windows-Umgebungsvariable **Path** hinzufügen (Startmenü → „Umgebungsvariablen“ → Path → Neu).
2. **Python:** https://www.python.org/downloads/ → installieren, dabei **„Add python.exe to PATH“** anhaken.
3. Prüfen in einer neuen PowerShell: `php -v` und `python --version` zeigen jeweils eine Version.

**Starten:** Doppelklick auf `_lokal-testen\START.bat`. Es öffnen sich zwei schwarze Fenster (Server) und der Browser.
Beenden: beide schwarzen Fenster schließen.

| Was | Adresse |
|---|---|
| Startseite | http://localhost:8081/home/ |
| Service | http://localhost:8081/service/ |
| Shop | http://localhost:8081/shop/ |
| Produktseite (Beispiel) | http://localhost:8081/shop/produkt/?id=demo-wm-1 |
| Über uns | http://localhost:8081/ueber-uns/ |
| Kontakt | http://localhost:8081/kontakt/ |
| Impressum / Datenschutz | http://localhost:8081/impressum/ · http://localhost:8081/datenschutz/ |
| Admin | http://localhost:8081/admin/ |
| Test-Postfach | http://localhost:8025 |

Der Ordner `_lokal-testen` ist nur zum Testen und wird **nicht** auf den Webserver hochgeladen.
