import paramiko, sys, io, socket
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

host = '103.97.134.164'
# Check port 22 reachability first
for port in (22,):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM); s.settimeout(8)
    try:
        s.connect((host, port)); print(f"port {port}: OPEN"); s.close()
    except Exception as e:
        print(f"port {port}: {e}")

creds = [('root','Tailoc@2026'), ('root','nSmaPGEY39')]
ok=False
for user,pw in creds:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        ssh.connect(host, username=user, password=pw, timeout=15)
        print(f"CONNECTED as {user} (pw ...{pw[-3:]})")
        ok=True
        def run(cmd):
            i,o,e = ssh.exec_command(cmd, timeout=40)
            return o.read().decode('utf-8','replace'), e.read().decode('utf-8','replace')
        for label,c in [
            ("HOST", "hostname; cat /etc/os-release | head -1"),
            ("FIND autoparts", "find /var/www /home /opt /srv -maxdepth 3 -iname '*autopart*' 2>/dev/null | head"),
            ("PM2", "pm2 list 2>/dev/null | grep -i auto; pm2 jlist 2>/dev/null | python3 -c \"import sys,json; d=json.load(sys.stdin); [print(x['name'],'|',x['pm2_env'].get('pm_cwd'),'|',x['pm2_env'].get('status')) for x in d if 'auto' in x['name'].lower()]\" 2>/dev/null"),
            ("NGINX autopart", "grep -rIl -i autopart /etc/nginx/ 2>/dev/null; grep -rI -i 'root ' /etc/nginx/sites-enabled/ 2>/dev/null | grep -i auto"),
            ("WWW", "ls /var/www/ 2>/dev/null | head -40"),
        ]:
            out,err = run(c)
            print("\n### "+label);
            if out.strip(): print(out.strip())
            if err.strip(): print("[e]",err.strip()[:200])
        ssh.close()
        break
    except Exception as e:
        print(f"AUTH FAIL as {user} (pw ...{pw[-3:]}): {type(e).__name__}: {e}")
if not ok:
    print("\n>>> Could not authenticate to 103.97.134.164 with known credentials.")
