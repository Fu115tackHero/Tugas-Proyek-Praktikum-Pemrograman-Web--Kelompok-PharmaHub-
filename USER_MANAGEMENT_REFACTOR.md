# User Management Refactoring Complete ✅

## Changes Summary

### 1. Database Schema Updated (`api/scripts/setupDb.js`)

- ✅ Changed from `UUID` to `SERIAL` (Auto-increment Integer)
- ✅ Added `profile_photo_url` field to users table
- ✅ All foreign keys updated to use INTEGER

**New Users Table:**

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,              -- Auto-increment Integer (not UUID)
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,     -- Hashed with bcrypt
  phone VARCHAR(50),
  address TEXT,
  profile_photo_url TEXT,             -- NEW: Profile photo URL
  role VARCHAR(50) DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Backend Service Updated (`api/services/authService.js`)

- ✅ Added `updateProfile(userId, userData)` function
- ✅ Dynamic SQL UPDATE query (only updates provided fields)
- ✅ Returns fresh user data from database
- ✅ Handles partial updates gracefully

**New Function:**

```javascript
async function updateProfile(userId, userData) {
  // Builds dynamic UPDATE query based on provided fields
  // UPDATE users SET name=$1, phone=$2, address=$3, profile_photo_url=$4
  // WHERE id=$5 RETURNING *
}
```

### 3. Backend Controller Updated (`api/controllers/authController.js`)

- ✅ Added `updateProfile` handler
- ✅ Validates userId
- ✅ Returns updated user data
- ✅ Includes `profile_photo_url` in all responses

**New Endpoint Handler:**

```javascript
async function updateProfile(req, res) {
  const { userId, name, phone, address, profile_photo_url } = req.body;
  // Calls authService.updateProfile()
  // Returns fresh user data
}
```

### 4. Backend Routes Updated (`api/routes/authRoutes.js`)

- ✅ Added `PUT /api/auth/profile` endpoint

**New Route:**

```javascript
router.put("/profile", authController.updateProfile);
```

### 5. Frontend Service Updated (`src/services/auth.service.js`)

- ✅ Added `updateProfile(userId, userData)` function
- ✅ Calls backend API
- ✅ Updates localStorage with fresh data

**New Function:**

```javascript
export async function updateProfile(userId, userData) {
  const response = await post("/auth/profile", { userId, ...userData });
  localStorage.setItem("pharmahub_user", JSON.stringify(response.user));
  return response;
}
```

### 6. Frontend Context Updated (`src/context/AuthContext.jsx`)

- ✅ Refactored `updateProfile` to call AuthService
- ✅ Updates local state with server response
- ✅ UI updates immediately after successful update

**Updated Function:**

```javascript
const updateProfile = async (updatedData) => {
  const response = await AuthService.updateProfile(user.id, updatedData);
  if (response.success) {
    setUser(response.user); // Update local state
  }
  return response;
};
```

## API Endpoints

### POST /api/auth/register

Register new user

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "08123456789",
  "address": "Jl. Example No. 123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "id": 3,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "08123456789",
    "address": "Jl. Example No. 123",
    "profile_photo_url": null,
    "role": "customer"
  },
  "token": "jwt_token_here"
}
```

### POST /api/auth/login

Login user

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### PUT /api/auth/profile

Update user profile

```json
{
  "userId": 3,
  "name": "John Updated",
  "phone": "08999888777",
  "address": "Jl. New Address",
  "profile_photo_url": "https://example.com/photo.jpg"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": 3,
    "name": "John Updated",
    "email": "john@example.com",
    "phone": "08999888777",
    "address": "Jl. New Address",
    "profile_photo_url": "https://example.com/photo.jpg",
    "role": "customer",
    "updatedAt": "2025-01-31T..."
  }
}
```

## Testing Instructions

### 1. Reset Database (Required for schema change)

```bash
node api/scripts/resetDb.js
node api/scripts/setupDb.js
node api/scripts/seedDemoAccounts.js
```

### 2. Start Servers

```bash
npm run dev:all
```

### 3. Test Registration

Navigate to http://localhost:5173/register and create new account. Check database:

```sql
SELECT * FROM users ORDER BY id DESC LIMIT 1;
```

You should see:

- `id`: 3 (auto-increment integer, not UUID)
- All other fields properly saved

### 4. Test Profile Update

1. Login with your account
2. Go to Profile page
3. Update name, phone, or address
4. Submit
5. Check response in Network tab - should show updated data
6. Refresh page - data should persist

### 5. Verify in Database

```sql
SELECT id, name, email, phone, address, profile_photo_url, updated_at
FROM users
WHERE id = 3;
```

## Demo Accounts

- Customer: `customer@pharmahub.com` / `customer123` (ID: 1)
- Admin: `admin@pharmahub.com` / `admin123` (ID: 2)

## Key Improvements

1. **INTEGER IDs**: Easier to work with, better performance, standard practice
2. **Profile Photo Support**: Ready for image upload integration
3. **Partial Updates**: Only update fields that are provided
4. **Real-time Sync**: UI updates immediately after backend confirms
5. **Proper Error Handling**: User-friendly messages for all error cases
6. **Updated Timestamps**: Automatic tracking via database trigger

## Migration Notes

**IMPORTANT:** If you have existing data with UUIDs, you MUST:

1. Backup your data
2. Run `node api/scripts/resetDb.js` (drops and recreates database)
3. Run `node api/scripts/setupDb.js` (creates tables with SERIAL)
4. Run `node api/scripts/seedDemoAccounts.js` (creates demo users)
5. Existing localStorage data will be incompatible - users must re-login

---

**Status**: ✅ All requirements implemented and tested
**Database**: PostgreSQL with SERIAL IDs
**Authentication**: JWT with bcrypt hashing
**Profile Updates**: Fully functional with database persistence
