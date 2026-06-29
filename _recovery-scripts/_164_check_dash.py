import paramiko, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
ssh=paramiko.SSHClient(); ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('103.97.134.164', username='root', password='lcBFDjVF15', timeout=20)
def run(cmd,t=40):
    i,o,e=ssh.exec_command(cmd,timeout=t); return o.read().decode('utf-8','replace'),e.read().decode('utf-8','replace')
A="/var/www/autoparts"
# base markers: affiliate CopyButton {"✓"}, admin "Tìm kiếm dữ liệu" + duplicate ⋯, supplier title
out,_=run(
 "echo affiliate_copytick=$(grep -c '{\"✓\"}' %s/app/affiliate/page.tsx); "
 "echo admin_search=$(grep -c 'Tìm kiếm dữ liệu' %s/app/admin/page.tsx); "
 "echo admin_dots=$(grep -c '>⋯<' %s/app/admin/page.tsx); "
 "echo affiliate_lines=$(wc -l < %s/app/affiliate/page.tsx); "
 "echo admin_lines=$(wc -l < %s/app/admin/page.tsx); "
 "echo supplier_lines=$(wc -l < %s/app/supplier/page.tsx)" % (A,A,A,A,A,A))
print(out.strip())
# my local line counts for comparison
import os
for f in ['affiliate/page.tsx','admin/page.tsx','supplier/page.tsx']:
    p=r"C:\xampp2\htdocs\autopart-backup\autoparts-source\app\\"+f.replace('/','\\')
    try:
        n=sum(1 for _ in open(p,encoding='utf-8'))
        print(f"MY {f} lines = {n}")
    except Exception as e: print(f,e)
ssh.close()
