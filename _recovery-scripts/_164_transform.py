import paramiko, sys, io, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
ssh=paramiko.SSHClient(); ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('103.97.134.164', username='root', password='lcBFDjVF15', timeout=20)
def run(cmd,t=220):
    i,o,e=ssh.exec_command(cmd,timeout=t); return o.read().decode('utf-8','replace'),e.read().decode('utf-8','replace')
A="/var/www/autoparts"

# transform applied IN-PLACE on 164's own files (preserves any 164-newer content; purely additive ap-card + remove decorative emoji)
TRANSFORM = r'''# -*- coding: utf-8 -*-
import os
BASE="/var/www/autoparts/app"
roots=["admin","supplier","affiliate"]
pats=["bg-white rounded-xl border border-[#f0f0f0]","bg-white rounded-2xl border border-[#f0f0f0]"]
DECOR="\U0001F4E5\U0001F4E4\U0001F4C2\U0001F525⭐\U0001F30D\U0001F527\U0001F310\U0001F4E6\U0001F4CC⬇⬆⚠\U0001F381\U0001F3C6\U0001F48E\U0001F947✨\U0001F514\U0001F4CA\U0001F4C8\U0001F4C9\U0001F4B0\U0001F680\U0001F6D2\U0001F3E0\U0001F697\U0001F511\U0001F4DD\U0001F3AF⚡\U0001F4A1\U0001F3A8\U0001F517\U0001F4DE✉\U0001F4E7\U0001F5D1\U0001F3F7\U0001F9FE\U0001F6E0\U0001F4B5\U0001F4B3"
ch=0
for r in roots:
  for dp,_,fs in os.walk(os.path.join(BASE,r)):
    for fn in fs:
      if not fn.endswith(".tsx"): continue
      p=os.path.join(dp,fn); s=open(p,encoding="utf-8").read(); o=s
      for pat in pats: s=s.replace(pat,"ap-card "+pat)
      s=s.replace("ap-card ap-card ","ap-card ")
      for c in DECOR: s=s.replace(c+" ","").replace(" "+c,"").replace(c,"")
      if s!=o: open(p,"w",encoding="utf-8").write(s); ch+=1
print("transformed",ch,"files")
'''
sftp=ssh.open_sftp()
with sftp.open("/tmp/_tf.py","w") as f: f.write(TRANSFORM)
sftp.close()
out,err=run("cd %s && python3 /tmp/_tf.py 2>&1" % A)
print("### transform:", out.strip(), err.strip()[:200])

# rebuild + restart if OK
run("cd %s && rm -f /root/_164build.log && SECRET=$(grep -oE '[a-f0-9]{40,}' ecosystem.config.js|head -1) && nohup bash -c \"JWT_SECRET=$SECRET NODE_ENV=production npm run build && echo BUILD_DONE\" > /root/_164build.log 2>&1 &" % A)
print("### rebuild started...")
done=False
for _ in range(24):
    o,_=run("grep -c BUILD_DONE /root/_164build.log 2>/dev/null || echo 0")
    if o.strip().endswith("1"): done=True; break
    e,_=run("grep -iE 'Failed to compile|Build error|Module not found' /root/_164build.log|head -2")
    if e.strip(): print("### BUILD ERR:\n"+e.strip()); break
    time.sleep(15)
print("### BUILD DONE:", done)
if done:
    run("cd %s && pm2 restart ecosystem.config.js >/dev/null 2>&1; echo ok" % A); time.sleep(6)
    out,_=run("for u in / /admin /supplier /affiliate; do echo \"$u $(curl -s -m12 -o /dev/null -w '%{http_code}' https://autopartsvietnam.com.vn$u)\"; done; pm2 describe autoparts 2>/dev/null|grep status|head -1")
    print("### routes:\n"+out.strip())
else:
    o,_=run("tail -15 /root/_164build.log"); print(o.strip())
ssh.close()
