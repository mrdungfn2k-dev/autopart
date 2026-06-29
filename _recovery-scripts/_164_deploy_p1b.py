import paramiko, sys, io, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
ssh=paramiko.SSHClient(); ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('103.97.134.164', username='root', password='lcBFDjVF15', timeout=20)
def run(cmd,t=200):
    i,o,e=ssh.exec_command(cmd,timeout=t); return o.read().decode('utf-8','replace'),e.read().decode('utf-8','replace')
sftp=ssh.open_sftp()
LB=r"C:\xampp2\htdocs\autopart-backup\autoparts-source"
A="/var/www/autoparts"

# 1) overwrite the self-contained CODE fix files (NO data files)
files=[
 "app/customer/page.tsx","app/customer/orders/page.tsx","app/customer/warranty/page.tsx",
 "app/customer/returns/page.tsx","app/customer/address/page.tsx",
 "components/AdminSidebar.tsx","components/CustomerSidebar.tsx","components/SupplierSidebar.tsx","components/AffiliateSidebar.tsx",
 "app/affiliate/team/page.tsx","app/supplier/page.tsx","app/supplier/finance/page.tsx",
 "app/api/orders/[id]/route.ts",
]
for f in files:
    sftp.put(LB+"\\"+f.replace("/","\\"), A+"/"+f)
print("### uploaded", len(files), "CODE files (no data touched)")

# 2) surgical: login redirect customer -> "/"  (preserve 164's rate-limit logic)
out,_=run("sed -i 's|customer: \"/customer\",|customer: \"/\",|' %s/app/api/auth/login/route.ts && grep -n 'customer:' %s/app/api/auth/login/route.ts" % (A,A))
print("### login redirect:\n"+out.strip())

# 3) append lift effects to globals.css (preserve existing rules)
EFFECTS = """

/* === Hiệu ứng nổi (deploy 2026-06-11) — append === */
.ap-card { transition: transform .22s cubic-bezier(.4,0,.2,1), box-shadow .25s cubic-bezier(.4,0,.2,1); will-change: transform; }
.ap-card:hover { transform: translateY(-4px); box-shadow: 0 14px 32px -10px rgba(26,75,151,.22); }
.ap-btn { transition: transform .15s cubic-bezier(.4,0,.2,1), box-shadow .2s ease, filter .2s ease; }
.ap-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 18px -6px rgba(26,75,151,.4); filter: brightness(1.03); }
.ap-btn:active { transform: translateY(0); box-shadow: none; }
@keyframes ap-rise { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: translateY(0); } }
.ap-rise { animation: ap-rise .35s cubic-bezier(.4,0,.2,1) both; }
"""
g=A+"/app/globals.css"
cur=sftp.open(g,"r").read().decode("utf-8")
if "Hiệu ứng nổi (deploy" not in cur:
    with sftp.open(g,"a") as fh: fh.write(EFFECTS)
    print("### globals.css: appended lift effects")
else:
    print("### globals.css: already present")
sftp.close()

# 4) build (background + poll). NO data mutation, NO restart yet.
run("cd %s && rm -f /root/_164build.log && nohup bash -c 'npm run build && echo BUILD_DONE' > /root/_164build.log 2>&1 &" % A)
print("### build started on 164...")
done=False
for _ in range(22):
    o,_=run("grep -c BUILD_DONE /root/_164build.log 2>/dev/null || echo 0")
    if o.strip().endswith("1"): done=True; break
    e,_=run("grep -iE 'Failed to compile|Error:|ELIFECYCLE|Module not found' /root/_164build.log | head -3")
    if e.strip(): print("### BUILD ERROR:\n"+e.strip()); break
    time.sleep(15)
print("### BUILD DONE:", done)
if not done:
    o,_=run("tail -25 /root/_164build.log"); print("### log tail:\n"+o.strip())
ssh.close()
