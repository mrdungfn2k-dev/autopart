import paramiko, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('45.119.83.233', username='root', password='Tailoc@2026', timeout=20)
def run(cmd, t=40):
    i,o,e = ssh.exec_command(cmd, timeout=t)
    return o.read().decode('utf-8','replace'), e.read().decode('utf-8','replace')

for label,c in [
  ("CERT for domain", "ls -la /etc/letsencrypt/live/autopartsvietnam.com.vn/ 2>/dev/null; echo '--validity--'; openssl x509 -in /etc/letsencrypt/live/autopartsvietnam.com.vn/fullchain.pem -noout -subject -dates 2>&1"),
  ("ANY existing autopart nginx block", "grep -rl 'autopartsvietnam' /etc/nginx/sites-enabled/ /etc/nginx/sites-available/ 2>/dev/null || echo NONE"),
  ("default_server on 443?", "grep -rn 'default_server' /etc/nginx/sites-enabled/ 2>/dev/null | head"),
  ("nginx -t now (baseline)", "nginx -t 2>&1"),
  ("REFERENCE: a Next.js SSL+proxy config (chioi.vn)", "cat /etc/nginx/sites-enabled/chioi.vn 2>/dev/null | head -60"),
]:
    out,err = run(c)
    print("\n### "+label)
    if out.strip(): print(out.strip())
    if err.strip(): print("[e]", err.strip()[:300])
ssh.close()
