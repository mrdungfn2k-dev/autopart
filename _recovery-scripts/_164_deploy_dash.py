import paramiko, sys, io, time, json
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
ssh=paramiko.SSHClient(); ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('103.97.134.164', username='root', password='lcBFDjVF15', timeout=20)
def run(cmd,t=220):
    i,o,e=ssh.exec_command(cmd,timeout=t); return o.read().decode('utf-8','replace'),e.read().decode('utf-8','replace')
A="/var/www/autoparts"; LB=r"C:\xampp2\htdocs\autopart-backup\autoparts-source"
sftp=ssh.open_sftp()
for f in ["app/affiliate/page.tsx","app/admin/page.tsx","app/supplier/page.tsx"]:
    sftp.put(LB+"\\"+f.replace("/","\\"), A+"/"+f)
sftp.close()
print("### uploaded 3 dashboard files")

# rebuild with JWT_SECRET from ecosystem; restart only if build OK
run("cd %s && rm -f /root/_164build.log && SECRET=$(grep -oE '[a-f0-9]{40,}' ecosystem.config.js|head -1) && nohup bash -c \"JWT_SECRET=$SECRET NODE_ENV=production npm run build && echo BUILD_DONE\" > /root/_164build.log 2>&1 &" % A)
print("### rebuild started...")
done=False
for _ in range(22):
    o,_=run("grep -c BUILD_DONE /root/_164build.log 2>/dev/null || echo 0")
    if o.strip().endswith("1"): done=True; break
    e,_=run("grep -iE 'Failed to compile|Build error|Module not found' /root/_164build.log|head -2")
    if e.strip(): print("### BUILD ERR:\n"+e.strip()); break
    time.sleep(15)
print("### BUILD DONE:", done)
if done:
    run("cd %s && pm2 restart ecosystem.config.js >/dev/null 2>&1; echo ok" % A); time.sleep(6)
    out,_=run("for u in / /admin /supplier /affiliate; do echo \"$u $(curl -s -m12 -o /dev/null -w '%{http_code}' https://autopartsvietnam.com.vn$u)\"; done; pm2 describe autoparts 2>/dev/null|grep -E 'status|uptime'|head -2")
    print("### domain routes + status:\n"+out.strip())
else:
    o,_=run("tail -15 /root/_164build.log"); print(o.strip())
ssh.close()
