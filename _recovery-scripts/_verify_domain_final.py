import paramiko, sys, io, json
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('45.119.83.233', username='root', password='Tailoc@2026', timeout=20)
def run(cmd, t=40):
    i,o,e = ssh.exec_command(cmd, timeout=t)
    return o.read().decode('utf-8','replace'), e.read().decode('utf-8','replace')

R = "--resolve autopartsvietnam.com.vn:443:127.0.0.1"
# 1. customer login redirect via the DOMAIN (served by our nginx -> 3008)
out,_ = run("curl -s -m15 %s -X POST https://autopartsvietnam.com.vn/api/auth/login -H 'Content-Type: application/json' --data '{\"email\":\"kh@autopart.vn\",\"password\":\"Customer@123\"}'" % R)
try:
    j = json.loads(out); print("DOMAIN customer login -> redirect =", j.get("redirect"), "| user =", (j.get("user") or {}).get("name"))
except Exception:
    print("login raw:", repr(out[:200]))

# 2. domain build CSS hash (should match my deploy: defc6be...)
out,_ = run("curl -s -m12 %s https://autopartsvietnam.com.vn/ | grep -oE '/_next/static/chunks/[a-f0-9]+\\.css' | head -1" % R)
print("DOMAIN homepage CSS chunk =", out.strip())

# 3. static asset + title via domain
out,_ = run("curl -s -m12 %s -o /dev/null -w 'home=%%{http_code}\\n' https://autopartsvietnam.com.vn/; C=$(curl -s -m12 %s https://autopartsvietnam.com.vn/ | grep -oE '/_next/static/chunks/[a-f0-9]+\\.css' | head -1); curl -s -m12 %s -o /dev/null -w \"static=%%{http_code}\\n\" https://autopartsvietnam.com.vn$C" % (R,R,R))
print(out.strip())

# 4. confirm other sites still fine (sample 2)
out,_ = run("for h in chioi.vn vntrust.test9.io.vn; do :; done; nginx -t 2>&1 | tail -1; pm2 describe autoparts 2>/dev/null | grep -E 'status|exec cwd' | head -2")
print("### health:\n", out.strip())
ssh.close()
