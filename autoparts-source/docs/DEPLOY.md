# Hướng dẫn Deploy — AutoParts

## 1. Môi trường
| | Giá trị |
|---|---|
| Server | VPS Ubuntu 22.04, IP **45.119.83.233** |
| Web server | **Nginx** (reverse proxy) |
| Runtime | **Node 20** (PM2) |
| "DB" | File JSON trong `data/` (không có DB server) |
| App dir | **`/var/www/autoparts`** |
| Process | PM2 tên **`autoparts`** — `npm start` (= `next start`) cổng **3008** |
| Domain | autopartsvietnam.com.vn (SSL Let's Encrypt) |

## 2. Biến môi trường (`.env` / `.env.local` tại app dir) — KHÔNG commit
```
JWT_SECRET=<chuỗi bí mật mạnh, cố định>   # BẮT BUỘC — đổi = đăng xuất toàn bộ
NODE_ENV=production
```

## 3. Các bước deploy
```bash
cd /var/www/autoparts
# 1. Lấy code mới (SFTP upload / rsync / git pull) — KHÔNG đè data/ và .env nếu chỉ đổi code
# 2. Cài dependency (khi package.json đổi)
npm install --omit=dev=false
# 3. Build production
npm run build           # tạo .next/  (bắt buộc trước khi start)
# 4. Restart process
pm2 restart autoparts   # hoặc: pm2 start npm --name autoparts -- start  (lần đầu)
pm2 save
```
> Lưu ý: `next start` chạy từ `.next/` đã build. Cần `node_modules` + `.next` + `data/` + `public/` trên server. KHÔNG cần upload `node_modules`/`.next` từ máy dev (build lại trên server — native binary khác OS).

## 4. Nginx (reverse proxy) — mẫu cho domain
```nginx
server {
  listen 443 ssl;
  server_name autopartsvietnam.com.vn;
  ssl_certificate     /etc/letsencrypt/live/autopartsvietnam.com.vn/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/autopartsvietnam.com.vn/privkey.pem;
  location / { proxy_pass http://127.0.0.1:3008; proxy_set_header Host $host; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; }
}
```

## 5. Sau deploy — kiểm tra
- [ ] `pm2 status autoparts` = online; `pm2 logs autoparts` không lỗi.
- [ ] `curl -I http://127.0.0.1:3008/` = 200; static `/_next/static/...` = 200 (KHÔNG 500 → nếu 500 nghĩa `.next` thiếu, build lại).
- [ ] Trang chủ load; đăng nhập 4 vai trò OK (xem CRITICAL_PATHS.md).
- [ ] Không lỗi 500 trong log.

## 6. Sao lưu & Rollback
- **Backup dữ liệu:** copy `data/` (vd `cp -r data /root/autoparts-data-backup-$(date +%F)`) trước mỗi deploy.
- **Rollback code:** giữ thư mục cũ (`mv /var/www/autoparts /var/www/autoparts.old` trước khi thay), lỗi thì đổi lại + `pm2 restart`.

## ⚠️ Ghi chú sự cố (2026-06): thư mục `/var/www/autoparts` từng bị XOÁ khỏi đĩa trong khi PM2 vẫn chạy từ RAM (`cwd (deleted)`). Khi deploy lại: tạo lại thư mục, upload source, `npm install && npm run build`, rồi `pm2 restart autoparts` (sẽ nạp lại từ đĩa). Sau đó app mới sống sót qua reboot. Luôn giữ snapshot `data/` để không mất dữ liệu.
