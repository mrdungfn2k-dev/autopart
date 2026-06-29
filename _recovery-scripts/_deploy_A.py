import paramiko, sys, io, os, secrets
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('45.119.83.233', username='root', password='Tailoc@2026', timeout=20)
def run(cmd, t=120):
    i,o,e = ssh.exec_command(cmd, timeout=t)
    return o.read().decode('utf-8','replace'), e.read().decode('utf-8','replace')

APP="/var/www/autoparts"

# 0. Current state
out,err = run("ls -d %s 2>/dev/null && echo EXISTS || echo MISSING; echo '--pm2--'; pm2 pid autoparts 2>/dev/null" % APP)
print("### STATE\n", out, err)

# 1. Try to recover existing JWT_SECRET from running proc env (so sessions survive); else generate
out,err = run("PID=$(pm2 pid autoparts 2>/dev/null | head -1); tr '\\0' '\\n' < /proc/$PID/environ 2>/dev/null | grep '^JWT_SECRET=' | head -1")
existing = out.strip()
if existing.startswith("JWT_SECRET="):
    jwt = existing.split("=",1)[1]
    print("### JWT_SECRET: recovered from running process")
else:
    jwt = secrets.token_hex(32)
    print("### JWT_SECRET: generated new (existing sessions will need re-login)")

# 2. Backup any existing data dir (safety) and create app dir fresh
out,err = run("mkdir -p %s && echo OK" % APP)
print("### MKDIR\n", out, err)

# 3. Upload tarball
sftp = ssh.open_sftp()
local_tar = r"C:\xampp2\htdocs\autopart-backup\autoparts_deploy.tar.gz"
remote_tar = "/root/autoparts_deploy.tar.gz"
sftp.put(local_tar, remote_tar)
print("### UPLOAD: done", os.path.getsize(local_tar), "bytes")
sftp.close()

# 4. Extract into app dir (do NOT clobber an existing .env)
out,err = run("cd %s && tar xzf %s && echo EXTRACTED && ls | head -40" % (APP, remote_tar))
print("### EXTRACT\n", out, err)

# 5. Write .env (JWT secret + production)
env_content = "JWT_SECRET=%s\nNODE_ENV=production\n" % jwt
sftp = ssh.open_sftp()
with sftp.open("%s/.env" % APP, "w") as f:
    f.write(env_content)
sftp.close()
out,err = run("cd %s && test -f .env && echo 'ENV_OK' && grep -c JWT_SECRET .env" % APP)
print("### ENV\n", out, err)

# 6. Verify key files present
out,err = run("cd %s && for f in package.json next.config.ts middleware.ts app/page.tsx data/users.json docs/ARCHITECTURE.md RULES.md; do test -f $f && echo \"OK  $f\" || echo \"MISS $f\"; done" % APP)
print("### FILE CHECK\n", out, err)
ssh.close()
print("\n>>> Stage A done. Next: npm install + build + pm2 restart.")
