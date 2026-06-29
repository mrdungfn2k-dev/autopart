import paramiko, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('45.119.83.233', username='root', password='Tailoc@2026', timeout=20)
def run(cmd, t=60):
    i,o,e = ssh.exec_command(cmd, timeout=t)
    return o.read().decode('utf-8','replace'), e.read().decode('utf-8','replace')
APP="/var/www/autoparts"
for label,c in [
  ("FULL LS", "ls -la %s" % APP),
  ("node_modules?", "ls -d %s/node_modules 2>/dev/null && du -sh %s/node_modules 2>/dev/null || echo NO_NODE_MODULES" % (APP,APP)),
  (".next?", "ls -d %s/.next 2>/dev/null && echo HAS_NEXT || echo NO_NEXT" % APP),
  (".git?", "ls -d %s/.git 2>/dev/null && echo HAS_GIT || echo NO_GIT" % APP),
  ("file count", "find %s -type f -not -path '*/node_modules/*' -not -path '*/.next/*' | wc -l" % APP),
  ("newest 15 files (mtime)", "find %s -type f -not -path '*/node_modules/*' -not -path '*/.next/*' -printf '%%TY-%%Tm-%%Td %%TH:%%TM  %%p\\n' 2>/dev/null | sort -r | head -15" % APP),
  ("proc cwd of running app", "PID=$(pm2 pid autoparts 2>/dev/null|head -1); readlink /proc/$PID/cwd; for c in $(pgrep -P $PID); do echo child $c: $(readlink /proc/$c/cwd); done"),
]:
    out,err = run(c)
    print("\n### "+label)
    if out.strip(): print(out.strip())
    if err.strip(): print("[e]", err.strip()[:300])
ssh.close()
