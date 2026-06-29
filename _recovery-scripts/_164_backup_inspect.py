import paramiko, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
ssh=paramiko.SSHClient(); ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('103.97.134.164', username='root', password='lcBFDjVF15', timeout=20)
def run(cmd,t=120):
    i,o,e=ssh.exec_command(cmd,timeout=t); return o.read().decode('utf-8','replace'),e.read().decode('utf-8','replace')
A="/var/www/autoparts"

# STEP 1: backup code+data (exclude node_modules/.next) on the server
out,err=run("cd /var/www && tar czf /root/autoparts-PREDEPLOY-$(date +%%Y%%m%%d-%%H%%M%%S).tar.gz --exclude=node_modules --exclude=.next autoparts 2>&1 && ls -la /root/autoparts-PREDEPLOY-*.tar.gz | tail -1")
print("### BACKUP\n", out.strip(), err.strip()[:200])

# STEP 2: inspect 'care' files
out,_=run("cat %s/app/api/auth/login/route.ts" % A)
print("\n### 164 login/route.ts\n"+out)
out,_=run("sed -n '1,40p' %s/app/api/orders/[id]/route.ts" % A)
print("\n### 164 orders/[id] route (head 40)\n"+out)
out,_=run("grep -n 'ap-card\\|ap-btn\\|@layer utilities' %s/app/globals.css | head; echo '--- tail of globals ---'; tail -5 %s/app/globals.css" % (A,A))
print("\n### 164 globals.css (has my utils?)\n"+out)
ssh.close()
