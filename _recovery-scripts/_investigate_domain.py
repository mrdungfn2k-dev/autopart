import paramiko, sys, io, socket
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

dom = "autopartsvietnam.com.vn"
try:
    print("DNS %s -> %s" % (dom, socket.gethostbyname(dom)))
except Exception as e:
    print("DNS err:", e)

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('45.119.83.233', username='root', password='Tailoc@2026', timeout=20)
def run(cmd, t=40):
    i,o,e = ssh.exec_command(cmd, timeout=t)
    return o.read().decode('utf-8','replace'), e.read().decode('utf-8','replace')

for label,c in [
  ("this server public IP", "curl -s -m10 ifconfig.me; echo"),
  ("nginx refs to domain", "grep -rl 'autopartsvietnam' /etc/nginx/ 2>/dev/null"),
  ("nginx refs to :3008", "grep -rl '3008' /etc/nginx/ 2>/dev/null"),
  ("nginx domain block", "grep -rA12 'server_name .*autopartsvietnam' /etc/nginx/ 2>/dev/null | head -40"),
  ("port 3008 listening", "ss -tlnp 2>/dev/null | grep ':3008'"),
  ("curl LOCAL :3008 head", "curl -s -m10 http://127.0.0.1:3008/ | grep -oiE '<title>[^<]*</title>' | head -1"),
  ("curl PUBLIC domain (via DNS)", "curl -s -m15 -I https://autopartsvietnam.com.vn/ 2>&1 | head -8"),
  ("curl PUBLIC domain title", "curl -s -m15 https://autopartsvietnam.com.vn/ 2>&1 | grep -oiE '<title>[^<]*</title>' | head -1"),
  ("PUBLIC login redirect (customer)", "curl -s -m15 -X POST https://autopartsvietnam.com.vn/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"kh@autopart.vn\",\"password\":\"Customer@123\"}' 2>&1 | head -c 300"),
]:
    out,err = run(c)
    print("\n### "+label)
    if out.strip(): print(out.strip())
    if err.strip(): print("[e]", err.strip()[:200])
ssh.close()
