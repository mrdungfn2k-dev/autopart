import paramiko, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
host = '103.97.134.164'
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    ssh.connect(host, username='root', password='Tailoc@2026', timeout=20)
    print("CONNECTED to 164 OK")
except Exception as e:
    print("CONNECT FAILED:", repr(e)); sys.exit(1)
def run(cmd, t=50):
    i,o,e = ssh.exec_command(cmd, timeout=t)
    return o.read().decode('utf-8','replace'), e.read().decode('utf-8','replace')

for label,c in [
  ("HOST", "hostname; cat /etc/os-release|grep PRETTY; node -v 2>/dev/null; nginx -v 2>&1"),
  ("PM2 autoparts", "pm2 jlist 2>/dev/null | python3 -c \"import sys,json;d=json.load(sys.stdin);[print(x['name'],'|cwd=',x['pm2_env'].get('pm_cwd'),'|port=',x['pm2_env'].get('PORT'),'|status=',x['pm2_env'].get('status')) for x in d]\" 2>/dev/null | grep -i auto || pm2 list 2>/dev/null | head -20"),
  ("NGINX domain->port", "grep -rA3 'server_name .*autopartsvietnam' /etc/nginx/ 2>/dev/null | grep -iE 'proxy_pass|root|server_name' | head"),
  ("FIND app dir", "find /var/www /home /opt /root -maxdepth 3 -iname '*autopart*' -type d 2>/dev/null | head"),
  ("APP LS (guess /var/www/autoparts)", "ls -la /var/www/autoparts 2>/dev/null | head -30 || echo 'not at /var/www/autoparts'"),
]:
    out,err = run(c)
    print("\n### "+label)
    if out.strip(): print(out.strip())
    if err.strip(): print("[e]", err.strip()[:200])
ssh.close()
