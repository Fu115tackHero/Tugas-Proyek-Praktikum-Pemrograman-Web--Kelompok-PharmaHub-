# Profile Photo Upload - Setup Guide ✅

## Overview
Fitur upload foto profil menggunakan Supabase Storage untuk menyimpan gambar dan path-nya disimpan di database PostgreSQL.

## What's Changed

### 1. Frontend Changes

#### ✅ Profile.jsx
- **Upload ke Supabase**: Foto profil sekarang diupload ke bucket `profile-photos` di Supabase Storage
- **Simpan URL ke Database**: URL foto disimpan ke kolom `profile_photo_url` di tabel `users`
- **Preview Real-time**: User dapat melihat preview foto sebelum menyimpan
- **Loading State**: Tombol menampilkan status "Menyimpan..." saat upload
- **Validasi File**: 
  - Format: JPG, PNG, WebP
  - Ukuran maksimal: 5MB

#### ✅ Navbar.jsx
- **Display dari Database**: Avatar menggunakan `user.profile_photo_url` dari database
- **Fallback**: Jika tidak ada foto, gunakan avatar default dari UI Avatars

### 2. Database Schema
Kolom `profile_photo_url` sudah ada di tabel `users`:
```sql
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(50) DEFAULT 'customer',
  profile_photo_url TEXT,  -- ✅ URL foto profil dari Supabase
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Backend API
Endpoint `PUT /api/auth/profile` sudah support `profile_photo_url`:

**Request:**
```json
{
  "userId": 1,
  "name": "John Doe",
  "phone": "08123456789",
  "address": "Jl. Example",
  "profile_photo_url": "https://vhmggapaspvvtglkijyq.supabase.co/storage/v1/object/public/profile-photos/1733123456789_abc123.jpg"
}
```

## Supabase Storage Setup

### Step 1: Create Bucket
1. Buka Supabase Dashboard: https://supabase.com/dashboard
2. Pilih project Anda: `vhmggapaspvvtglkijyq`
3. Klik **Storage** di sidebar kiri
4. Klik tombol **New bucket**
5. Isi form:
   - **Name**: `profile-photos`
   - **Public bucket**: ✅ **CENTANG** (agar foto bisa diakses publik)
   - **File size limit**: 5MB
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp`
6. Klik **Create bucket**

### Step 2: Set Bucket Policies (PENTING!)
Agar user bisa upload foto, tambahkan policy:

1. Klik bucket `profile-photos`
2. Klik tab **Policies**
3. Klik **New Policy**

#### Policy 1: Upload Files (INSERT)
```sql
-- Policy Name: Allow authenticated users to upload
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-photos');
```

#### Policy 2: Read Files (SELECT)
```sql
-- Policy Name: Allow public to read
CREATE POLICY "Allow public to read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-photos');
```

#### Policy 3: Update Files (UPDATE)
```sql
-- Policy Name: Allow users to update their own files
CREATE POLICY "Allow users to update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-photos')
WITH CHECK (bucket_id = 'profile-photos');
```

#### Policy 4: Delete Files (DELETE)
```sql
-- Policy Name: Allow users to delete their own files
CREATE POLICY "Allow users to delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profile-photos');
```

### Step 3: Verify Configuration
Pastikan file `.env` sudah benar:
```env
VITE_SUPABASE_URL=https://vhmggapaspvvtglkijyq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## How It Works

### Upload Flow
```
1. User memilih foto → File disimpan temporary (preview)
2. User klik "Simpan Perubahan"
3. Foto diupload ke Supabase Storage bucket 'profile-photos'
4. Supabase return public URL: https://.../profile-photos/timestamp_random.jpg
5. URL dikirim ke backend API PUT /api/auth/profile
6. Backend simpan URL ke kolom profile_photo_url di database
7. Backend return updated user data
8. Frontend update localStorage dan state
9. Navbar dan Profile page langsung menampilkan foto baru
```

### File Naming Convention
```javascript
// Format: timestamp_randomString.extension
// Example: 1733123456789_abc7d9e.jpg

const timestamp = Date.now();
const randomString = Math.random().toString(36).substring(2, 9);
const fileName = `${timestamp}_${randomString}.${fileExt}`;
```

## Testing

### 1. Test Upload
1. Login sebagai user
2. Buka halaman Profile (`/profile`)
3. Klik **Edit Profil**
4. Klik foto profil atau "Ubah Foto Profil"
5. Pilih file gambar (JPG/PNG/WebP, max 5MB)
6. Preview akan muncul
7. Klik **Simpan Perubahan**
8. Tunggu sampai muncul "Profil berhasil diperbarui!"
9. Foto baru akan muncul di Profile dan Navbar

### 2. Test Validation
- Upload file bukan gambar → Harus muncul error
- Upload file > 5MB → Harus muncul error
- Upload tanpa internet → Harus muncul error handling

### 3. Verify Database
```sql
SELECT user_id, name, email, profile_photo_url 
FROM users 
WHERE user_id = 1;
```

### 4. Verify Supabase Storage
1. Buka Supabase Dashboard → Storage → profile-photos
2. File baru harus terlihat dengan nama format timestamp_random.jpg
3. Klik file → Copy URL → Paste di browser → Foto harus tampil

## Troubleshooting

### Error: "Supabase belum dikonfigurasi"
**Solusi**: Pastikan `.env` sudah benar dan restart dev server
```bash
npm run dev
```

### Error: "new row violates row-level security policy"
**Solusi**: Pastikan RLS policies sudah dibuat di Supabase Storage

### Error: "Failed to upload image"
**Solusi**: 
1. Cek bucket `profile-photos` sudah ada
2. Cek bucket public = true
3. Cek policies sudah benar

### Foto tidak muncul di Navbar
**Solusi**: 
1. Clear localStorage: `localStorage.clear()`
2. Login ulang
3. Cek console browser untuk error

### Foto lama masih muncul
**Solusi**: Hard refresh browser `Ctrl+Shift+R` atau clear cache

## File Structure
```
src/
  pages/
    Profile.jsx           # ✅ Upload & display foto profil
  components/
    Navbar.jsx           # ✅ Display avatar dari database
  utils/
    imageUpload.js       # ✅ Helper upload ke Supabase
    supabase.js          # ✅ Supabase client config
  
api/
  controllers/
    authController.js    # ✅ Handle update profile_photo_url
  services/
    authService.js       # ✅ Save profile_photo_url ke DB
```

## Environment Variables
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://vhmggapaspvvtglkijyq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Features

### ✅ Implemented
- Upload foto ke Supabase Storage
- Save URL ke database PostgreSQL
- Preview foto sebelum save
- Loading state saat upload
- File validation (type & size)
- Display foto di Profile page
- Display foto di Navbar
- Fallback ke avatar default
- Error handling

### 🚀 Future Enhancements
- Crop foto sebelum upload
- Delete foto lama saat upload baru
- Compress image untuk optimize size
- Multiple foto (gallery)
- Upload via drag & drop

## Support
Jika ada masalah, cek:
1. Browser console (F12)
2. Network tab untuk error upload
3. Supabase Dashboard → Storage → Logs

---

**Last Updated**: December 5, 2025
**Status**: ✅ Ready to Use
