import paramiko, sys, io, socket
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

host = '45.119.83.233'
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(host, username='root', password='Tailoc@2026', timeout=15)

def run(cmd):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=40)
    return stdout.read().decode('utf-8','replace'), stderr.read().decode('utf-8','replace')

# DNS resolution of the public domain
try:
    print("DNS autopartsvietnam.com.vn ->", socket.gethostbyname('autopartsvietnam.com.vn'))
except Exception as e:
    print("DNS err:", e)

cmds = [
    ("GREP autopart in nginx", "grep -rIl -i 'autopart' /etc/nginx/ 2>/dev/null"),
    ("GREP autopart content", "grep -rI -i 'autopart' /etc/nginx/ 2>/dev/null | head -40"),
    ("server_name autopart", "grep -rI -i 'server_name' /etc/nginx/sites-available/ /etc/nginx/sites-enabled/ 2>/dev/null | grep -i autopart"),
    ("find autopart dirs", "find /var/www /home /opt /srv -maxdepth 3 -iname '*autopart*' 2>/dev/null"),
    ("find autopart any", "find / -maxdepth 4 -iname '*autopart*' 2>/dev/null | head -30"),
    ("astrodev ls", "ls -la /var/www/astrodev/ 2>/dev/null | head -40"),
]
for label, c in cmds:
    out, err = run(c)
    print("\n" + "="*70)
    print("### " + label)
    print("="*70)
    if out.strip(): print(out.strip())
    if err.strip(): print("[stderr]", err.strip()[:300])

ssh.close()
