# Backend Refactoring Guide - Database Normalization

## 📋 Overview
Backend telah direfactor untuk mendukung struktur database yang sudah dinormalisasi (1NF-3NF). Perubahan ini mempengaruhi cara penyimpanan dan pengambilan data produk dan user.

---

## 🔄 Perubahan Utama Database

### 1. **Tabel `product_details` - Normalisasi Array Fields**

#### ❌ Sebelum (Array Columns):
```sql
CREATE TABLE product_details (
    detail_id SERIAL PRIMARY KEY,
    product_id INTEGER,
    ingredients TEXT[],      -- Array
    side_effects TEXT[],     -- Array
    precaution TEXT[],       -- Array
    interactions TEXT[],     -- Array
    indication TEXT[],       -- Array
    important_info TEXT[]    -- Array
);
```

#### ✅ Sesudah (Normalized Tables):
```sql
-- Main table (scalar fields only)
CREATE TABLE product_details (
    detail_id SERIAL PRIMARY KEY,
    product_id INTEGER,
    generic_name VARCHAR(255),
    uses TEXT,
    how_it_works TEXT
);

-- Separate child tables for arrays
CREATE TABLE product_ingredients (
    ingredient_id SERIAL PRIMARY KEY,
    detail_id INTEGER REFERENCES product_details(detail_id),
    ingredient TEXT,
    display_order INTEGER
);

CREATE TABLE product_side_effects (
    side_effect_id SERIAL PRIMARY KEY,
    detail_id INTEGER REFERENCES product_details(detail_id),
    side_effect_text TEXT,
    display_order INTEGER
);
-- ... and so on for other arrays
```

### 2. **Tabel `users` - Hapus Kolom `address`**

#### ❌ Sebelum:
```sql
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    address TEXT,  -- ❌ Redundant
    ...
);
```

#### ✅ Sesudah:
```sql
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    -- address column REMOVED
    ...
);

-- Use existing table
CREATE TABLE user_addresses (
    address_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    full_address TEXT,
    is_default BOOLEAN DEFAULT FALSE,  -- NEW COLUMN
    ...
);
```

### 3. **Tabel `products` - Hapus Kolom `main_image_url`**

#### ❌ Sebelum:
```sql
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    main_image_url VARCHAR(500),  -- ❌ Redundant
    ...
);
```

#### ✅ Sesudah:
```sql
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    -- main_image_url REMOVED
    ...
);

-- Use existing table with is_primary flag
CREATE TABLE product_images (
    image_id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(product_id),
    image_url VARCHAR(500),
    is_primary BOOLEAN DEFAULT FALSE,
    image_order INTEGER
);
```

---

## 🛠️ Refactoring Backend Services

### **File: `api/services/productService.js`**

#### ✅ Helper Functions Added:

```javascript
// Insert detail arrays into normalized tables
async function insertDetailArrays(client, detail_id, arrays) {
  const { ingredients, important_info, side_effects, precaution, interactions, indication } = arrays;
  
  // Loop through each array and insert into respective tables
  if (Array.isArray(ingredients) && ingredients.length > 0) {
    for (let i = 0; i < ingredients.length; i++) {
      await client.query(
        `INSERT INTO product_ingredients (detail_id, ingredient, display_order) VALUES ($1, $2, $3)`,
        [detail_id, ingredients[i], i]
      );
    }
  }
  // ... similar for other arrays
}

// Fetch arrays from normalized tables
async function fetchDetailArrays(client, detail_id) {
  const ingredients = await client.query(
    `SELECT ingredient FROM product_ingredients WHERE detail_id = $1 ORDER BY display_order`,
    [detail_id]
  );
  // ... fetch other arrays
  
  return {
    ingredients: ingredients.rows.map(r => r.ingredient),
    // ... other arrays
  };
}

// Delete all detail arrays
async function deleteDetailArrays(client, detail_id) {
  await client.query(`DELETE FROM product_ingredients WHERE detail_id = $1`, [detail_id]);
  // ... delete from other tables
}
```

#### ✅ CREATE Product - Updated:

```javascript
async function createProduct(data) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Insert product (WITHOUT main_image_url)
    const insertProductQuery = `
      INSERT INTO products (name, brand, price, stock, description, category_id, prescription_required, min_stock)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING product_id, ...;
    `;
    const productResult = await client.query(insertProductQuery, productValues);
    const product = productResult.rows[0];

    // 2. Insert main image to product_images table
    if (main_image_url) {
      await client.query(
        `INSERT INTO product_images (product_id, image_url, is_primary, image_order) 
         VALUES ($1, $2, $3, $4)`,
        [product.product_id, main_image_url, true, 0]
      );
    }

    // 3. Insert product_details (scalar fields only)
    const insertDetailsQuery = `
      INSERT INTO product_details (product_id, generic_name, uses, how_it_works)
      VALUES ($1, $2, $3, $4)
      RETURNING detail_id;
    `;
    const detailResult = await client.query(insertDetailsQuery, [...]);
    const detail_id = detailResult.rows[0].detail_id;

    // 4. Insert arrays into child tables
    await insertDetailArrays(client, detail_id, {
      ingredients, important_info, side_effects, 
      precaution, interactions, indication
    });

    await client.query("COMMIT");
    return product;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
```

#### ✅ GET Products - Updated:

```javascript
async function getAllProducts() {
  const client = await pool.connect();
  try {
    const query = `
      SELECT 
        p.*,
        c.category_name,
        pd.detail_id, pd.generic_name, pd.uses, pd.how_it_works,
        pi.image_url as main_image_url  -- Get from product_images
      FROM products p
      LEFT JOIN product_categories c ON p.category_id = c.category_id
      LEFT JOIN product_details pd ON p.product_id = pd.product_id
      LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_primary = true
      WHERE p.is_active = true
      ORDER BY p.created_at DESC
    `;
    const { rows } = await client.query(query);

    // Fetch detail arrays for each product
    const productsWithDetails = await Promise.all(
      rows.map(async (row) => {
        let detailArrays = {};
        if (row.detail_id) {
          detailArrays = await fetchDetailArrays(client, row.detail_id);
        }

        return {
          ...row,
          id: row.product_id,
          image: row.main_image_url,
          // Reconstruct arrays for frontend
          ingredients: detailArrays.ingredients || [],
          side_effects: detailArrays.side_effects || [],
          // ... other arrays
        };
      })
    );

    return productsWithDetails;
  } finally {
    client.release();
  }
}
```

#### ✅ UPDATE Product - Updated:

```javascript
async function updateProduct(id, data) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Update products table (WITHOUT main_image_url)
    const updateQuery = `
      UPDATE products
      SET name = COALESCE($1, name), ...
      WHERE product_id = $11
      RETURNING *;
    `;
    await client.query(updateQuery, values);

    // 2. Update main image in product_images table
    if (main_image_url !== undefined) {
      const checkImageQuery = `SELECT image_id FROM product_images 
                               WHERE product_id = $1 AND is_primary = true`;
      const imageCheck = await client.query(checkImageQuery, [id]);

      if (imageCheck.rows.length > 0) {
        // Update existing
        await client.query(
          `UPDATE product_images SET image_url = $1 
           WHERE product_id = $2 AND is_primary = true`,
          [main_image_url, id]
        );
      } else {
        // Insert new
        await client.query(
          `INSERT INTO product_images (product_id, image_url, is_primary, image_order) 
           VALUES ($1, $2, $3, $4)`,
          [id, main_image_url, true, 0]
        );
      }
    }

    // 3. Update product_details (scalar fields)
    await client.query(`UPDATE product_details SET ...`);

    // 4. Delete old arrays and insert new ones
    if (arrays provided) {
      await deleteDetailArrays(client, detail_id);
      await insertDetailArrays(client, detail_id, { ... });
    }

    await client.query("COMMIT");
    return updatedProduct;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
```

---

### **File: `api/services/authService.js`**

#### ✅ REGISTER User - Updated:

```javascript
async function registerUser(userData) {
  const { name, email, password, phone, address } = userData;
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");

    // 1. Insert user (WITHOUT address column)
    const insertQuery = `
      INSERT INTO users (name, email, password_hash, phone, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING user_id, name, email, phone, role, created_at;
    `;
    const result = await client.query(insertQuery, values);
    const user = result.rows[0];

    // 2. Insert address to user_addresses table if provided
    if (address && address.trim() !== "") {
      await client.query(
        `INSERT INTO user_addresses (user_id, full_address, is_default) 
         VALUES ($1, $2, $3)`,
        [user.user_id, address, true]
      );
    }

    await client.query("COMMIT");
    
    // Generate JWT and return
    const token = jwt.sign({ ... }, JWT_SECRET, { ... });
    return { success: true, user, token };
    
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
```

#### ✅ LOGIN User - Updated:

```javascript
async function loginUser(credentials) {
  const { email, password } = credentials;

  // JOIN with user_addresses to get default address
  const query = `
    SELECT 
      u.user_id, u.name, u.email, u.password_hash, 
      u.phone, u.role, u.created_at,
      ua.full_address as address
    FROM users u
    LEFT JOIN user_addresses ua ON u.user_id = ua.user_id AND ua.is_default = true
    WHERE u.email = $1;
  `;

  const result = await pool.query(query, [email.toLowerCase()]);
  // ... verify password and return
}
```

#### ✅ GET User Profile - Updated:

```javascript
async function getUserById(userId) {
  const query = `
    SELECT 
      u.user_id, u.name, u.email, u.phone, 
      u.role, u.profile_photo_url, u.created_at,
      ua.full_address as address
    FROM users u
    LEFT JOIN user_addresses ua ON u.user_id = ua.user_id AND ua.is_default = true
    WHERE u.user_id = $1;
  `;
  
  const result = await pool.query(query, [userId]);
  return result.rows[0];
}
```

#### ✅ UPDATE User Profile - Updated:

```javascript
async function updateProfile(userId, userData) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Update users table (excluding address)
    if (name || phone || profile_photo_url) {
      const query = `UPDATE users SET ... WHERE user_id = $n`;
      await client.query(query, values);
    }

    // 2. Update or insert address in user_addresses
    if (userData.address !== undefined) {
      const checkAddressQuery = `
        SELECT address_id FROM user_addresses 
        WHERE user_id = $1 AND is_default = true
      `;
      const addressCheck = await client.query(checkAddressQuery, [userId]);

      if (addressCheck.rows.length > 0) {
        // Update existing
        await client.query(
          `UPDATE user_addresses SET full_address = $1 
           WHERE user_id = $2 AND is_default = true`,
          [userData.address, userId]
        );
      } else {
        // Insert new
        await client.query(
          `INSERT INTO user_addresses (user_id, full_address, is_default) 
           VALUES ($1, $2, $3)`,
          [userId, userData.address, true]
        );
      }
    }

    await client.query("COMMIT");
    return updatedUser;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
```

---

## 🧪 Testing Checklist

### ✅ Product Operations:
- [ ] Create product dengan array details (ingredients, side_effects, dll)
- [ ] Get all products - memastikan arrays ter-reconstruct dengan benar
- [ ] Get single product - detail lengkap dengan arrays
- [ ] Update product - arrays di-delete dan di-insert ulang
- [ ] Delete product - cascade delete ke child tables
- [ ] Product image - main_image_url diambil dari product_images

### ✅ User Operations:
- [ ] Register user dengan address - address tersimpan di user_addresses
- [ ] Login user - address dari user_addresses muncul di response
- [ ] Get user profile - join dengan user_addresses
- [ ] Update profile dengan address baru
- [ ] Update profile tanpa address

---

## 🔍 Query Examples

### Get Product with All Details:
```javascript
const product = await getProductById(1);
console.log(product);
// Output:
{
  product_id: 1,
  name: "Paracetamol 500mg",
  image: "https://...",  // from product_images
  ingredients: ["Paracetamol 500mg", "..."],  // from product_ingredients
  side_effects: ["Mual", "Pusing"],  // from product_side_effects
  // ... other arrays reconstructed
}
```

### Get User with Address:
```javascript
const user = await getUserById(1);
console.log(user);
// Output:
{
  user_id: 1,
  name: "John Doe",
  email: "john@example.com",
  address: "Jl. Merdeka No. 1",  // from user_addresses where is_default = true
  // ...
}
```

---

## 📝 Migration Steps

1. **Backup Database:**
   ```bash
   pg_dump -U postgres -d pharmahub_db > backup_before_normalize.sql
   ```

2. **Run Normalization Migration:**
   ```bash
   psql -U postgres -d pharmahub_db -f database/migration_normalize_database.sql
   ```

3. **Test Backend APIs:**
   ```bash
   cd api
   npm start
   ```

4. **Verify Data:**
   - Check products can be created/updated
   - Check users can register/login
   - Verify arrays are properly stored and retrieved

---

## ⚠️ Breaking Changes

1. **Frontend API Response Format UNCHANGED:**
   - Backend masih mengembalikan format yang sama (arrays di-reconstruct)
   - Frontend tidak perlu diubah

2. **Database Direct Queries:**
   - Jangan query `products.main_image_url` lagi
   - Jangan query `users.address` lagi
   - Jangan query array columns di `product_details` lagi

3. **Admin Scripts:**
   - Update semua script yang langsung query database
   - Gunakan JOINs untuk mendapatkan data lengkap

---

## 📚 References

- Database Schema: `database/schema.sql`
- Migration Script: `database/migration_normalize_database.sql`
- Product Service: `api/services/productService.js`
- Auth Service: `api/services/authService.js`

---

**Last Updated:** December 4, 2025  
**Author:** Senior Backend Engineer
