import paramiko, sys, io, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('45.119.83.233', username='root', password='Tailoc@2026', timeout=20)
def run(cmd, t=90):
    i,o,e = ssh.exec_command(cmd, timeout=t)
    return o.read().decode('utf-8','replace'), e.read().decode('utf-8','replace')

# Poll rebuild until done (max ~210s)
done = False
for _ in range(14):
    out,_ = run("grep -c REBUILD_DONE /root/_ap_rebuild.log 2>/dev/null || echo 0")
    if out.strip().endswith("1") or out.strip()=="1":
        done = True; break
    err,_ = run("grep -iE 'failed|ELIFECYCLE|Error:' /root/_ap_rebuild.log | tail -3")
    if err.strip():
        print("### BUILD ERROR:\n", err.strip()); break
    time.sleep(15)
print("### REBUILD DONE:", done)

if done:
    # flush error log so we can confirm fresh start has no warning
    run("> /root/.pm2/logs/autoparts-error.log; pm2 restart autoparts >/dev/null 2>&1; echo ok")
    time.sleep(7)
    out,_ = run("tail -10 /root/.pm2/logs/autoparts-error.log 2>/dev/null | grep -iE 'eslint|unrecognized|invalid next' || echo 'CLEAN_NO_WARNINGS'")
    print("### FRESH ERROR LOG CHECK:", out.strip())
    out,_ = run("for u in / /login /api/products; do echo \"$u $(curl -s -m12 -o /dev/null -w '%{http_code}' http://127.0.0.1:3008$u)\"; done; CHUNK=$(curl -s -m10 http://127.0.0.1:3008/ | grep -oE '/_next/static/[^\"]+\\.css' | head -1); curl -s -m10 -o /dev/null -w \"static $CHUNK -> %{http_code}\\n\" http://127.0.0.1:3008$CHUNK")
    print("### FINAL HTTP\n", out.strip())
    out,_ = run("pm2 describe autoparts 2>/dev/null | grep -E 'status|exec cwd|uptime|restarts' | head -4")
    print("### STATUS\n", out.strip())
    out,_ = run("ls /var/www/autoparts/docs/ && echo '--' && head -1 /var/www/autoparts/RULES.md")
    print("### DOCS ON VPS\n", out.strip())
ssh.close()
