import paramiko, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('45.119.83.233', username='root', password='Tailoc@2026', timeout=15)
def run(cmd):
    i,o,e = ssh.exec_command(cmd, timeout=60)
    return o.read().decode('utf-8','replace'), e.read().decode('utf-8','replace')

cmds = [
    ("PM2 DESCRIBE autoparts", "pm2 describe autoparts 2>/dev/null | head -40"),
    ("PROC CWD of pid 4132356", "ls -la /proc/4132356/cwd 2>/dev/null; readlink /proc/4132356/cwd 2>/dev/null"),
    ("REAL PID listening 3008", "ss -tlnp 2>/dev/null | grep ':3008'"),
    ("ALL node cwd containing auto/3008", "for p in $(pgrep node); do c=$(readlink /proc/$p/cwd 2>/dev/null); echo \"$p -> $c\"; done | grep -iE 'auto|3008' "),
    ("WHO LISTENS 3008 cwd", "pid=$(ss -tlnp 2>/dev/null | grep ':3008' | grep -oE 'pid=[0-9]+' | head -1 | cut -d= -f2); echo PID=$pid; readlink /proc/$pid/cwd 2>/dev/null; cat /proc/$pid/cmdline 2>/dev/null | tr '\\0' ' '; echo"),
    ("var/www grep auto", "ls /var/www/ | grep -i auto"),
    ("PM2 dump file", "grep -iE 'autoparts|3008' /root/.pm2/dump.pm2 2>/dev/null | head -20"),
]
for label, c in cmds:
    out, err = run(c)
    print("\n"+"="*70+"\n### "+label+"\n"+"="*70)
    if out.strip(): print(out.strip())
    if err.strip(): print("[stderr]", err.strip()[:300])
ssh.close()
