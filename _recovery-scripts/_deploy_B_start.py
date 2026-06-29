import paramiko, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('45.119.83.233', username='root', password='Tailoc@2026', timeout=20)
def run(cmd, t=60):
    i,o,e = ssh.exec_command(cmd, timeout=t)
    return o.read().decode('utf-8','replace'), e.read().decode('utf-8','replace')

# Node/npm version on server
out,err = run("node -v; npm -v")
print("### node/npm:", out.strip(), err.strip())

# Kick off install + build in background, log to file
cmd = ("cd /var/www/autoparts && rm -f /root/_ap_deploy.log && "
       "nohup bash -c '"
       "echo START $(date) && "
       "npm install --no-audit --no-fund && "
       "echo INSTALL_DONE && "
       "npm run build && "
       "echo BUILD_DONE' "
       "> /root/_ap_deploy.log 2>&1 &")
run(cmd)
print("### Kicked off install+build in background -> /root/_ap_deploy.log")
ssh.close()
