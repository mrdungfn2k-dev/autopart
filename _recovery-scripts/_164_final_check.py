import paramiko, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
ssh=paramiko.SSHClient(); ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('103.97.134.164', username='root', password='lcBFDjVF15', timeout=20)
def run(cmd,t=60):
    i,o,e=ssh.exec_command(cmd,timeout=t); return o.read().decode('utf-8','replace'),e.read().decode('utf-8','replace')
# routes on the public domain (no auth: storefront=200, portals=307 to login). 500 = bad.
out,_=run("for u in / /products /login /customer /customer/warranty /customer/returns /customer/address /supplier /admin /affiliate /search /flash-sale; do c=$(curl -s -m12 -o /dev/null -w '%{http_code}' https://autopartsvietnam.com.vn$u); echo \"$u -> $c\"; done")
print("### DOMAIN routes (expect 200 or 307, NOT 500):\n"+out.strip())
# error log of autoparts
out,_=run("pm2 logs autoparts --lines 6 --nostream 2>/dev/null | tail -12")
print("### pm2 logs tail:\n"+out.strip())
ssh.close()
