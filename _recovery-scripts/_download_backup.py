import paramiko, sys, io, os, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('45.119.83.233', username='root', password='Tailoc@2026', timeout=15)
sftp = ssh.open_sftp()

dest_dir = r"C:\xampp2\htdocs\autopart-backup\_raw"
os.makedirs(dest_dir, exist_ok=True)
remote = "/root/_autoparts_code_backup.tar.gz"
local = os.path.join(dest_dir, "autoparts_code_backup.tar.gz")

size = sftp.stat(remote).st_size
print(f"Downloading {remote} ({size} bytes) -> {local}")
t0=time.time()
def prog(done, total):
    pass
sftp.get(remote, local, callback=prog)
print(f"DONE in {time.time()-t0:.1f}s, local size = {os.path.getsize(local)}")
sftp.close(); ssh.close()
