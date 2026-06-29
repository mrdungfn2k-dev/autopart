import paramiko, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('45.119.83.233', username='root', password='Tailoc@2026', timeout=15)
def run(cmd):
    i,o,e = ssh.exec_command(cmd, timeout=120)
    return o.read().decode('utf-8','replace'), e.read().decode('utf-8','replace')

cmds = [
    ("BACKUP phase5 full tree", "find /root/autoparts-backup-phase5-20260505_000056/ 2>/dev/null | head -80"),
    ("BACKUP all folders depth1", "for d in /root/autoparts-backup-*; do echo \"== $d ==\"; ls $d 2>/dev/null | head -40; done"),
    ("ANY autoparts tarball", "find / -name '*.tar.gz' -o -name '*.zip' 2>/dev/null | xargs -I{} sh -c 'echo {}' 2>/dev/null | grep -iE 'auto|next' | head"),
    ("TARBALLS in /var/www and /root", "ls -la /var/www/*.tar.gz /var/www/*.zip /root/*.tar.gz /root/*.zip 2>/dev/null"),
    ("ROOT BASH HISTORY autoparts", "grep -iE 'autopart' /root/.bash_history 2>/dev/null | tail -60"),
    ("HISTORY rm/mv/deploy auto", "grep -iE 'rm .*auto|mv .*auto|deploy.*auto|/var/www/autoparts' /root/.bash_history 2>/dev/null | tail -40"),
    ("GIT configs", "cat /root/.gitconfig 2>/dev/null; find /root /var/www -maxdepth 3 -name '.git' -type d 2>/dev/null | grep -i auto"),
    ("SITE local 3008", "curl -s -m 10 -o /dev/null -w 'HTTP=%{http_code} size=%{size_download}\\n' http://127.0.0.1:3008/ 2>&1; curl -s -m 10 http://127.0.0.1:3008/ 2>&1 | head -c 600"),
]
for label, c in cmds:
    out, err = run(c)
    print("\n"+"="*70+"\n### "+label+"\n"+"="*70)
    if out.strip(): print(out.strip())
    if err.strip(): print("[stderr]", err.strip()[:400])
ssh.close()
