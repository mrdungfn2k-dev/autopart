import paramiko, sys, io, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
ssh=paramiko.SSHClient(); ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('103.97.134.164', username='root', password='lcBFDjVF15', timeout=20)
def run(cmd,t=200):
    i,o,e=ssh.exec_command(cmd,timeout=t); return o.read().decode('utf-8','replace'),e.read().decode('utf-8','replace')
A="/var/www/autoparts"
# extract JWT_SECRET from ecosystem.config.js and rebuild with it set
cmd=("cd %s && export JWT_SECRET=$(grep -oE '[a-f0-9]{40,}' ecosystem.config.js | head -1) && "
     "export NODE_ENV=production && echo \"secret_len=${#JWT_SECRET}\" && "
     "rm -f /root/_164build.log && nohup bash -c 'JWT_SECRET='\"$JWT_SECRET\"' NODE_ENV=production npm run build && echo BUILD_DONE' > /root/_164build.log 2>&1 &") % A
out,_=run(cmd)
print("###", out.strip())
done=False
for _ in range(22):
    o,_=run("grep -c BUILD_DONE /root/_164build.log 2>/dev/null || echo 0")
    if o.strip().endswith("1"): done=True; break
    e,_=run("grep -iE 'Failed to compile|Build error|ELIFECYCLE|Module not found|JWT_SECRET' /root/_164build.log | head -3")
    if e.strip(): print("### ERR:\n"+e.strip()); break
    time.sleep(15)
print("### BUILD DONE:", done)
o,_=run("tail -8 /root/_164build.log"); print("### tail:\n"+o.strip())
ssh.close()
