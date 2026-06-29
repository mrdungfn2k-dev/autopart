import paramiko, sys, io, json
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('45.119.83.233', username='root', password='Tailoc@2026', timeout=20)
def run(cmd, t=40):
    i,o,e = ssh.exec_command(cmd, timeout=t)
    return o.read().decode('utf-8','replace'), e.read().decode('utf-8','replace')

# Decisive: customer login redirect on PUBLIC domain vs my LOCAL deploy
out,_ = run("curl -s -m15 -X POST https://autopartsvietnam.com.vn/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"kh@autopart.vn\",\"password\":\"Customer@123\"}'")
try:
    print("PUBLIC domain  customer login redirect =", json.loads(out).get("redirect"))
except Exception:
    print("PUBLIC raw:", out[:200])

out,_ = run("curl -s -m12 -X POST http://127.0.0.1:3008/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"kh@autopart.vn\",\"password\":\"Customer@123\"}'")
try:
    print("45.119.83.233:3008 (my deploy) redirect =", json.loads(out).get("redirect"))
except Exception:
    print("LOCAL raw:", out[:200])

# Does the public domain show my SupplierSidebar fix? Probe a marker: my deploy removed nav icons (no <svg> path in customer sidebar). Compare /customer HTML length won't work (needs auth).
# Instead check a static asset hash: my build's homepage css chunk name vs public's.
out,_ = run("echo PUBLIC css:; curl -s -m12 https://autopartsvietnam.com.vn/ | grep -oE '/_next/static/chunks/[a-f0-9]+\\.css' | head -2; echo MINE css:; curl -s -m12 http://127.0.0.1:3008/ | grep -oE '/_next/static/chunks/[a-f0-9]+\\.css' | head -2")
print(out.strip())
ssh.close()
