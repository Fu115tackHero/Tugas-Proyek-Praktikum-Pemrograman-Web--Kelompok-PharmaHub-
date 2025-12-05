# 📧 Email OTP Setup Guide - PharmaHub

## ✅ Fitur OTP Email Sudah Diimplementasi!

Sistem OTP untuk Register dan Forgot Password sudah lengkap dengan pengiriman email OTP ke user.

---

## 🚀 Setup Email Service (WAJIB untuk SEMUA USER)

### Mengapa Perlu Setup Email?

Setiap developer yang deploy aplikasi ini **HARUS setup email mereka sendiri** karena:
- Gmail tidak allow sharing App Password untuk keamanan
- Setiap environment perlu konfigurasi email sendiri
- Tidak ada "universal" email service tanpa setup

### Cara Setup Gmail untuk Kirim OTP:

#### 1. **Enable 2-Step Verification**
   - Pergi ke: https://myaccount.google.com/security
   - Aktifkan **"2-Step Verification"**
   - Ikuti langkah verifikasi

#### 2. **Generate App Password**
   - Pergi ke: https://myaccount.google.com/apppasswords
   - Pilih **"Select app"** → **Mail**
   - Pilih **"Select device"** → **Other** → ketik **"PharmaHub"**
   - Klik **"Generate"**
   - **Copy 16-character password** yang muncul (contoh: `abcd efgh ijkl mnop`)

#### 3. **Update `.env`**
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=abcdefghijklmnop  # App Password (tanpa spasi)
   ```

---

## 📋 Endpoints OTP yang Tersedia

### 1. **Register dengan OTP**

#### Request OTP untuk Register:
```http
POST /api/auth/register/request-otp
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "08123456789",
  "address": "Jl. Example No. 123"
}
```

Response:
```json
{
  "success": true,
  "message": "OTP has been sent to your email. Please verify within 5 minutes.",
  "email": "john@example.com"
}
```

#### Verify OTP dan Complete Registration:
```http
POST /api/auth/register/verify-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}
```

Response:
```json
{
  "success": true,
  "message": "Registration successful",
  "user": { ... },
  "token": "jwt-token-here"
}
```

---

### 2. **Forgot Password dengan OTP**

#### Request OTP untuk Reset Password:
```http
POST /api/auth/forgot-password/request-otp
Content-Type: application/json

{
  "email": "john@example.com"
}
```

Response:
```json
{
  "success": true,
  "message": "OTP has been sent to your email. Please verify within 5 minutes.",
  "email": "john@example.com"
}
```

#### Verify OTP:
```http
POST /api/auth/forgot-password/verify-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}
```

Response:
```json
{
  "success": true,
  "message": "OTP verified. You can now reset your password.",
  "resetToken": "temporary-jwt-token-for-reset"
}
```

#### Reset Password:
```http
POST /api/auth/forgot-password/reset
Content-Type: application/json

{
  "resetToken": "temporary-jwt-token-from-previous-step",
  "newPassword": "newpassword123"
}
```

Response:
```json
{
  "success": true,
  "message": "Password has been reset successfully. You can now login with your new password."
}
```

---

## 🔧 Technical Details

### Database Schema (Sudah di-migrate):
- **otp_codes** table:
  - `id`, `email`, `otp_code`, `type`, `expires_at`, `is_used`, `created_at`
  - Unique constraint: `(email, type)`
  - OTP expire: 5 menit
  
- **users** table (added columns):
  - `email_verified`: Boolean (default false)
  - `pending_verification`: Boolean (default false)

### OTP Flow:
1. User request OTP → OTP generated (6 digit)
2. OTP saved ke database dengan `expires_at` (5 menit)
3. Email dikirim ke user dengan HTML template
4. User input OTP → verify di database
5. Mark OTP as used → complete action (register/reset password)

### Security Features:
- ✅ OTP expire dalam 5 menit
- ✅ OTP hanya bisa dipakai sekali
- ✅ Reset password token expire dalam 10 menit
- ✅ Email template berbeda untuk register vs reset password
- ✅ Cleanup expired OTP otomatis

---

## 🧪 Testing

### Test Email Service:
```powershell
# Test koneksi email
node -e "
const { testEmailConnection } = require('./api/services/emailService');
testEmailConnection();
"
```

### Test OTP Flow:
1. Start server: `node api/server.js`
2. Request OTP via Postman/curl
3. Cek email (termasuk Spam folder)
4. Copy OTP code
5. Verify OTP via endpoint

---

## ⚠️ Troubleshooting

### "Failed to send OTP email"
- ✅ Cek `EMAIL_USER` dan `EMAIL_PASSWORD` di `.env`
- ✅ Pastikan App Password bukan password login biasa
- ✅ Pastikan 2-Step Verification aktif
- ✅ Pastikan email Gmail (atau setup SMTP lain)

### "OTP tidak diterima"
- ✅ Cek Spam/Junk folder
- ✅ Tunggu 1-2 menit (kadang delay)
- ✅ Cek console log untuk error

### "Kode OTP sudah kadaluarsa"
- ✅ OTP expire dalam 5 menit
- ✅ Request OTP baru jika expired

---

## 🚫 TIDAK BENTROK dengan Google OAuth

Implementasi ini **TIDAK akan bentrok** dengan fitur Google OAuth karena:
- ✅ Register biasa: `/api/auth/register/request-otp` → `/api/auth/register/verify-otp`
- ✅ Google OAuth: `/api/auth/google` (route terpisah)
- ✅ Kedua flow bisa jalan bersamaan
- ✅ User bisa pilih: Register via email + OTP ATAU login via Google

---

## 📦 Alternatif Email Service (Jika Gmail Ribet)

### 1. **SendGrid** (Recommended untuk production)
```bash
npm install @sendgrid/mail
```

Update `emailService.js`:
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Kirim email
await sgMail.send({
  to: email,
  from: 'noreply@pharmahub.com',
  subject: subject,
  html: message,
});
```

### 2. **Mailgun**
- Gratis untuk 5000 email/bulan
- Setup lebih mudah dari Gmail

### 3. **SMTP Server Sendiri**
- Perlu VPS dengan email server (Postfix, etc)

---

## ✅ Checklist Setup

- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Setup Gmail 2-Step Verification
- [ ] Generate App Password
- [ ] Update `.env` dengan `EMAIL_USER` dan `EMAIL_PASSWORD`
- [ ] Run migration: `node api/scripts/runOTPMigration.js`
- [ ] Start server: `node api/server.js`
- [ ] Test OTP flow via Postman

---

## 📝 Notes untuk Team

- **JANGAN commit `.env` ke GitHub** (sudah di .gitignore)
- Setiap developer setup email sendiri
- OTP email akan dikirim dari **email yang di-setup di `.env`**
- Untuk production, consider SendGrid/Mailgun

Selamat menggunakan! 🎉
