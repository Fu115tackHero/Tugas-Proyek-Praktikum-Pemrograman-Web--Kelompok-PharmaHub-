# ✅ Profile Photo Persist Fix - Complete

## Problem
Foto profil berhasil diupload ke Supabase dan tersimpan di database, tetapi **hilang setelah logout dan login kembali**.

## Root Cause
Backend API **tidak mengembalikan field `profile_photo_url`** saat login dan register:

### ❌ Before (Missing profile_photo_url)
```sql
SELECT 
  u.user_id AS id, 
  u.name, 
  u.email, 
  u.phone, 
  u.role, 
  -- profile_photo_url MISSING! ❌
  u.created_at AS "createdAt"
FROM users u
```

## Solution Applied ✅

### 1. Fixed Login Query
**File**: `api/services/authService.js` - Function `loginUser()`

```sql
SELECT 
  u.user_id AS id, 
  u.name, 
  u.email, 
  u.password_hash, 
  u.phone, 
  u.role, 
  u.profile_photo_url,  -- ✅ ADDED!
  u.created_at AS "createdAt",
  ua.full_address AS address
FROM users u
LEFT JOIN user_addresses ua ON u.user_id = ua.user_id AND ua.is_default = true
WHERE u.email = $1
```

### 2. Fixed Register Query
**File**: `api/services/authService.js` - Function `registerUser()`

```sql
INSERT INTO users (name, email, password_hash, phone, role)
VALUES ($1, $2, $3, $4, $5)
RETURNING 
  user_id AS id, 
  name, 
  email, 
  phone, 
  role,
  profile_photo_url,  -- ✅ ADDED!
  created_at AS "createdAt";
```

## How It Works Now

### Login Flow ✅
```
1. User login dengan email + password
2. Backend query users table
3. Return user data INCLUDING profile_photo_url
4. Frontend save ke localStorage: 
   {
     id: 1,
     name: "John Doe",
     email: "john@example.com",
     profile_photo_url: "https://.../product-images/123.jpg"  ✅
   }
5. Navbar & Profile display foto dari profile_photo_url ✅
```

### Logout → Login Flow ✅
```
1. User logout → localStorage cleared
2. User login lagi
3. Backend return profile_photo_url dari database ✅
4. Frontend load foto dari Supabase URL ✅
5. Foto tetap tampil! ✅
```

## Testing

### Test 1: Upload & Logout/Login
1. Login ke aplikasi
2. Buka Profile → Edit Profil
3. Upload foto profil baru
4. Klik Simpan (foto tersimpan ke Supabase & database)
5. **Logout**
6. **Login kembali**
7. ✅ **Foto harus tetap tampil di Navbar dan Profile**

### Test 2: Verify localStorage
Open browser console (F12):
```javascript
// After login, check localStorage
const user = JSON.parse(localStorage.getItem('pharmahub_user'));
console.log(user);

// Should contain:
{
  id: 1,
  name: "...",
  email: "...",
  profile_photo_url: "https://vhmggapaspvvtglkijyq.supabase.co/storage/v1/object/public/product-images/..." ✅
}
```

### Test 3: Check Database
```sql
SELECT user_id, name, email, profile_photo_url 
FROM users 
WHERE user_id = 1;
```

Should return:
```
user_id | name     | email              | profile_photo_url
--------|----------|--------------------|-----------------
1       | John Doe | john@example.com   | https://vhmg...product-images/123.jpg
```

## Files Modified

1. ✅ `api/services/authService.js`
   - Added `profile_photo_url` to login query
   - Added `profile_photo_url` to register query

2. ✅ `src/pages/Profile.jsx` (previous fix)
   - Upload foto ke Supabase bucket `product-images`
   - Save URL ke database via API

3. ✅ `src/components/Navbar.jsx` (previous fix)
   - Display `user.profile_photo_url` dari database

## Before vs After

### Before ❌
- Upload foto → OK ✅
- Simpan ke DB → OK ✅
- Tampil sebelum logout → OK ✅
- **Logout → Login → Foto hilang ❌**

### After ✅
- Upload foto → OK ✅
- Simpan ke DB → OK ✅
- Tampil sebelum logout → OK ✅
- **Logout → Login → Foto tetap ada ✅**

## Related Files
- `PROFILE_PHOTO_SETUP.md` - Full documentation
- `PROFILE_PHOTO_QUICKSTART.md` - Quick setup guide
- `SUPABASE_BUCKET_URGENT_SETUP.md` - Bucket setup

## Status
✅ **FIXED & DEPLOYED**

Server sudah di-restart dengan perubahan terbaru. Silakan test:
1. Upload foto profil
2. Logout
3. Login kembali
4. Foto harus tetap tampil!

---

**Fixed**: December 5, 2025  
**Issue**: Profile photo not persisting after logout/login  
**Solution**: Added `profile_photo_url` to login & register queries
