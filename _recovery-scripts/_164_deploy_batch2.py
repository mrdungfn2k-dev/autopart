import paramiko, sys, io, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
ssh=paramiko.SSHClient(); ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('103.97.134.164', username='root', password='lcBFDjVF15', timeout=20)
def run(cmd,t=220):
    i,o,e=ssh.exec_command(cmd,timeout=t); return o.read().decode('utf-8','replace'),e.read().decode('utf-8','replace')
A="/var/www/autoparts"; LB=r"C:\xampp2\htdocs\autopart-backup\autoparts-source"
# safety: confirm 164 layout is base (has ScrollToTopButton, no SocialBar yet)
out,_=run("echo layout_scrolltop=$(grep -c ScrollToTopButton %s/app/layout.tsx); echo layout_has_social=$(grep -c SocialBar %s/app/layout.tsx)" % (A,A))
print("### 164 layout check:", out.strip())
sftp=ssh.open_sftp()
for f in ["components/SocialBar.tsx","app/layout.tsx","app/admin/orders/page.tsx","app/admin/page.tsx"]:
    sftp.put(LB+"\\"+f.replace("/","\\"), A+"/"+f)
sftp.close(); print("### uploaded 4 files (SocialBar new + layout + admin orders/page)")
run("cd %s && rm -f /root/_164build.log && SECRET=$(grep -oE '[a-f0-9]{40,}' ecosystem.config.js|head -1) && nohup bash -c \"JWT_SECRET=$SECRET NODE_ENV=production npm run build && echo BUILD_DONE\" > /root/_164build.log 2>&1 &" % A)
done=False
for _ in range(22):
    o,_=run("grep -c BUILD_DONE /root/_164build.log 2>/dev/null||echo 0")
    if o.strip().endswith("1"): done=True; break
    e,_=run("grep -iE 'Failed to compile|Build error|Module not found' /root/_164build.log|head -2")
    if e.strip(): print("### ERR:\n"+e.strip()); break
    time.sleep(15)
print("### BUILD DONE:", done)
if done:
    run("cd %s && pm2 restart ecosystem.config.js >/dev/null 2>&1; echo ok" % A); time.sleep(6)
    out,_=run("echo home_has_socialbar=$(curl -s -m12 https://autopartsvietnam.com.vn/ | grep -c 'facebook.com'); echo home=$(curl -s -m12 -o /dev/null -w '%%{http_code}' https://autopartsvietnam.com.vn/); pm2 describe autoparts 2>/dev/null|grep status|head -1" % A)
    print("### verify:\n"+out.strip())
else:
    o,_=run("tail -12 /root/_164build.log"); print(o.strip())
ssh.close()
