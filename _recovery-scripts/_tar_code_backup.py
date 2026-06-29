import paramiko, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('45.119.83.233', username='root', password='Tailoc@2026', timeout=15)
def run(cmd, t=180):
    i,o,e = ssh.exec_command(cmd, timeout=t)
    return o.read().decode('utf-8','replace'), e.read().decode('utf-8','replace')

# Tar the source-code backup folders only (these contain app/, components/, lib/, data/, etc.)
out,err = run("cd /root && tar czf /root/_autoparts_code_backup.tar.gz autoparts-backup-* 2>&1; echo '---'; ls -la /root/_autoparts_code_backup.tar.gz")
print("### TAR\n", out, err)
out,err = run("tar tzf /root/_autoparts_code_backup.tar.gz | wc -l; echo 'top-level:'; tar tzf /root/_autoparts_code_backup.tar.gz | awk -F/ '{print $1}' | sort -u")
print("### VERIFY CONTENTS\n", out, err)
ssh.close()
