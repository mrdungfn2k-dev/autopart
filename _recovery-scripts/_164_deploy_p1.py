import paramiko, sys, io, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
ssh=paramiko.SSHClient(); ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('103.97.134.164', username='root', password='lcBFDjVF15', timeout=20)
def run(cmd,t=200):
    i,o,e=ssh.exec_command(cmd,timeout=t); return o.read().decode('utf-8','replace'),e.read().decode('utf-8','replace')
sftp=ssh.open_sftp()
LB=r"C:\xampp2\htdocs\autopart-backup\autoparts-source"
A="/var/www/autoparts"

# 1) overwrite the self-contained fix files
files=[
 "app/customer/page.tsx","app/customer/orders/page.tsx","app/customer/warranty/page.tsx",
 "app/customer/returns/page.tsx","app/customer/address/page.tsx",
 "components/AdminSidebar.tsx","components/CustomerSidebar.tsx","components/SupplierSidebar.tsx","components/AffiliateSidebar.tsx",
 "app/affiliate/team/page.tsx","app/supplier/page.tsx","app/supplier/finance/page.tsx",
 "app/api/orders/[id]/route.ts",
]
for f in files:
    lp=LB+"\\"+f.replace("/","\\"); rp=A+"/"+f
    sftp.put(lp, rp)
print("### uploaded", len(files), "files")

# 2) surgical: login redirect customer -> "/"
out,err=run("sed -i 's|customer: \"/customer\",|customer: \"/\",|' %s/app/api/auth/login/route.ts && grep -n 'customer:' %s/app/api/auth/login/route.ts" % (A,A))
print("### login redirect now:\n"+out.strip())

# 3) append lift effects to globals.css (preserve 164's existing globals)
EFFECTS = """

/* === Hiệu ứng nổi (deploy 2026-06-11) — append, không sửa rule cũ === */
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
    print("### globals.css: effects already present, skip")
sftp.close()

# 4) seed demo data for kh@autopart.vn (orders all guest -> safe). Create garage.json.
seed=r'''
import json
A="/var/www/autoparts/data"
users=json.load(open(A+"/users.json"))
kh=next((u for u in users if u.get("email")=="kh@autopart.vn"), None)
cid=kh["id"] if kh else "u004"
print("customer id =", cid)
# reassign first 4 orders to the demo customer (they are all 'guest')
orders=json.load(open(A+"/orders.json"))
n=0
for o in orders[:4]:
    if o.get("userId")=="guest":
        o["userId"]=cid; n+=1
json.dump(orders, open(A+"/orders.json","w"), ensure_ascii=False, indent=2)
print("reassigned", n, "orders to", cid)
# garage.json (new file)
import os
if not os.path.exists(A+"/garage.json"):
    garage=[
     {"id":"v001","userId":cid,"nickname":"Xe điện BYD","brand":"BYD","model":"Han EV","year":2023,"licensePlate":"51K-888.88","vin":"LGXC76C42N0000001","color":"#60A5FA","nextService":"2026-08-01","lastOilChange":"—","mileage":18500,"fuelType":"Electric 469HP","transmission":"Tự động","createdAt":"2025-01-10T00:00:00Z"},
     {"id":"v002","userId":cid,"nickname":"Camry gia đình","brand":"Toyota","model":"Camry","year":2021,"licensePlate":"30A-123.45","vin":"JTNB11HK0J3000002","color":"#34D399","nextService":"2026-07-15","lastOilChange":"2026-03-01","mileage":42000,"fuelType":"2.5L Hybrid","transmission":"Số tự động","createdAt":"2025-02-15T00:00:00Z"}
    ]
    json.dump(garage, open(A+"/garage.json","w"), ensure_ascii=False, indent=2)
    print("created garage.json")
else:
    print("garage.json exists, skip")
'''
out,err=run("cat > /tmp/_seed.py << 'PYEOF'\n"+seed+"\nPYEOF\npython3 /tmp/_seed.py 2>&1")
print("### seed:\n"+out.strip()+err.strip()[:300])

# 5) build (background + poll). DO NOT restart yet.
run("cd %s && rm -f /root/_164build.log && nohup bash -c 'npm run build && echo BUILD_DONE' > /root/_164build.log 2>&1 &" % A)
print("### build started on 164...")
done=False
for _ in range(20):
    o,_=run("grep -c BUILD_DONE /root/_164build.log 2>/dev/null || echo 0")
    if o.strip().endswith("1"): done=True; break
    e,_=run("grep -iE 'Failed to compile|Error:|ELIFECYCLE|Module not found' /root/_164build.log | head -3")
    if e.strip(): print("### BUILD ERROR:\n"+e.strip()); break
    time.sleep(15)
print("### BUILD DONE:", done)
if not done:
    o,_=run("tail -20 /root/_164build.log")
    print("### build log tail:\n"+o.strip())
ssh.close()
