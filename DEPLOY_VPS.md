# Deploy IMARAH to VPS (imarah.suntzutechnologies.com)

This guide deploys:

- **Web app** on `127.0.0.1:3017`
- **API** on `127.0.0.1:4017`
- **Code path** at `/root/projects/imarah`
- Public domain: `imarah.suntzutechnologies.com`

It uses **PM2** for Node processes and **Nginx** as reverse proxy.

---

## 1) One-time server setup (Ubuntu)

```bash
apt update && apt upgrade -y
apt install -y git curl nginx certbot python3-certbot-nginx
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
npm i -g pm2
```

Verify:

```bash
node -v
npm -v
pm2 -v
```

---

## 2) Clone project under /root/projects

```bash
mkdir -p /root/projects
cd /root/projects
git clone <YOUR_IMARAH_GIT_URL> imarah
cd /root/projects/imarah
npm install
```

---

## 3) Start database services (PostgreSQL + Redis)

IMARAH repo already has `docker-compose.yml` for DB services.

```bash
cd /root/projects/imarah
docker compose up -d
```

If Docker is not installed yet:

```bash
apt install -y docker.io docker-compose-plugin
systemctl enable --now docker
```

---

## 4) Configure backend env for port 4017

```bash
cd /root/projects/imarah/backend
cp .env.example .env
```

Edit `backend/.env` and set at least:

```env
NODE_ENV=production
PORT=4017
DATABASE_URL="postgresql://imarah:imarah_dev@127.0.0.1:55433/imarah"
REDIS_URL="redis://127.0.0.1:6379"
JWT_ACCESS_SECRET="<long-random-secret>"
JWT_REFRESH_SECRET="<long-random-secret>"
FIELD_ENCRYPTION_KEY_HEX="<64-hex-chars>"
UPLOAD_ROOT="./uploads"
```

Generate a 64-hex encryption key:

```bash
openssl rand -hex 32
```

Run migrations + seed:

```bash
cd /root/projects/imarah/backend
npx prisma migrate deploy
npx prisma db seed
```

---

## 5) Build web + backend

```bash
cd /root/projects/imarah
npm run build
```

For this deployment, set web API base to same-domain `/api` during build:

```bash
cd /root/projects/imarah/web
VITE_API_BASE=/api npm run build
```

---

## 6) Run apps on 3017 and 4017 with PM2

API on `4017`:

```bash
cd /root/projects/imarah/backend
pm2 start dist/index.js --name imarah-api --cwd /root/projects/imarah/backend
```

Web static server on `3017`:

```bash
pm2 start "npx serve -s /root/projects/imarah/web/dist -l 127.0.0.1:3017" --name imarah-web
```

Persist PM2 on reboot:

```bash
pm2 save
pm2 startup systemd -u root --hp /root
```

Check:

```bash
pm2 status
curl http://127.0.0.1:4017/api/health
curl -I http://127.0.0.1:3017
```

---

## 7) Nginx reverse proxy for imarah.suntzutechnologies.com

Create config:

```bash
cat >/etc/nginx/sites-available/imarah <<'EOF'
server {
    listen 80;
    server_name imarah.suntzutechnologies.com;

    # Web frontend
    location / {
        proxy_pass http://127.0.0.1:3017;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API backend
    location /api/ {
        proxy_pass http://127.0.0.1:4017/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
```

Enable + reload:

```bash
ln -s /etc/nginx/sites-available/imarah /etc/nginx/sites-enabled/imarah
nginx -t
systemctl reload nginx
```

---

## 8) TLS (HTTPS) with Certbot

```bash
certbot --nginx -d imarah.suntzutechnologies.com
```

Ensure auto-renew:

```bash
systemctl status certbot.timer
```

---

## 9) Firewall (if UFW enabled)

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
ufw status
```

Do **not** expose `3017` and `4017` publicly; keep them bound to `127.0.0.1`.

---

## 10) Update flow (new release)

```bash
cd /root/projects/imarah
git pull
npm install
docker compose up -d
cd backend && npx prisma migrate deploy && cd ..
npm run build
cd web && VITE_API_BASE=/api npm run build && cd ..
pm2 restart imarah-api
pm2 restart imarah-web
pm2 status
```

---

## Quick health checks

- App page: `https://imarah.suntzutechnologies.com`
- API health: `https://imarah.suntzutechnologies.com/api/health`
- PM2 logs:

```bash
pm2 logs imarah-api --lines 100
pm2 logs imarah-web --lines 100
```
