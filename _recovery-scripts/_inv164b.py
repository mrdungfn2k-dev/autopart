import paramiko, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
host='103.97.134.164'
ssh=paramiko.SSHClient(); ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ok=False
for user in ('root',):
    try:
        ssh.connect(host, username=user, password='lcBFDjVF15', timeout=20)
        print(f"CONNECTED 164 as {user} OK"); ok=True; break
    except Exception as e:
        print(f"auth fail as {user}: {type(e).__name__}")
if not ok:
    print(">>> Could not auth to 164 as root. Need correct username."); sys.exit(1)
def run(cmd,t=50):
    i,o,e=ssh.exec_command(cmd,timeout=t); return o.read().decode('utf-8','replace'),e.read().decode('utf-8','replace')
for label,c in [
  ("HOST", "hostname; cat /etc/os-release|grep PRETTY_NAME; node -v 2>/dev/null; nginx -v 2>&1; echo IP:; curl -s -m8 ifconfig.me; echo"),
  ("PM2 autoparts", "pm2 jlist 2>/dev/null | python3 -c \"import sys,json;d=json.load(sys.stdin);[print(x['name'],'|cwd=',x['pm2_env'].get('pm_cwd'),'|port=',x['pm2_env'].get('PORT'),'|status=',x['pm2_env'].get('status'),'|restarts=',x['pm2_env'].get('restart_time')) for x in d if 'auto' in x['name'].lower()]\" 2>/dev/null || pm2 list 2>/dev/null"),
  ("NGINX domain block", "F=$(grep -rl 'autopartsvietnam' /etc/nginx/sites-enabled/ /etc/nginx/sites-available/ 2>/dev/null | head -1); echo FILE=$F; grep -E 'server_name|proxy_pass|root |listen' $F 2>/dev/null | head -20"),
  ("FIND app dir", "find /var/www /home /opt /root -maxdepth 3 -iname '*autopart*' -type d 2>/dev/null | head"),
  ("APP cwd contents", "D=$(pm2 jlist 2>/dev/null | python3 -c \"import sys,json;d=json.load(sys.stdin);[print(x['pm2_env'].get('pm_cwd')) for x in d if 'auto' in x['name'].lower()]\" 2>/dev/null | head -1); echo DIR=$D; ls -la $D 2>/dev/null | head -30"),
]:
    out,err=run(c); print("\n### "+label)
    if out.strip(): print(out.strip())
    if err.strip(): print("[e]",err.strip()[:200])
ssh.close()
