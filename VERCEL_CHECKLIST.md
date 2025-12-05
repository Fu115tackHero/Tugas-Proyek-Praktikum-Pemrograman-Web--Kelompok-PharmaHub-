# ✅ Vercel Deployment Checklist - PharmaHub

## 🎯 Quick Reference untuk Deployment

### 1️⃣ **Database Setup (Neon)**

- [ ] Buat project di [Neon Console](https://console.neon.tech/)
- [ ] Copy **DATABASE_URL** (format: `postgresql://user:pass@host.neon.tech/db?sslmode=require`)
- [ ] Run `database/schema.sql` via Neon SQL Editor
- [ ] (Optional) Seed data via scripts di `api/scripts/`

### 2️⃣ **Image Storage (Supabase)**

- [ ] Buat project di [Supabase](https://supabase.com)
- [ ] Buat bucket `product-images` (public)
- [ ] Set policies untuk read (public) dan insert (authenticated)
- [ ] Copy **Project URL** dan **anon key**

### 3️⃣ **Payment Gateway (Midtrans)**

- [ ] Daftar di [Midtrans](https://midtrans.com)
- [ ] Ambil **Server Key** dan **Client Key** (sandbox atau production)
- [ ] Note: Gunakan prefix `SB-Mid-` untuk sandbox

### 4️⃣ **Deploy ke Vercel**

- [ ] Import repo GitHub ke [Vercel](https://vercel.com)
- [ ] Framework: **Vite**
- [ ] Build Command: `npm run build`
- [ ] Output: `dist`

### 5️⃣ **Environment Variables di Vercel**

Copy paste ini ke Vercel → Settings → Environment Variables:

```bash
# Database (Neon)
DATABASE_URL=postgresql://user:pass@host.neon.tech/db?sslmode=require

# JWT
JWT_SECRET=[generate: openssl rand -base64 32]
JWT_EXPIRES_IN=7d

# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Midtrans
MIDTRANS_SERVER_KEY=SB-Mid-server-xxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxx
MIDTRANS_IS_PRODUCTION=false

# App
NODE_ENV=production
```

### 6️⃣ **Verify Deployment**

- [ ] Frontend loads: `https://your-project.vercel.app`
- [ ] API works: `https://your-project.vercel.app/api/products`
- [ ] Login test: `customer@pharmahub.com` / `customer123`
- [ ] Image upload test via admin panel

---

## 🔧 Perubahan yang Sudah Dilakukan

### ✅ Database Configuration

- **File baru**: `api/config/database.js` - Centralized DB config
- **Support**: `DATABASE_URL` (Neon) dan individual credentials (local)
- **SSL**: Auto-enabled untuk Neon

### ✅ Services Updated

Semua services sekarang menggunakan `require("../config/database")`:

- `api/services/authService.js`
- `api/services/productService.js`
- `api/services/categoryService.js`
- `api/services/cartService.js`
- `api/services/couponService.js`
- `api/services/orderService.js`
- `api/services/notificationService.js`

### ✅ Dependencies Merged

`package.json` (root) sekarang include semua backend dependencies:

- `pg` - PostgreSQL client
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT auth
- `axios`, `form-data`, `node-fetch` - HTTP clients

### ✅ Vercel Configuration

- `vercel.json` - Updated dengan routes dan environment
- `.vercelignore` - Exclude dev files dari deployment
- `.env.example` - Template untuk environment variables

### ✅ Documentation

- `DEPLOYMENT_GUIDE.md` - Step-by-step deployment guide
- `VERCEL_CHECKLIST.md` - Quick reference checklist (this file)

---

## 🚨 Common Issues & Solutions

### Build Error: "Cannot find module 'pg'"

**Fix**: Sudah diperbaiki - `pg` ada di root `package.json` dependencies

### API Error: "Database connection failed"

**Check**:

1. `DATABASE_URL` di Vercel environment variables
2. Include `?sslmode=require` di connection string
3. Neon database masih active (free tier bisa pause jika idle)

### CORS Error

**Fix**: `api/index.js` sudah support Vercel auto-domain via `process.env.VERCEL_URL`

### Images 404

**Check**:

1. Supabase bucket `product-images` public
2. Bucket policies allow read
3. Environment variables `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` benar

---

## 📞 Need Help?

1. **Detailed Guide**: Lihat `DEPLOYMENT_GUIDE.md`
2. **Vercel Logs**: Dashboard → Functions → View logs
3. **Neon Monitoring**: Dashboard → Monitoring
4. **Supabase Logs**: Dashboard → Logs

---

## 🎉 Ready to Deploy!

Project sudah **fully compatible** dengan Vercel + Neon deployment.

Tinggal:

1. Setup Neon database
2. Setup Supabase storage
3. Import ke Vercel
4. Add environment variables
5. Deploy! 🚀
