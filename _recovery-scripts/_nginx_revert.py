import paramiko, sys, io, socket
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('45.119.83.233', username='root', password='Tailoc@2026', timeout=20)
def run(cmd, t=60):
    i,o,e = ssh.exec_command(cmd, timeout=t)
    return o.read().decode('utf-8','replace'), e.read().decode('utf-8','replace')

AVAIL = "/etc/nginx/sites-available/autopartsvietnam.com.vn"
ENABLED = "/etc/nginx/sites-enabled/autopartsvietnam.com.vn"

# 1. Remove the block I added (symlink + the available file) -> full revert
out,err = run("rm -f %s %s && echo REMOVED" % (ENABLED, AVAIL))
print("### remove:", out.strip(), err.strip())

# 2. Validate config still OK
out,err = run("nginx -t 2>&1 | tail -2")
combined = out+err
ok = "successful" in combined
print("### nginx -t:", combined.strip())

# 3. Reload to apply removal (only if valid)
if ok:
    out,err = run("systemctl reload nginx 2>&1 && echo RELOADED || echo FAIL")
    print("### reload:", (out+err).strip())

# 4. Confirm no autoparts block remains; other sites still present
out,err = run("grep -rl 'autopartsvietnam' /etc/nginx/sites-enabled/ /etc/nginx/sites-available/ 2>/dev/null || echo NO_AUTOPART_BLOCK; echo '--enabled count--'; ls /etc/nginx/sites-enabled/ | wc -l")
print("### state:\n", out.strip())

# 5. The domain now resolves only via real DNS (164); local SNI test should now NOT serve our app
out,err = run("curl -s -m10 --resolve autopartsvietnam.com.vn:443:127.0.0.1 -o /dev/null -w 'local_sni_now=%{http_code}\\n' https://autopartsvietnam.com.vn/ 2>&1 | tail -1")
print("### local SNI after revert:", out.strip())

ssh.close()
# 6. Confirm public DNS still points to 164 (unchanged)
try:
    print("### Public DNS autopartsvietnam.com.vn ->", socket.gethostbyname("autopartsvietnam.com.vn"))
except Exception as e:
    print("dns err", e)
