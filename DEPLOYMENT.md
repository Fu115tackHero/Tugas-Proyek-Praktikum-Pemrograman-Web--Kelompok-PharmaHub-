# PharmaHub - Deployment Guide

## 🚀 Deployment ke Vercel

Project ini sudah dikonfigurasi sebagai **Fullstack Monorepo** dengan integrasi **Midtrans Payment Gateway**.

### Struktur Project

```
├── api/                    # Backend (Serverless Functions)
│   └── index.js           # Express API untuk Midtrans
├── src/                   # Frontend React
├── public/               # Static assets
├── vercel.json           # Konfigurasi Vercel
└── index.html            # HTML dengan Midtrans Snap Script
```

### Langkah-langkah Deployment

#### 1. Persiapan Repository

```bash
# Pastikan semua file sudah di-commit
git add .
git commit -m "Add Midtrans integration and Vercel config"
git push origin main
```

#### 2. Deploy ke Vercel

**Opsi A: Via Vercel CLI**

```bash
# Install Vercel CLI (jika belum)
npm install -g vercel

# Login ke Vercel
vercel login

# Deploy
vercel
```

**Opsi B: Via Vercel Dashboard**

1. Buka [vercel.com](https://vercel.com)
2. Login dengan GitHub
3. Klik **"New Project"**
4. Import repository ini
5. Vercel akan otomatis detect konfigurasi dari `vercel.json`
6. Klik **"Deploy"**

#### 3. Environment Variables (Opsional)

Jika ingin menggunakan production Midtrans:

1. Di Vercel Dashboard → Project Settings → Environment Variables
2. Tambahkan:

   - `MIDTRANS_SERVER_KEY`: Your production server key
   - `MIDTRANS_CLIENT_KEY`: Your production client key
   - `MIDTRANS_IS_PRODUCTION`: `true`

3. Update `api/index.js` untuk menggunakan env variables:

```javascript
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});
```

### Testing

#### Local Testing

1. Jalankan development server:

```bash
npm run dev
```

2. Test API endpoint:

```bash
curl http://localhost:5173/api
```

3. Test checkout flow dengan "Pembayaran Online"

#### Production Testing

Setelah deploy, test:

1. Buka URL production (e.g., `https://pharmahub.vercel.app`)
2. Tambahkan produk ke cart
3. Checkout dengan metode "Pembayaran Online"
4. Popup Midtrans Snap akan muncul
5. Gunakan test credit card:
   - Card Number: `4811 1111 1111 1114`
   - CVV: `123`
   - Exp: `01/25`

### Fitur yang Sudah Terintegrasi

✅ **Backend API** (`/api/create-transaction`)

- Express.js Serverless Function
- CORS enabled
- Midtrans Snap integration
- Error handling

✅ **Frontend**

- React + Vite
- Midtrans Snap popup
- Payment callbacks (success, pending, error)
- Order history
- Discount coupon support

✅ **Payment Flow**

- Bayar di Tempat (offline)
- Pembayaran Online (Midtrans Snap)
- Auto-save to localStorage
- Redirect to history page

### Troubleshooting

**Problem**: API tidak bisa diakses

- **Solution**: Pastikan `vercel.json` sudah benar dan rewrites ke `/api/*` sudah dikonfigurasi

**Problem**: Popup Midtrans tidak muncul

- **Solution**: Cek console browser, pastikan script Midtrans sudah loaded di `index.html`

**Problem**: Error "token is not defined"

- **Solution**: Pastikan backend mengembalikan `{ success: true, token: "..." }`

### Support

Untuk pertanyaan atau issue:

- Check Vercel deployment logs
- Check browser console for frontend errors
- Check Midtrans Dashboard untuk transaction logs

---

**Sandbox Test Credentials**

- Server Key: Get from `.env` file or Midtrans Dashboard
- Client Key: Get from `.env` file or Midtrans Dashboard
- Test Card: `4811 1111 1111 1114` (Success)
- CVV: `123`
- Expiry: Any future date
- OTP: `112233`
