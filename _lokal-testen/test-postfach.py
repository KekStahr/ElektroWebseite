# Lokales Test-Postfach: fängt Mails auf Port 2525 ab und zeigt sie auf http://localhost:8025
import socket, threading, re, html, email.header
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
MAILS = []

def smtp_client(c):
    f = c.makefile('rwb')
    w = lambda s: (f.write((s + '\r\n').encode()), f.flush())
    w('220 test-postfach')
    data, buf = False, []
    for raw in f:
        line = raw.decode('utf-8', 'replace').rstrip('\r\n')
        if data:
            if line == '.':
                data = False; MAILS.insert(0, '\n'.join(buf)); buf = []; w('250 ok')
            else:
                buf.append(line[1:] if line.startswith('..') else line)
            continue
        cmd = line[:4].upper()
        if cmd == 'DATA': data = True; w('354 go')
        elif cmd == 'QUIT': w('221 bye'); break
        else: w('250 ok')
    c.close()

def smtp_server():
    s = socket.socket(); s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1); s.bind(('127.0.0.1', 2525)); s.listen()
    while True:
        c, _ = s.accept(); threading.Thread(target=smtp_client, args=(c,), daemon=True).start()

import email, email.policy, base64

def parse(raw):
    m = email.message_from_string(raw, policy=email.policy.default)
    text = html_part = None; images = {}
    for part in m.walk():
        ct = part.get_content_type()
        if ct == 'text/plain' and text is None: text = part.get_content()
        elif ct == 'text/html': html_part = part.get_content()
        elif ct.startswith('image/') and part['Content-ID']:
            images[part['Content-ID'].strip('<>')] = f"data:{ct};base64," + base64.b64encode(part.get_payload(decode=True)).decode()
    if html_part:
        for cid, uri in images.items(): html_part = html_part.replace(f'cid:{cid}', uri)
    return str(m['To'] or ''), str(m['Subject'] or ''), text or '', html_part

class Page(BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def do_GET(self):
        cards = []
        for raw in MAILS[:20]:
            to, subj, text, html_body = parse(raw)
            code = re.search(r'^\s{4}(\d{6})$', text, re.M)
            view = (f'<iframe srcdoc="{html.escape(html_body)}" style="width:100%;height:760px;border:1px solid #e3e5ee;border-radius:10px;background:#fff"></iframe>'
                    if html_body else f'<pre>{html.escape(text)}</pre>')
            cards.append(f'''<article><div class="meta">An: <b>{html.escape(to)}</b>{' · <span class="tag">HTML-Mail</span>' if html_body else ''}</div>
              <h2>{html.escape(subj)}</h2>{f'<div class="code">{code.group(1)}</div>' if code else ''}{view}</article>''')
        page = f'''<!doctype html><meta charset="utf-8"><title>Test-Postfach</title>
        <style>body{{font-family:Segoe UI,sans-serif;background:#f6f7fb;margin:0;padding:32px;color:#1b1d2e;max-width:900px;margin:auto}}
        h1{{color:#262a7a}} article{{background:#fff;border-radius:14px;padding:20px 24px;margin:0 0 16px;box-shadow:0 4px 16px rgba(0,0,0,.06)}}
        h2{{font-size:1.05rem;margin:6px 0 12px}} .meta{{color:#5d6178;font-size:.9rem}} pre{{white-space:pre-wrap;color:#3a3d52}}
        .tag{{background:#e7f7ea;color:#1d6b29;padding:2px 8px;border-radius:999px;font-size:.8rem;font-weight:700}}
        .code{{font-size:2.4rem;font-weight:800;letter-spacing:.3em;color:#d7262e;margin:10px 0}}</style>
        <h1>Test-Postfach (nur lokal)</h1><p>Neueste Mail oben. Zum Aktualisieren die Seite neu laden (F5).</p>
        {''.join(cards) or '<p>Noch keine Mails.</p>'}'''
        self.send_response(200); self.send_header('Content-Type', 'text/html; charset=utf-8'); self.end_headers()
        self.wfile.write(page.encode())

threading.Thread(target=smtp_server, daemon=True).start()
ThreadingHTTPServer(('127.0.0.1', 8025), Page).serve_forever()
