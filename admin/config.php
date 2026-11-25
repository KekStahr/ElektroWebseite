<?php
// ===== Admin-Zugang (Laden) – HIER ändern =====
const ADMIN_USER = 'ElektroLaden';
const ADMIN_PASS = 'ElektroladenScholz';          // bitte nach dem Livegang ändern
const TWOFA_EMAIL = 'onemillionbaby100@gmail.com'; // hierhin geht der Login-Code

// ===== Super-Admin (voller Zugriff) – eigener Zugang mit eigener 2FA-Adresse =====
const SUPER_USER = 'Reso';
const SUPER_PASS = 'ResoSuperAdmin';
const SUPER_EMAIL = 'ahmed.bilgic1998@gmail.com'; // 2FA-Code für den Super-Admin

const MAIL_FROM = 'noreply@scholz-hausgeraeteservice.de';
const MAIL_FROM_NAME = 'Scholz & Partner Website';

// ===== E-Mail-Versand über Gmail (empfohlen) =====
// 1. Im Google-Konto onemillionbaby100@gmail.com die 2-Schritt-Bestätigung einschalten.
// 2. Auf https://myaccount.google.com/apppasswords ein App-Passwort erstellen (Name z. B. "Website").
// 3. Das 16-stellige App-Passwort unten bei SMTP_PASS eintragen (Leerzeichen weglassen).
// Bleibt SMTP_PASS leer, wird über den Webserver verschickt (lokal: Test-Postfach).
const SMTP_HOST = 'smtp.gmail.com';
const SMTP_PORT = 465;
const SMTP_USER = 'onemillionbaby100@gmail.com';
const SMTP_PASS = '';

const CODE_TTL = 600;          // Code gültig: 10 Minuten
const SESSION_TTL = 7200;      // automatisch abmelden nach 2 Std. Inaktivität
const MAX_FAILS = 5;           // Fehlversuche pro IP ...
const LOCK_SECONDS = 900;      // ... dann 15 Minuten Sperre

define('ROOT', dirname(__DIR__));
define('PRODUCTS_FILE', ROOT . '/data/products.json');
define('UPLOAD_DIR', ROOT . '/uploads/products');
const UPLOAD_URL = '/uploads/products';
const MAX_IMAGES = 8;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
