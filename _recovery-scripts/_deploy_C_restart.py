import paramiko, sys, io, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('45.119.83.233', username='root', password='Tailoc@2026', timeout=20)
def run(cmd, t=90):
    i,o,e = ssh.exec_command(cmd, timeout=t)
    return o.read().decode('utf-8','replace'), e.read().decode('utf-8','replace')

# Restart (plain restart preserves PORT=3008 env; Next loads .env for JWT_SECRET)
out,err = run("pm2 restart autoparts 2>&1 | tail -5")
print("### PM2 RESTART\n", out, err)
time.sleep(7)

out,err = run("pm2 describe autoparts 2>/dev/null | grep -E 'status|exec cwd|restarts|uptime' | head -6")
print("### PM2 STATUS\n", out)

# New cwd should NOT be (deleted)
out,err = run("PID=$(pm2 pid autoparts 2>/dev/null|head -1); echo PID=$PID; readlink /proc/$PID/cwd; for c in $(pgrep -P $PID); do echo child $c cwd: $(readlink /proc/$c/cwd); done")
print("### NEW CWD\n", out)

# HTTP checks
out,err = run("for u in / /login /api/products /api/categories; do code=$(curl -s -m12 -o /dev/null -w '%{http_code}/%{size_download}' http://127.0.0.1:3008$u); echo \"$u -> $code\"; done")
print("### HTTP ROUTES\n", out)

# Static asset (was 500 before because .next deleted) — extract a chunk url from homepage then test it
out,err = run("CHUNK=$(curl -s -m12 http://127.0.0.1:3008/ | grep -oE '/_next/static/[^\"']+\\.(css|js)' | head -1); echo \"chunk=$CHUNK\"; curl -s -m12 -o /dev/null -w 'static_status=%{http_code}\\n' http://127.0.0.1:3008$CHUNK")
print("### STATIC ASSET\n", out)

# Tail logs for errors
out,err = run("tail -8 /root/.pm2/logs/autoparts-out.log 2>/dev/null; echo '--err--'; tail -5 /root/.pm2/logs/autoparts-error.log 2>/dev/null")
print("### PM2 LOGS\n", out)
ssh.close()
