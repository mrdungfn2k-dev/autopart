import paramiko, sys, io, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('45.119.83.233', username='root', password='Tailoc@2026', timeout=20)
def run(cmd, t=240):
    i,o,e = ssh.exec_command(cmd, timeout=t)
    return o.read().decode('utf-8','replace'), e.read().decode('utf-8','replace')

APP="/var/www/autoparts"
# 1. upload + extract over existing (overwrites changed files; keeps .env, node_modules)
sftp = ssh.open_sftp()
sftp.put(r"C:\xampp2\htdocs\autopart-backup\autoparts_deploy.tar.gz", "/root/autoparts_deploy.tar.gz")
sftp.close()
out,err = run("cd %s && tar xzf /root/autoparts_deploy.tar.gz && echo EXTRACTED" % APP)
print("### extract:", out.strip(), err.strip()[:200])

# 2. rebuild (background) — no dep change so skip npm install
run("cd %s && rm -f /root/_ap_up.log && nohup bash -c 'npm run build && echo BUILD_DONE' > /root/_ap_up.log 2>&1 &" % APP)
print("### rebuild started")
done=False
for _ in range(16):
    o,_ = run("grep -c BUILD_DONE /root/_ap_up.log 2>/dev/null || echo 0")
    if o.strip().endswith("1"): done=True; break
    e,_ = run("grep -iE 'failed|Error:|ELIFECYCLE' /root/_ap_up.log | tail -2")
    if e.strip(): print("### BUILD ERR:", e.strip()); break
    time.sleep(15)
print("### build done:", done)

if done:
    run("pm2 restart autoparts >/dev/null 2>&1; echo ok"); time.sleep(6)
    out,_ = run("for u in / /customer /customer/warranty /customer/returns /customer/address; do echo \"$u $(curl -s -m12 -o /dev/null -w '%{http_code}' http://127.0.0.1:3008$u)\"; done")
    print("### HTTP:\n", out.strip())
    out,_ = run("pm2 describe autoparts 2>/dev/null | grep -E 'status|uptime|exec cwd' | head -3")
    print("### STATUS:\n", out.strip())
    run("rm -f /root/autoparts_deploy.tar.gz /root/_ap_up.log")
ssh.close()
