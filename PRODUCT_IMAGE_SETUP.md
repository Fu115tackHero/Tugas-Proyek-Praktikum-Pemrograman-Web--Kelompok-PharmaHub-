# Product Image Management - Documentation

## 📸 Image Storage Strategy

### Database Structure

- **Table:** `products`
- **Column:** `main_image_url` (VARCHAR(500))
- **Purpose:** Menyimpan URL/path gambar produk (BUKAN binary data)

### Supported Image Sources

#### 1. Local Path (Development)

```
Format: /images/allproducts/[filename].jpg
Example: /images/allproducts/paracetamol-500mg.jpg
```

#### 2. Supabase Storage (Production)

```
Format: https://[supabase-url]/storage/v1/object/public/product-images/[filename].jpg
Example: https://vhmggapaspvvtglkijyq.supabase.co/storage/v1/object/public/product-images/1732958123_abc123.jpg
```

## 🔧 Admin Workflow untuk Menambah Produk dengan Gambar

### Step 1: Admin Upload Gambar

1. Admin mengisi form produk di dashboard
2. Admin memilih file gambar (jpg, png, webp)
3. Frontend upload gambar ke Supabase Storage
4. Supabase mengembalikan public URL

### Step 2: Simpan URL ke Database

```javascript
// Frontend code example
const imageUrl = await uploadToSupabase(imageFile);

const productData = {
  name: "Obat Baru",
  price: 50000,
  main_image_url: imageUrl, // Supabase URL
  // ... other fields
};

await createProduct(productData);
```

### Step 3: Database Menyimpan URL

```sql
INSERT INTO products (
  name, price, main_image_url, ...
)
VALUES (
  'Obat Baru', 50000.00,
  'https://vhmggapaspvvtglkijyq.supabase.co/storage/v1/object/public/product-images/123.jpg',
  ...
);
```

## 📊 Current Product Data Status

### ✅ All 10 Products Setup Complete

- ✅ `main_image_url` column exists (VARCHAR 500)
- ✅ All products have image URLs
- ✅ All products have complete details
- ✅ Product details include:
  - `generic_name`
  - `uses`
  - `how_it_works`
  - `ingredients` (ARRAY)
  - `precaution` (ARRAY)
  - `side_effects` (ARRAY)
  - `interactions` (ARRAY)
  - `indication` (ARRAY)

## 🚀 Migration Scripts Available

### 1. `uploadImagesToSupabase.js`

**Purpose:** Upload gambar lokal ke Supabase dan update database

```bash
node api/scripts/uploadImagesToSupabase.js
```

**What it does:**

- Membaca semua produk dengan path lokal (`/images/...`)
- Upload file gambar ke Supabase Storage
- Update `main_image_url` dengan Supabase URL

### 2. `checkImages.js`

**Purpose:** Verifikasi status image URL semua produk

```bash
node api/scripts/checkImages.js
```

### 3. `seedProducts.js`

**Purpose:** Populate produk dengan data awal

```bash
node api/scripts/seedProducts.js
```

### 4. `simpleUpdateDetails.js`

**Purpose:** Update product details untuk 10 produk

```bash
node api/scripts/simpleUpdateDetails.js
```

## 🔐 Supabase Configuration

### Required Environment Variables

```env
VITE_SUPABASE_URL=https://vhmggapaspvvtglkijyq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Bucket Setup

- **Bucket Name:** `product-images`
- **Access:** Public
- **Allowed Types:** image/jpeg, image/png, image/webp

## 📝 API Response Example

### GET /api/products/1

```json
{
  "success": true,
  "data": {
    "product_id": 1,
    "name": "Paracetamol 500mg",
    "main_image_url": "/images/allproducts/paracetamol-500mg.jpg",
    "generic_name": "Paracetamol",
    "uses": "Menurunkan demam, meredakan nyeri...",
    "ingredients": ["Paracetamol 500 mg", "..."],
    "side_effects": ["Jarang terjadi efek samping..."],
    "precaution": ["Jangan melebihi dosis..."],
    "interactions": ["Warfarin: dapat meningkatkan..."],
    "indication": ["Demam pada anak dan dewasa", "..."]
  }
}
```

## ⚠️ Important Notes

1. **JANGAN** simpan binary image data (BYTEA) di database
2. **SELALU** simpan URL/path saja
3. Local path untuk development: `/images/allproducts/...`
4. Production URL dari Supabase: `https://...supabase.co/storage/...`
5. Frontend handle image upload ke Supabase
6. Backend hanya menerima dan menyimpan URL string

## 🎯 Frontend Upload Implementation

```javascript
// utils/imageUpload.js
import { supabase } from "./supabase";

export async function uploadProductImage(file) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}_${Math.random()
    .toString(36)
    .substring(7)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from("product-images")
    .upload(fileName, file);

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from("product-images").getPublicUrl(fileName);

  return publicUrl;
}
```

## ✅ Database Setup Complete!

- Database: `pharmahub_db`
- Products: 10 items
- All have image URLs
- All have complete details
- Ready for production use
