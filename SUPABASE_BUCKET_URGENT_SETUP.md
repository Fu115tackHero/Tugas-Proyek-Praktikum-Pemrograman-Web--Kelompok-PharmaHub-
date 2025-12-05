# 🚨 URGENT: Setup Supabase Buckets

## Problem
Bucket Supabase belum dibuat! Hasil pengecekan menunjukkan **0 bucket** tersedia.

## ✅ Solusi Cepat (5 Menit)

### Buat Bucket `product-images` (Untuk Produk & Profile Sementara)

1. **Login ke Supabase Dashboard**
   - URL: https://supabase.com/dashboard
   - Project: `vhmggapaspvvtglkijyq`

2. **Buat Bucket Baru**
   - Klik **Storage** di sidebar kiri
   - Klik tombol **New bucket**
   - Isi form:
     - **Name**: `product-images`
     - **Public bucket**: ✅ **CENTANG INI!** (Sangat penting!)
     - **File size limit**: 5MB (5242880 bytes)
     - **Allowed MIME types**: `image/jpeg,image/jpg,image/png,image/webp`
   - Klik **Create bucket**

3. **Set Policies (WAJIB!)**
   
   Klik bucket `product-images` → Tab **Policies** → **New Policy**

   **Policy 1 - Public Read (Semua orang bisa lihat)**
   ```sql
   CREATE POLICY "Public Read Access"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'product-images');
   ```

   **Policy 2 - Authenticated Upload (User login bisa upload)**
   ```sql
   CREATE POLICY "Authenticated Upload"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'product-images');
   ```

   **Policy 3 - Authenticated Update**
   ```sql
   CREATE POLICY "Authenticated Update"
   ON storage.objects FOR UPDATE
   TO authenticated
   USING (bucket_id = 'product-images')
   WITH CHECK (bucket_id = 'product-images');
   ```

   **Policy 4 - Authenticated Delete**
   ```sql
   CREATE POLICY "Authenticated Delete"
   ON storage.objects FOR DELETE
   TO authenticated
   USING (bucket_id = 'product-images');
   ```

4. **Verify**
   - Coba buka URL ini di browser:
   ```
   https://vhmggapaspvvtglkijyq.supabase.co/storage/v1/object/public/product-images/test.jpg
   ```
   - Harusnya return 404 (file tidak ada) bukan 400 (bucket tidak ada)

5. **Restart Dev Server**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

6. **Test Upload**
   - Login ke aplikasi
   - Buka Profile → Edit Profil
   - Upload foto
   - Harusnya berhasil sekarang!

## Penjelasan

- **Bucket belum dibuat**: API return `[]` (empty array)
- **Solusi sementara**: Foto profil disimpan di bucket `product-images` (sama dengan foto produk)
- **Nanti bisa dipisah**: Kalau mau, bisa buat bucket `profile-photos` terpisah

## Kenapa Ini Terjadi?

Bucket Supabase harus dibuat manual melalui Dashboard. Tidak otomatis dibuat dari kode. Setup awal belum pernah dilakukan.

## Status Saat Ini

✅ **Kode sudah siap** - Profile.jsx, Navbar.jsx, imageUpload.js  
❌ **Bucket belum ada** - Harus dibuat manual di Supabase Dashboard  
✅ **Database sudah support** - Kolom `profile_photo_url` sudah ada  

## Next Steps

1. ✅ Buat bucket `product-images` di Supabase (5 menit)
2. ✅ Set policies (3 menit)
3. ✅ Test upload foto profil
4. 🎯 DONE!

---

**UPDATE**: Kode sudah diubah untuk menggunakan bucket `product-images` sementara.
