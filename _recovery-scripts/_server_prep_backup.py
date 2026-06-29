import paramiko, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('45.119.83.233', username='root', password='Tailoc@2026', timeout=15)
def run(cmd, t=180):
    i,o,e = ssh.exec_command(cmd, timeout=t)
    return o.read().decode('utf-8','replace'), e.read().decode('utf-8','replace')

# 1) Tar ALL autoparts backups
out,err = run("cd /root && tar czf /root/_autoparts_recovery.tar.gz autoparts-backup-* 2>&1 && ls -la /root/_autoparts_recovery.tar.gz")
print("### TAR backups\n", out, err)

# 2) Try login as admin on localhost:3008 and capture response/cookies
out,err = run(r"""curl -s -i -m15 -c /tmp/ap_cookie.txt -X POST http://127.0.0.1:3008/api/auth/login -H 'Content-Type: application/json' -d '{"email":"admin@autopart.vn","password":"Admin@123"}' | head -40""")
print("### LOGIN admin\n", out, err)

# 3) Show cookies captured
out,err = run("cat /tmp/ap_cookie.txt 2>/dev/null")
print("### COOKIES\n", out, err)

# 4) Try data-export with cookie
out,err = run(r"""curl -s -m30 -b /tmp/ap_cookie.txt http://127.0.0.1:3008/api/admin/data-export -o /root/_autoparts_data_export.json -w 'HTTP=%{http_code} size=%{size_download}\n'; head -c 300 /root/_autoparts_data_export.json; echo""")
print("### DATA-EXPORT\n", out, err)

# 5) Dump public/key API endpoints as fallback snapshots
endpoints = ["products","categories","brands","suppliers","vouchers","banners","flash-sales","home-sections","origins","settings","vin-database","carriers","tax-rates","channels","attribute-sets","warehouses","affiliate-links","payouts"]
run("mkdir -p /root/_autoparts_api_snapshot")
res=[]
for ep in endpoints:
    o,e = run(f"curl -s -m20 -b /tmp/ap_cookie.txt 'http://127.0.0.1:3008/api/{ep}' -o /root/_autoparts_api_snapshot/{ep}.json -w '%{{http_code}}/%{{size_download}}'")
    res.append(f"{ep}={o.strip()}")
print("### API SNAPSHOTS\n", " ".join(res))

# 6) sizes
out,err = run("du -sh /root/_autoparts_api_snapshot /root/_autoparts_recovery.tar.gz /root/_autoparts_data_export.json 2>/dev/null")
print("### SIZES\n", out, err)
ssh.close()
