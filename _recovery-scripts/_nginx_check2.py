import paramiko, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('45.119.83.233', username='root', password='Tailoc@2026', timeout=20)
def run(cmd, t=40):
    i,o,e = ssh.exec_command(cmd, timeout=t)
    return o.read().decode('utf-8','replace'), e.read().decode('utf-8','replace')
for label,c in [
  ("cert SANs", "openssl x509 -in /etc/letsencrypt/live/autopartsvietnam.com.vn/fullchain.pem -noout -ext subjectAltName 2>&1"),
  ("ssl include files", "ls -la /etc/letsencrypt/options-ssl-nginx.conf /etc/letsencrypt/ssl-dhparams.pem 2>&1"),
  ("renewal conf", "cat /etc/letsencrypt/renewal/autopartsvietnam.com.vn.conf 2>/dev/null | grep -iE 'authenticator|webroot|nginx'"),
  ("certbot webroot dir", "ls -ld /var/www/certbot 2>/dev/null"),
  ("sites-enabled dir perms", "ls -ld /etc/nginx/sites-enabled"),
]:
    out,err = run(c)
    print("### "+label)
    if out.strip(): print(out.strip())
    if err.strip(): print("[e]", err.strip()[:200])
    print()
ssh.close()
