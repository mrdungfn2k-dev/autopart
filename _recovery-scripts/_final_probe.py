import paramiko, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('45.119.83.233', username='root', password='Tailoc@2026', timeout=15)
def run(cmd):
    i,o,e = ssh.exec_command(cmd, timeout=120)
    return o.read().decode('utf-8','replace'), e.read().decode('utf-8','replace')

cmds = [
    ("STATIC CHUNK status", "curl -s -m8 -o /dev/null -w 'css=%{http_code}\\n' http://127.0.0.1:3008/_next/static/chunks/a6d552187bae1e58.css"),
    ("KEY ROUTES", "for u in / /products /admin /login /api/products /api/categories /gio-hang /tai-khoan; do code=$(curl -s -m8 -o /dev/null -w '%{http_code}/%{size_download}' http://127.0.0.1:3008$u); echo \"$u -> $code\"; done"),
    ("MAPS autoparts mmap", "cat /proc/4132406/maps 2>/dev/null | grep -i autopart | head; echo '---count---'; cat /proc/4132406/maps 2>/dev/null | grep -i 'autopart\\|\\.next\\|\\.js' | wc -l"),
    ("PHASE5 app routes", "find /root/autoparts-backup-phase5-20260505_000056/app -type d 2>/dev/null | sed 's#.*/app#app#' | sort"),
    ("PHASE5 app page files", "find /root/autoparts-backup-phase5-20260505_000056/app -name '*.tsx' -o -name '*.ts' 2>/dev/null | sed 's#.*/app#app#' | sort | head -120"),
    ("BASE backup api routes", "find /root/autoparts-backup-20260503_085536/api -type f 2>/dev/null | sed 's#.*/api#api#' | sort | head -120"),
    ("FILE COUNTS per backup", "for d in /root/autoparts-backup-*; do n=$(find $d -type f | wc -l); echo \"$n  $d\"; done"),
    ("PHASE5 package.json", "cat /root/autoparts-backup-phase5-20260505_000056/package.json"),
]
for label, c in cmds:
    out, err = run(c)
    print("\n"+"="*70+"\n### "+label+"\n"+"="*70)
    if out.strip(): print(out.strip())
    if err.strip(): print("[stderr]", err.strip()[:300])
ssh.close()
