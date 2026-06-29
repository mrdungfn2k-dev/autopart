import paramiko, sys, io, time, json
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('45.119.83.233', username='root', password='Tailoc@2026', timeout=20)
def run(cmd, t=90):
    i,o,e = ssh.exec_command(cmd, timeout=t)
    return o.read().decode('utf-8','replace'), e.read().decode('utf-8','replace')

# 1. upload fixed next.config.ts
sftp = ssh.open_sftp()
sftp.put(r"C:\xampp2\htdocs\autopart-backup\autoparts-source\next.config.ts", "/var/www/autoparts/next.config.ts")
sftp.close()
print("### next.config.ts uploaded")

# 2. restart
out,err = run("pm2 restart autoparts >/dev/null 2>&1; echo restarted")
print("###", out.strip())
time.sleep(7)

# 3. static asset (clean check)
out,err = run(r"""CHUNK=$(curl -s -m12 http://127.0.0.1:3008/ | grep -oE '/_next/static/[^"]+\.(css|js)' | head -1); echo "chunk=$CHUNK"; curl -s -m12 -o /dev/null -w 'static_status=%{http_code}\n' "http://127.0.0.1:3008$CHUNK" """)
print("### STATIC ASSET\n", out.strip())

# 4. customer login redirect on LIVE
out,err = run(r"""curl -s -m12 -X POST http://127.0.0.1:3008/api/auth/login -H 'Content-Type: application/json' -d '{"email":"kh@autopart.vn","password":"Customer@123"}' """)
try:
    d = json.loads(out)
    print("### LIVE customer login -> redirect =", d.get("redirect"), "| user =", (d.get("user") or {}).get("name"))
except Exception:
    print("### LOGIN raw:", out[:200])

# 5. supplier dashboard serves (no crash) — 307 to login without cookie is fine; check it's not 500
out,err = run("for u in /supplier /admin /affiliate /customer; do echo \"$u -> $(curl -s -m12 -o /dev/null -w '%{http_code}' http://127.0.0.1:3008$u)\"; done")
print("### PORTALS (no-cookie, expect 200/307 not 500)\n", out.strip())

# 6. error log clean now?
out,err = run("pm2 restart autoparts >/dev/null 2>&1; sleep 4; tail -6 /root/.pm2/logs/autoparts-error.log 2>/dev/null | grep -iE 'eslint|invalid|unrecognized' || echo 'NO_CONFIG_WARNINGS'")
print("### CONFIG WARNINGS CHECK\n", out.strip())

# 7. final status
out,err = run("pm2 describe autoparts 2>/dev/null | grep -E 'status|exec cwd|uptime' | head -3")
print("### FINAL STATUS\n", out.strip())
ssh.close()
