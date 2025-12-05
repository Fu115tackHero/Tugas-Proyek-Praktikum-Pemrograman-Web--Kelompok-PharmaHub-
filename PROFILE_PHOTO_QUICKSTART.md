# 🚀 Quick Start: Profile Photo Upload

## ⚠️ PENTING: Bucket Belum Ada!

Cek dulu apakah bucket sudah dibuat. Jika belum, lihat file **SUPABASE_BUCKET_URGENT_SETUP.md** terlebih dahulu!

## Setup dalam 3 Langkah

### Langkah 1: Buat Bucket di Supabase (2 menit)

1. Buka https://supabase.com/dashboard
2. Pilih project: `vhmggapaspvvtglkijyq`
3. Klik **Storage** → **New bucket**
4. Isi:
   - Name: `product-images` (untuk sementara, foto profil & produk jadi satu bucket)
   - ✅ Centang **Public bucket** (WAJIB!)
5. Klik **Create**

> **Note**: Kode saat ini menggunakan bucket `product-images` untuk foto profil juga. Nanti bisa dipisah ke `profile-photos` kalau perlu.

### Langkah 2: Set Policies (3 menit)

Di bucket `product-images`, klik tab **Policies**, lalu klik **New Policy** dan tambahkan:

**Policy 1 - Public Read:**
```sql
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');
```

**Policy 2 - Upload:**
```sql
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');
```

**Policy 3 - Update:**
```sql
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');
```

**Policy 4 - Delete:**
```sql
CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');
```

### Langkah 3: Test (1 menit)

1. Restart dev server:
   ```bash
   npm run dev
   ```

2. Login ke aplikasi
3. Buka **Profile** (`/profile`)
4. Klik **Edit Profil**
5. Upload foto profil
6. Klik **Simpan**

## ✅ Done!

Foto profil sekarang:
- ✅ Tersimpan di Supabase Storage
- ✅ URL tersimpan di database
- ✅ Tampil di Profile dan Navbar

## Troubleshooting

**"Supabase belum dikonfigurasi"**
→ Cek file `.env`:
```env
VITE_SUPABASE_URL=https://vhmggapaspvvtglkijyq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**"Upload failed: 403"**
→ Policies belum benar, ulangi Langkah 2

**Foto tidak muncul**
→ Hard refresh browser (`Ctrl+Shift+R`)

---

Lihat `PROFILE_PHOTO_SETUP.md` untuk dokumentasi lengkap.
