import paramiko, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('45.119.83.233', username='root', password='Tailoc@2026', timeout=20)
def run(cmd, t=60):
    i,o,e = ssh.exec_command(cmd, timeout=t)
    return o.read().decode('utf-8','replace'), e.read().decode('utf-8','replace')
out,err = run("tail -c 1800 /root/_ap_deploy.log 2>/dev/null; echo; echo '===MARKERS==='; grep -E 'INSTALL_DONE|BUILD_DONE|error|Error|ELIFECYCLE|failed' /root/_ap_deploy.log | tail -8")
print(out)
if err.strip(): print("[e]", err.strip()[:200])
ssh.close()
