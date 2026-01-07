# &And Sosial media learning (SML) - Colabortion Development guide

Aplikasi chat real-time Stack : React, Node.js/Express, Socket.io, dan MongoDB.

## Struktur Proyek

```
loginReact/
├── api/                    # Backend (Node.js + Express)
│   ├── server.js
│   ├── model/
│   │   └── model.js       # MongoDB Schemas (User, Chat, Group)
│   ├── controllers/
│   │   └── createUser.js
│   ├── package.json
│   ├── vercel.json        # Vercel deployment config
│   ├── .env.example
│   └── .env               # (buat sendiri, jangan commit!)
│
└── login/                  # Frontend (React + Vite)
    ├── src/
    │   ├── pages/
    │   │   ├── Dhasboard.jsx
    │   │   ├── LoginPage.jsx
    │   │   └── RegisterPages.jsx
    │   ├── service/
    │   │   └── RequireLogin.jsx
    │   └── ...
    ├── package.json
    ├── vercel.json
    ├── vite.config.js
    ├── .env.example
    └── .env            
```

---

##  Prerequisites

- **Node.js** v14+
- **MongoDB Atlas** account (cloud database)
- **Vercel** account (untuk deploy)
- **Git** untuk version control

---

##  Deployment Steps

### **1. Backend (API) - Deploy ke Vercel**

#### Step 1.1: Setup Environment Variables di Backend

Buat file `api/.env` berdasarkan `api/.env.example`:

```bash
cd api
cp .env.example .env
```

Edit `api/.env`:

```env
# MongoDB Atlas Credentials
DB_USERNAME=your_mongodb_username
DB_PASSWORD=your_mongodb_password

# JWT Keys
AUTH_KEY=your_secret_jwt_key_here
ACC_TOKEN=access_token

# Frontend URL (CORS)
FRONTEND_URL=https://your-frontend-domain.vercel.app

# Environment
NODE_ENV=production
PORT=3000
```

**Cara mendapatkan MongoDB credentials:**
1. Buka [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster → set username & password
3. Get connection string → extract username & password

#### Step 1.2: Deploy Backend ke Vercel

```bash
cd api
npm install -g vercel
vercel deploy --prod
```

Vercel akan menanyakan:
- Project name: `loginreact-api`
- Confirm settings: **Y**

Setelah deploy, Anda akan mendapat URL seperti: `https://loginreact-api.vercel.app`

#### Step 1.3: Set Environment Variables di Vercel

1. Buka [Vercel Dashboard](https://vercel.com/dashboard)
2. Pilih project `loginreact-api`
3. Settings → Environment Variables
4. Tambahkan:
   - `DB_USERNAME` = your MongoDB username
   - `DB_PASSWORD` = your MongoDB password
   - `AUTH_KEY` = random secret string
   - `ACC_TOKEN` = token name
   - `FRONTEND_URL` = frontend domain (akan set setelah frontend deploy)
   - `NODE_ENV` = production

5. Klik "Save & Redeploy"

---

### **2. Frontend (React) - Deploy ke Vercel**

#### Step 2.1: Setup Environment Variables di Frontend

Buat file `login/.env` berdasarkan `login/.env.example`:

```bash
cd login
cp .env.example .env
```

Edit `login/.env`:

```env
VITE_API_URL=https://loginreact-api.vercel.app
```

#### Step 2.2: Build & Deploy Frontend

```bash
cd login
npm run build
vercel deploy --prod
```

Setelah deploy, Anda akan mendapat URL seperti: `https://loginreact.vercel.app`

#### Step 2.3: Update Backend Environment Variable

Sekarang update `FRONTEND_URL` di backend dengan frontend domain:

1. Buka Vercel Backend Project
2. Settings → Environment Variables
3. Edit `FRONTEND_URL` = `https://loginreact.vercel.app`
4. Klik "Save & Redeploy"

---

## Testing Production Deployment

1. **Buka aplikasi**: https://loginreact.vercel.app
2. **Register account**:
   - Input email & password
   - Click "Register"
   - Check MongoDB Atlas → collection `users` terbuat dengan data baru
3. **Login**:
   - Gunakan email & password yang baru di-register
   - Token JWT akan di-set di cookie (httpOnly, secure)
4. **Chat functionality**:
   - Buka di browser lain (atau private window)
   - Register account berbeda
   - Login dan chat antar akun
   - Pesan akan tersimpan di MongoDB `chat` collection
   - Socket.io akan mengirim pesan real-time
5. **Create Group**:
   - Click plus button → Create Group
   - Add group name & image
   - Group akan tersimpan di MongoDB `groups` collection
6. **Access Group**:
   - Click nama group di sidebar
   - POST request ke `/dhasboard` dengan `groupId`

---

##  Multi-User Testing

### Cara mengakses dari device berbeda:

**Dari Komputer:**
- https://loginreact.vercel.app

**Dari Smartphone:**
- Buka: https://loginreact.vercel.app
- Responsive design akan auto-adjust
- Sidebars bisa di-swipe/toggle

**Tips:**
- Gunakan same WiFi atau buka di berbagai browser tabs
- DevTools → Device Emulation untuk test responsive

---

##  Security Checklist

- ✅ Cookies: `httpOnly: true`, `secure: true` (production)
- ✅ CORS: Hanya menerima request dari frontend domain
- ✅ MongoDB: Username & password di environment variables (tidak di-commit)
- ✅ JWT: Secret key di environment (tidak di-commit)
- ✅ Database: MongoDB Atlas dengan IP whitelist

---

##  Troubleshooting

### Error: "Cannot find module 'dotenv'"

```bash
cd api
npm install dotenv
```

### Error: "MongoDB connection failed"

- Check `DB_USERNAME` & `DB_PASSWORD` di `.env`
- Check MongoDB Atlas IP whitelist (add 0.0.0.0/0 untuk Vercel)

### Error: "CORS policy: No 'Access-Control-Allow-Origin' header"

- Check `FRONTEND_URL` di backend `.env`
- Pastikan domain frontend sudah benar dan dipisah dengan `,` jika multiple

### Error: "Socket.io connection failed"

- Check `VITE_API_URL` di frontend `.env`
- Pastikan backend URL sudah production URL

### Cookies tidak ter-set

- Pastikan di production: `secure: true`, `sameSite: 'lax'`
- Akses dari HTTPS (Vercel sudah auto HTTPS)

---

## Continuous Updates

Untuk update production setelah perubahan code:

**Backend:**
```bash
cd api
git add .
git commit -m "fix: update feature"
git push
vercel deploy --prod
```

**Frontend:**
```bash
cd login
npm run build
git add .
git commit -m "fix: update feature"
git push
vercel deploy --prod
```

---

##  Contact & Support

Untuk troubleshooting lebih lanjut:
1. Check backend logs: `vercel logs loginreact-api -f`
2. Check frontend logs: Browser DevTools → Console
3. Check MongoDB: MongoDB Atlas → Collections

---

## Features Ready for Production

✅ User Registration & Login dengan JWT
✅ Real-time Chat dengan Socket.io
✅ Group Creation dengan Custom Image
✅ Responsive Mobile Design
✅ Cookie-based Session Management
✅ Multi-user Support
✅ Database: MongoDB Atlas
✅ Deployment: Vercel (Backend + Frontend)

---

**Deployment Complete! Love 💖**
