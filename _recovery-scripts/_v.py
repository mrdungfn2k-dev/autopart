import paramiko, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
ssh=paramiko.SSHClient(); ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('103.97.134.164', username='root', password='lcBFDjVF15', timeout=20)
def run(cmd):
    i,o,e=ssh.exec_command(cmd,timeout=40); return o.read().decode('utf-8','replace')
cmds = [
  "curl -s -m12 https://autopartsvietnam.com.vn/ | grep -oc 'facebook.com'",
  "curl -s -m12 -o /dev/null -w 'home=%{http_code} admin=' https://autopartsvietnam.com.vn/",
  "curl -s -m12 -o /dev/null -w '%{http_code}\\n' https://autopartsvietnam.com.vn/admin",
  "grep -c 'không back' /var/www/autoparts/app/admin/orders/page.tsx",
  "pm2 describe autoparts 2>/dev/null | grep -E 'status' | head -1",
]
for c in cmds:
    print(run(c).strip())
ssh.close()
