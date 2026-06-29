import paramiko, sys, io, time, json
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
ssh=paramiko.SSHClient(); ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('103.97.134.164', username='root', password='lcBFDjVF15', timeout=20)
def run(cmd,t=90):
    i,o,e=ssh.exec_command(cmd,timeout=t); return o.read().decode('utf-8','replace'),e.read().decode('utf-8','replace')
A="/var/www/autoparts"

# 1) restart ONLY autoparts via its ecosystem (guarantees JWT_SECRET + PORT=3008); other apps untouched
out,err=run("cd %s && pm2 restart ecosystem.config.js 2>&1 | tail -4" % A)
print("### restart:\n"+out.strip())
time.sleep(7)
out,_=run("pm2 describe autoparts 2>/dev/null | grep -E 'status|restarts|uptime|exec cwd' | head -4")
print("### pm2 status:\n"+out.strip())

# 2) localhost checks
out,_=run("curl -s -m10 -o /dev/null -w 'home=%{http_code}\\n' http://127.0.0.1:3008/")
print("### local home:", out.strip())
out,_=run("curl -s -m12 -X POST http://127.0.0.1:3008/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"kh@autopart.vn\",\"password\":\"Customer@123\"}'")
try: print("### LOCAL customer login redirect =", json.loads(out).get("redirect"))
except: print("### login raw:", out[:150])

# 3) PUBLIC DOMAIN checks (DNS -> 164, so this is the real domain)
out,_=run("curl -s -m15 -o /dev/null -w 'domain_home=%{http_code}\\n' https://autopartsvietnam.com.vn/")
print("### domain home:", out.strip())
out,_=run("curl -s -m15 -X POST https://autopartsvietnam.com.vn/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"kh@autopart.vn\",\"password\":\"Customer@123\"}'")
try: print("### DOMAIN customer login redirect =", json.loads(out).get("redirect"), "(fix = '/')")
except: print("### domain login raw:", out[:150])

# 4) confirm effects + de-icon are in the served build (grep built CSS/chunks not trivial; check globals source deployed)
out,_=run("grep -c 'Hiệu ứng nổi (deploy' %s/app/globals.css; grep -c 'Alex Johnson' %s/app/customer/page.tsx" % (A,A))
print("### globals-effects-present / AlexJohnson-in-customer-page:", out.strip().replace('\n','  /  '))

# 5) other systems untouched: nginx still ok + count other pm2 apps online
out,_=run("nginx -t 2>&1 | tail -1; echo 'pm2 online count:'; pm2 jlist 2>/dev/null | python3 -c \"import sys,json;d=json.load(sys.stdin);print(sum(1 for x in d if x['pm2_env'].get('status')=='online'),'online /',len(d),'total')\"")
print("### health:\n"+out.strip())
ssh.close()
