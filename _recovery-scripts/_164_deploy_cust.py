import paramiko, sys, io, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
ssh=paramiko.SSHClient(); ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('103.97.134.164', username='root', password='lcBFDjVF15', timeout=20)
def run(cmd,t=220):
    i,o,e=ssh.exec_command(cmd,timeout=t); return o.read().decode('utf-8','replace'),e.read().decode('utf-8','replace')
A="/var/www/autoparts"; LB=r"C:\xampp2\htdocs\autopart-backup\autoparts-source"

# Safety: confirm 164's customer sub-pages still = my BASE (markers I removed must still be present on 164)
out,_=run("echo reviews_maxw=$(grep -c 'max-w-3xl' %s/app/customer/reviews/page.tsx); "
          "echo reviews_star=$(grep -c '>⭐<' %s/app/customer/reviews/page.tsx); "
          "echo garage_warn=$(grep -c '⚠' %s/app/customer/garage/page.tsx); "
          "echo rewards_bug=$(grep -c 'length / 2' %s/app/customer/rewards/page.tsx)" % (A,A,A,A))
print("### base markers on 164 (should be >=1 each = still base):\n"+out.strip())
if not all(x in out for x in ["reviews_maxw=1","garage_warn=1","rewards_bug=1"]):
    print(">>> WARNING: 164 customer sub-pages may differ from base. Aborting overwrite for safety.")
    ssh.close(); sys.exit(0)

files=["app/customer/garage/page.tsx","app/customer/wishlist/page.tsx","app/customer/reviews/page.tsx",
       "app/customer/rewards/page.tsx","app/customer/profile/page.tsx","app/customer/settings/page.tsx"]
sftp=ssh.open_sftp()
for f in files: sftp.put(LB+"\\"+f.replace("/","\\"), A+"/"+f)
sftp.close()
print("### uploaded", len(files), "customer sub-pages")

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
    out,_=run("for u in /customer/garage /customer/wishlist /customer/reviews /customer/rewards /customer/profile /customer/settings; do echo \"$u $(curl -s -m12 -o /dev/null -w '%{http_code}' https://autopartsvietnam.com.vn$u)\"; done; pm2 describe autoparts 2>/dev/null|grep status|head -1")
    print("### domain routes:\n"+out.strip())
else:
    o,_=run("tail -12 /root/_164build.log"); print(o.strip())
ssh.close()
