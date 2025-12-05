# 🚀 Deployment Guide - PharmaHub ke Vercel + Neon Database

## 📋 Prerequisites

- ✅ Akun [Vercel](https://vercel.com) (gratis)
- ✅ Akun [Neon](https://neon.tech) untuk PostgreSQL database (gratis)
- ✅ Akun [Supabase](https://supabase.com) untuk image storage (gratis)
- ✅ Akun [Midtrans](https://midtrans.com) untuk payment gateway (sandbox gratis)
- ✅ Repository GitHub dengan kode PharmaHub

---

## 🗄️ Step 1: Setup Neon Database

### 1.1 Buat Project Neon

1. Login ke [Neon Console](https://console.neon.tech/)
2. Klik **"Create Project"**
3. Pilih region terdekat (Singapore untuk Indonesia)
4. Beri nama: `pharmahub-db`

### 1.2 Ambil Connection String

1. Di Neon Dashboard, klik **"Connection String"**
2. Copy connection string yang muncul, formatnya:
   ```
   postgresql://username:password@ep-xxx.neon.tech/neondb?sslmode=require
   ```
3. Simpan untuk dipakai di Vercel nanti

### 1.3 Setup Database Schema

1. Di Neon Dashboard, klik **"SQL Editor"**
2. Buka file `database/schema.sql` dari repository ini
3. Copy semua isi file
4. Paste ke SQL Editor Neon
5. Klik **"Run"** untuk execute

**ATAU** via Command Line (local):

```bash
# Install psql client jika belum ada
# Jalankan schema
psql "postgresql://username:password@ep-xxx.neon.tech/neondb?sslmode=require" < database/schema.sql
```

### 1.4 (Optional) Seed Demo Data

Jika ingin data demo untuk testing:

```bash
# Seed categories
node api/scripts/seedCategories.js

# Seed demo accounts
node api/scripts/seedDemoAccounts.js

# Seed products (sesuaikan dengan categories yang ada)
node api/scripts/seedProducts.js
```

**PENTING**: Update environment variables di script untuk point ke Neon:

```bash
DATABASE_URL="postgresql://username:password@ep-xxx.neon.tech/neondb?sslmode=require"
```

---

## 📦 Step 2: Setup Supabase (Image Storage)

### 2.1 Buat Project Supabase

1. Login ke [Supabase](https://supabase.com)
2. Klik **"New Project"**
3. Beri nama: `pharmahub-storage`

### 2.2 Buat Storage Bucket

1. Di Supabase Dashboard, pilih **Storage**
2. Klik **"Create Bucket"**
3. Nama bucket: `product-images`
4. Set **Public**: ✅ (centang)
5. Klik **"Create Bucket"**

### 2.3 Setup Bucket Policies

1. Klik bucket `product-images`
2. Tab **"Policies"**
3. Klik **"New Policy"** → **"For full customization"**
4. Policy untuk READ (public):
   ```sql
   CREATE POLICY "Public Access"
   ON storage.objects FOR SELECT
   USING ( bucket_id = 'product-images' );
   ```
5. Policy untuk INSERT (authenticated):
   ```sql
   CREATE POLICY "Authenticated Upload"
   ON storage.objects FOR INSERT
   WITH CHECK ( bucket_id = 'product-images' );
   ```

### 2.4 Ambil API Keys

1. Di Supabase Dashboard, pilih **Settings** → **API**
2. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...`
3. Simpan untuk Vercel environment variables

---

## 🎯 Step 3: Deploy ke Vercel

### 3.1 Import Repository

1. Login ke [Vercel](https://vercel.com)
2. Klik **"Add New..."** → **"Project"**
3. Import repository GitHub: `Tugas-Proyek-Praktikum-Pemrograman-Web--Kelompok-PharmaHub-`
4. Pilih branch: `final_destination_2`

### 3.2 Configure Project

**Framework Preset**: `Vite`

**Root Directory**: `./` (default)

**Build Command**: `npm run build` (auto-detected)

**Output Directory**: `dist` (auto-detected)

### 3.3 Setup Environment Variables

Klik **"Environment Variables"** dan tambahkan:

#### Database (Neon)

```
DATABASE_URL = postgresql://username:password@ep-xxx.neon.tech/neondb?sslmode=require
```

#### JWT Authentication

```
JWT_SECRET = [generate dengan: openssl rand -base64 32]
JWT_EXPIRES_IN = 7d
```

#### Supabase

```
VITE_SUPABASE_URL = https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGc...
```

#### Midtrans (Payment)

```
MIDTRANS_SERVER_KEY = SB-Mid-server-xxx (sandbox) atau Mid-server-xxx (production)
MIDTRANS_CLIENT_KEY = SB-Mid-client-xxx (sandbox) atau Mid-client-xxx (production)
MIDTRANS_IS_PRODUCTION = false (untuk sandbox) atau true (untuk production)
```

#### Application

```
NODE_ENV = production
```

**Set untuk**: Production, Preview, Development (pilih semua)

### 3.4 Deploy

1. Klik **"Deploy"**
2. Tunggu build selesai (2-3 menit)
3. Jika sukses, akan muncul URL: `https://your-project.vercel.app`

---

## ✅ Step 4: Verifikasi Deployment

### 4.1 Test Frontend

1. Buka `https://your-project.vercel.app`
2. Pastikan halaman home muncul
3. Check console browser (F12) untuk error

### 4.2 Test Backend API

1. Buka `https://your-project.vercel.app/api/products`
2. Harus return JSON list products (atau array kosong jika belum ada data)

### 4.3 Test Database Connection

1. Login ke aplikasi dengan demo account:
   - Email: `customer@pharmahub.com`
   - Password: `customer123`
2. Jika berhasil login → database connection OK ✅

### 4.4 Test Image Upload

1. Login sebagai admin: `admin@pharmahub.com` / `admin123`
2. Pergi ke halaman Drug Management
3. Coba tambah produk baru dengan gambar
4. Jika upload berhasil → Supabase OK ✅

---

## 🔧 Troubleshooting

### Error: "Cannot find module 'pg'"

**Solution**: Pastikan `pg` ada di `package.json` dependencies (bukan devDependencies)

### Error: "Database connection failed"

**Solution**:

1. Check `DATABASE_URL` di Vercel environment variables
2. Pastikan include `?sslmode=require` di akhir connection string
3. Check IP whitelist di Neon (seharusnya allow all untuk Vercel)

### Error: "CORS policy blocked"

**Solution**: Update `api/index.js`:

```javascript
cors({
  origin: [
    "https://your-project.vercel.app", // tambahkan domain vercel kamu
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
  ].filter(Boolean),
  credentials: true,
});
```

### Error: "JWT malformed"

**Solution**: Generate `JWT_SECRET` baru:

```bash
openssl rand -base64 32
```

Paste ke Vercel environment variables

### Images tidak muncul

**Solution**:

1. Check Supabase bucket policy (harus public read)
2. Verify `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` di Vercel
3. Check browser network tab untuk error 403/404

---

## 📊 Monitoring & Maintenance

### View Logs

1. Vercel Dashboard → Your Project → **"Functions"**
2. Klik function yang error untuk lihat logs
3. Atau gunakan Vercel CLI:
   ```bash
   vercel logs
   ```

### Database Monitoring

1. Neon Dashboard → **"Monitoring"**
2. Check connection count, query performance
3. Free tier limit: 0.5 GB storage, 1 GB transfer/month

### Update Code

1. Push ke GitHub branch `final_destination_2`
2. Vercel auto-deploy (jika enabled)
3. Atau manual deploy via Vercel Dashboard

---

## 🎉 Selesai!

Website PharmaHub sekarang sudah live di:

- 🌐 **Frontend + Backend**: `https://your-project.vercel.app`
- 🗄️ **Database**: Neon PostgreSQL (managed)
- 📦 **Storage**: Supabase (image hosting)
- 💳 **Payment**: Midtrans (sandbox/production)

**Demo Accounts**:

- Customer: `customer@pharmahub.com` / `customer123`
- Admin: `admin@pharmahub.com` / `admin123`

---

## 📞 Support

Jika ada masalah deployment:

1. Check Vercel deployment logs
2. Check Neon database logs
3. Verify environment variables
4. Lihat file `.env.example` untuk referensi

**Happy Deploying! 🚀**
