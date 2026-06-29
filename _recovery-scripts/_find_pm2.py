import paramiko, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('45.119.83.233', username='root', password='Tailoc@2026', timeout=15)
def run(cmd):
    i,o,e = ssh.exec_command(cmd, timeout=60)
    return o.read().decode('utf-8','replace'), e.read().decode('utf-8','replace')

cmds = [
    ("PM2 LIST", "pm2 list 2>/dev/null; echo '---'; pm2 jlist 2>/dev/null | python3 -c \"import sys,json; d=json.load(sys.stdin); [print(x['name'],'|cwd=',x['pm2_env'].get('pm_cwd'),'|script=',x['pm2_env'].get('pm_exec_path'),'|status=',x['pm2_env'].get('status'),'|port=',x['pm2_env'].get('PORT')) for x in d]\" 2>/dev/null"),
    ("AUTOPARTS BACKUP SIZES", "du -sh /root/autoparts-backup-* 2>/dev/null"),
    ("LATEST BACKUP LS", "ls -la /root/autoparts-backup-responsive-20260505_120912/ 2>/dev/null | head -50"),
    ("PM2 LOG TAIL", "tail -5 /root/.pm2/logs/autoparts-out.log 2>/dev/null"),
    ("NETSTAT", "ss -tlnp 2>/dev/null | grep -E 'node|:3000|:3001|:8080|:5000' | head -20"),
]
for label, c in cmds:
    out, err = run(c)
    print("\n"+"="*70+"\n### "+label+"\n"+"="*70)
    if out.strip(): print(out.strip())
    if err.strip(): print("[stderr]", err.strip()[:300])
ssh.close()
