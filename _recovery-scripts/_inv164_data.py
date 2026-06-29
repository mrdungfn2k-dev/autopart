import paramiko, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
ssh=paramiko.SSHClient(); ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('103.97.134.164', username='root', password='lcBFDjVF15', timeout=20)
def run(cmd,t=50):
    i,o,e=ssh.exec_command(cmd,timeout=t); return o.read().decode('utf-8','replace'),e.read().decode('utf-8','replace')
A="/var/www/autoparts"
for label,c in [
  ("data files", "ls -la %s/data/*.json 2>/dev/null | awk '{print $5, $9}'" % A),
  ("users count+emails", "python3 -c \"import json;d=json.load(open('%s/data/users.json'));print('count=',len(d));[print(' ',u.get('email'),u.get('role')) for u in d[:8]]\" 2>&1" % A),
  ("orders count", "python3 -c \"import json;d=json.load(open('%s/data/orders.json'));print('orders=',len(d),'| userIds=',sorted(set(o.get('userId') for o in d)))\" 2>&1" % A),
  ("garage exists", "ls -la %s/data/garage.json 2>&1 | head -1; python3 -c \"import json;d=json.load(open('%s/data/garage.json'));print('garage=',len(d))\" 2>&1" % (A,A)),
  ("package.json deps", "cat %s/package.json 2>/dev/null | python3 -c \"import sys,json;d=json.load(sys.stdin);print('deps:',list(d.get('dependencies',{}).keys()));print('scripts:',d.get('scripts'))\" 2>&1" % A),
  (".env present", "ls -la %s/.env* 2>/dev/null; grep -c JWT_SECRET %s/.env 2>/dev/null && echo 'has JWT_SECRET'" % (A,A)),
  ("next.config", "ls %s/next.config* 2>/dev/null; head -20 %s/next.config.* 2>/dev/null" % (A,A)),
  ("data-backups", "ls -la %s/data-backups/ 2>/dev/null | head"),
  ("customer page old?", "grep -l 'Alex Johnson' %s/app/customer/page.tsx 2>/dev/null && echo 'OLD (Alex Johnson hardcoded)' || echo 'not found'" % A),
  ("how built/run", "cat %s/ecosystem.config.js 2>/dev/null; echo '--.next?--'; ls -d %s/.next 2>/dev/null && echo HAS_NEXT || echo NO_NEXT; ls -d %s/node_modules >/dev/null 2>&1 && echo HAS_NODE_MODULES" % (A,A,A)),
]:
    out,err=run(c); print("\n### "+label)
    if out.strip(): print(out.strip())
    if err.strip(): print("[e]",err.strip()[:200])
ssh.close()
