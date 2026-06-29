import paramiko, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('45.119.83.233', username='root', password='Tailoc@2026', timeout=15)
def run(cmd):
    i,o,e = ssh.exec_command(cmd, timeout=90)
    return o.read().decode('utf-8','replace'), e.read().decode('utf-8','replace')

# pids: 4132356 = npm parent, 4132406 = next-server child
cmds = [
    ("LIST cwd via next-server 4132406", "ls -la /proc/4132406/cwd/ 2>&1 | head -60"),
    ("LIST cwd via npm 4132356", "ls -la /proc/4132356/cwd/ 2>&1 | head -60"),
    ("COUNT files under cwd", "find /proc/4132406/cwd/ -maxdepth 3 2>/dev/null | wc -l"),
    ("TREE depth1 of cwd", "ls -la /proc/4132406/cwd/ 2>/dev/null"),
    ("CHECK .next exists", "ls -la /proc/4132406/cwd/.next/ 2>&1 | head -20"),
    ("CHECK app/src dirs", "ls -la /proc/4132406/cwd/app /proc/4132406/cwd/src /proc/4132406/cwd/components /proc/4132406/cwd/pages 2>&1 | head -40"),
    ("PACKAGE.JSON recover", "cat /proc/4132406/cwd/package.json 2>&1 | head -60"),
    ("OPEN FDs sample", "ls -la /proc/4132406/fd/ 2>/dev/null | grep -v 'pipe:\\|socket:\\|anon_inode\\|/dev/' | head -40"),
]
for label, c in cmds:
    out, err = run(c)
    print("\n"+"="*70+"\n### "+label+"\n"+"="*70)
    if out.strip(): print(out.strip())
    if err.strip(): print("[stderr]", err.strip()[:400])
ssh.close()
