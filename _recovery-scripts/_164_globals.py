import paramiko, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
ssh=paramiko.SSHClient(); ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('103.97.134.164', username='root', password='lcBFDjVF15', timeout=20)
def run(cmd,t=40):
    i,o,e=ssh.exec_command(cmd,timeout=t); return o.read().decode('utf-8','replace'),e.read().decode('utf-8','replace')
A="/var/www/autoparts"
out,_=run("sed -n '170,210p' %s/app/globals.css" % A)
print("### 164 globals.css lines 170-210:\n"+out)
out,_=run("grep -n 'ap-btn\\|ap-rise\\|ap-card' %s/app/globals.css" % A)
print("### grep ap-* in 164 globals:\n"+out)
# rename the ugly backup file
out,_=run("cd /root && mv 'autoparts-PREDEPLOY-%Y%m%d-%H%M%S.tar.gz' autoparts-PREDEPLOY-backup.tar.gz 2>/dev/null; ls -la /root/autoparts-PREDEPLOY-backup.tar.gz")
print("### backup renamed:\n"+out)
ssh.close()
