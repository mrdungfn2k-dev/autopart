import paramiko, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('45.119.83.233', username='root', password='Tailoc@2026', timeout=20)
def run(cmd, t=60):
    i,o,e = ssh.exec_command(cmd, timeout=t)
    return o.read().decode('utf-8','replace'), e.read().decode('utf-8','replace')

CONF = r"""# autopartsvietnam.com.vn -> Next.js app (PM2 'autoparts' @ 127.0.0.1:3008)
# Added 2026-06-11 by deploy. Independent server block; does NOT modify other sites.
server {
    listen 80;
    server_name autopartsvietnam.com.vn;
    location / { return 301 https://$host$request_uri; }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name autopartsvietnam.com.vn;

    ssl_certificate /etc/letsencrypt/live/autopartsvietnam.com.vn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/autopartsvietnam.com.vn/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    client_max_body_size 50M;
    gzip on;
    gzip_types text/css text/javascript application/javascript application/json image/svg+xml;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location / {
        proxy_pass http://127.0.0.1:3008;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 300;
    }
}
"""

AVAIL = "/etc/nginx/sites-available/autopartsvietnam.com.vn"
ENABLED = "/etc/nginx/sites-enabled/autopartsvietnam.com.vn"

# 1. Write config to sites-available
sftp = ssh.open_sftp()
with sftp.open(AVAIL, "w") as f:
    f.write(CONF)
sftp.close()
print("### wrote", AVAIL)

# 2. Symlink to sites-enabled
out,err = run("ln -sf %s %s && echo LINKED" % (AVAIL, ENABLED))
print("### symlink:", out.strip(), err.strip())

# 3. nginx -t (validate) — capture
out,err = run("nginx -t 2>&1")
combined = (out+err)
ok = "syntax is ok" in combined and "test is successful" in combined
print("### nginx -t:\n", combined.strip()[-600:])
print("### VALID:", ok)

if ok:
    out,err = run("systemctl reload nginx 2>&1 && echo RELOADED || echo RELOAD_FAIL")
    print("### reload:", (out+err).strip())
    # 4. Verify via SNI to localhost (DNS may not point here yet)
    out,err = run("curl -s -m12 --resolve autopartsvietnam.com.vn:443:127.0.0.1 -X POST https://autopartsvietnam.com.vn/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"kh@autopart.vn\",\"password\":\"Customer@123\"}' 2>&1 | head -c 220")
    print("### VERIFY (domain via nginx->3008) login:\n", out.strip())
    out,err = run("curl -s -m12 --resolve autopartsvietnam.com.vn:443:127.0.0.1 -o /dev/null -w 'home_https=%{http_code}\\n' https://autopartsvietnam.com.vn/ ; curl -s -m12 -o /dev/null -w 'http80_redirect=%{http_code}\\n' -H 'Host: autopartsvietnam.com.vn' http://127.0.0.1/")
    print("### VERIFY codes:\n", out.strip())
else:
    # rollback: remove the symlink so nothing breaks
    run("rm -f %s" % ENABLED)
    print("### nginx -t FAILED -> removed symlink, no reload. Other sites untouched.")
ssh.close()
