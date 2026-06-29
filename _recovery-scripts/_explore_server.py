import paramiko, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

host = '45.119.83.233'
user = 'root'
password = 'Tailoc@2026'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    ssh.connect(host, username=user, password=password, timeout=15)
    print("CONNECTED OK")
except Exception as e:
    print("CONNECT FAILED:", repr(e))
    sys.exit(1)

def run(cmd):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=30)
    out = stdout.read().decode('utf-8', 'replace')
    err = stderr.read().decode('utf-8', 'replace')
    return out, err

cmds = [
    ("OS", "cat /etc/os-release | head -3; uname -a"),
    ("WEBSERVER", "which nginx apache2 httpd php 2>/dev/null; nginx -v 2>&1; php -v 2>&1 | head -1"),
    ("WWW_DIRS", "ls -la /var/www/ 2>/dev/null"),
    ("HOME_DIRS", "ls -la /home/ 2>/dev/null"),
    ("NGINX_SITES", "ls -la /etc/nginx/sites-enabled/ /etc/nginx/conf.d/ 2>/dev/null"),
    ("NGINX_GREP", "grep -rEi 'root|server_name' /etc/nginx/sites-enabled/ /etc/nginx/conf.d/ 2>/dev/null | grep -iE 'autopart|root ' | head -40"),
    ("APACHE_SITES", "ls -la /etc/apache2/sites-enabled/ 2>/dev/null; grep -rEi 'DocumentRoot|ServerName' /etc/apache2/sites-enabled/ 2>/dev/null | head -40"),
]
for label, c in cmds:
    out, err = run(c)
    print("\n" + "="*70)
    print("### " + label)
    print("="*70)
    if out.strip(): print(out.strip())
    if err.strip(): print("[stderr]", err.strip()[:500])

ssh.close()
