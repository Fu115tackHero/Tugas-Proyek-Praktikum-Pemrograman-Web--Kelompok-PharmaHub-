# Database Setup Guide

## Prerequisites

1. **PostgreSQL installed** on your local machine

   - Download: https://www.postgresql.org/download/
   - Default port: 5432

2. **Node.js dependencies**
   ```bash
   cd api
   npm install bcrypt jsonwebtoken pg
   ```

## Quick Start

### Step 1: Configure Environment Variables

Your `.env` file should have these database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pharmahub_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password
JWT_SECRET=pharmahub_dev_secret_2024
```

✅ **Already configured in your .env file!**

### Step 2: Run Database Setup Script

```bash
# From project root
node api/scripts/setupDb.js
```

This will:

1. ✅ Connect to PostgreSQL default database
2. ✅ Check if `pharmahub_db` exists, create if not
3. ✅ Create all required tables (users, products, orders, etc.)
4. ✅ Create indexes for performance
5. ✅ Create triggers for automatic timestamp updates

### Step 3: Verify Setup

Expected output:

```
🚀 PharmaHub Database Setup
==================================================
📍 Host: localhost:5432
📍 Database: pharmahub_db
📍 User: postgres
==================================================

🔍 Step 1: Checking if database exists...
✅ Connected to default 'postgres' database
📦 Database 'pharmahub_db' does not exist. Creating...
✅ Database 'pharmahub_db' created successfully
🔌 Disconnected from 'postgres' database

🔍 Step 2: Connecting to target database...
✅ Connected to 'pharmahub_db' database

🔍 Step 3: Creating tables...
✅ All tables created successfully

📋 Tables created:
   - users
   - products
   - orders
   - order_items
   - notifications

✅ Database and Tables setup complete!
🔌 Disconnected from target database

==================================================
🎉 Setup completed successfully!
==================================================
```

## Database Schema

### Tables Created

#### 1. **users**

```sql
- id (UUID, Primary Key)
- name (VARCHAR 255)
- email (VARCHAR 255, UNIQUE)
- password (VARCHAR 255, hashed)
- phone (VARCHAR 50)
- address (TEXT)
- role (VARCHAR 50, default: 'customer')
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 2. **products**

```sql
- id (UUID, Primary Key)
- name (VARCHAR 255)
- description (TEXT)
- price (DECIMAL 10,2)
- stock (INTEGER)
- category (VARCHAR 100)
- image_url (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 3. **orders**

```sql
- id (UUID, Primary Key)
- order_id (VARCHAR 100, UNIQUE)
- user_id (UUID, Foreign Key → users)
- total_amount (DECIMAL 10,2)
- status (VARCHAR 50)
- payment_method (VARCHAR 50)
- payment_status (VARCHAR 50)
- customer_name (VARCHAR 255)
- customer_email (VARCHAR 255)
- customer_phone (VARCHAR 50)
- customer_address (TEXT)
- notes (TEXT)
- admin_notes (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 4. **order_items**

```sql
- id (UUID, Primary Key)
- order_id (UUID, Foreign Key → orders)
- product_id (UUID, Foreign Key → products)
- product_name (VARCHAR 255)
- quantity (INTEGER)
- price (DECIMAL 10,2)
- created_at (TIMESTAMP)
```

#### 5. **notifications**

```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key → users)
- type (VARCHAR 50)
- title (VARCHAR 255)
- message (TEXT)
- order_id (VARCHAR 100)
- is_read (BOOLEAN, default: false)
- created_at (TIMESTAMP)
```

## Authentication API Endpoints

### 1. Register User

```http
POST /api/auth/register
Content-Type: application/json

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
    "id": "uuid-here",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "08123456789",
    "address": "Jl. Example No. 123",
    "role": "customer"
  },
  "token": "jwt_token_here"
}
```

### 2. Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "uuid-here",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  },
  "token": "jwt_token_here"
}
```

### 3. Get Profile

```http
GET /api/auth/me
Authorization: Bearer {jwt_token}
```

**Response:**

```json
{
  "success": true,
  "user": {
    "id": "uuid-here",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "08123456789",
    "address": "Jl. Example No. 123",
    "role": "customer"
  }
}
```

### 4. Verify Token

```http
POST /api/auth/verify
Content-Type: application/json

{
  "token": "jwt_token_here"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Token is valid",
  "userId": "uuid-here",
  "email": "john@example.com",
  "role": "customer"
}
```

## Testing the Setup

### 1. Start API Server

```bash
npm run dev:api
```

### 2. Test Registration

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "08123456789"
  }'
```

### 3. Test Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 4. Test Profile (use token from login response)

```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## Troubleshooting

### Error: "password authentication failed"

- Check your PostgreSQL password in `.env`
- Verify PostgreSQL is running: `pg_isready`

### Error: "database does not exist"

- Run the setup script again: `node api/scripts/setupDb.js`

### Error: "role 'postgres' does not exist"

- Create PostgreSQL user or update `DB_USER` in `.env`

### Error: "connection refused"

- Check if PostgreSQL is running
- Verify `DB_HOST` and `DB_PORT` in `.env`

## Security Notes

### Password Hashing

- Uses bcrypt with 10 salt rounds
- Passwords never stored in plain text
- Password min length: 6 characters

### JWT Tokens

- Default expiration: 7 days
- Secret key from `JWT_SECRET` env variable
- Change `JWT_SECRET` in production!

### Best Practices

1. ✅ Never commit `.env` file to git
2. ✅ Use strong `JWT_SECRET` in production
3. ✅ Enable SSL for database connections in production
4. ✅ Implement rate limiting for auth endpoints
5. ✅ Add password complexity requirements

## File Structure

```
api/
├── scripts/
│   └── setupDb.js           # Database setup script
├── services/
│   └── authService.js       # Authentication business logic
├── controllers/
│   └── authController.js    # Authentication request handlers
├── routes/
│   └── authRoutes.js        # Authentication endpoints
└── .env                     # Environment variables
```

## Next Steps

1. ✅ Run database setup script
2. ✅ Test authentication endpoints
3. 🔄 Integrate with frontend Login/Register pages
4. 🔄 Add admin role authorization middleware
5. 🔄 Implement password reset functionality
6. 🔄 Add email verification

---

**Setup Script Location**: `api/scripts/setupDb.js`  
**Run Command**: `node api/scripts/setupDb.js`
