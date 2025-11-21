# PharmaHub Database - Entity Relationship Diagram (ERD)

## Database Structure Visualization

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          PHARMAHUB DATABASE SCHEMA                               │
│                                                                                  │
│  Total Tables: 18                                                                │
│  Views: 3                                                                        │
│  Functions: 5                                                                    │
│  Triggers: 8                                                                     │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Main Entity Relationships

```
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│     USERS        │◄───────┤  USER_ADDRESSES  │         │  PASSWORD_RESET  │
│                  │  1:N    │                  │         │     _TOKENS      │
│ • user_id (PK)   │         │ • address_id(PK) │         │ • token_id (PK)  │
│ • name           │         │ • user_id (FK)   │         │ • user_id (FK)   │
│ • email          │         │ • full_address   │         │ • token          │
│ • password_hash  │         │ • is_default     │         └──────────────────┘
│ • phone          │         └──────────────────┘                 ▲
│ • role           │                                               │
│ • profile_photo  │◄──────────────────────────────────────────────┘
│   (BYTEA)        │                   1:N
└────────┬─────────┘
         │
         │ 1:N
         ▼
┌──────────────────┐         ┌──────────────────┐
│  NOTIFICATIONS   │         │   NOTIFICATION   │
│                  │         │   _PREFERENCES   │
│ • notification_  │         │ • preference_id  │
│   id (PK)        │         │ • user_id (FK)   │
│ • user_id (FK)   │         │ • email_order_   │
│ • type           │         │   updates        │
│ • title          │         │ • email_promos   │
│ • message        │         │ • push_updates   │
│ • notification_  │         └──────────────────┘
│   image (BYTEA)  │
└──────────────────┘
```

```
┌──────────────────┐
│  PRODUCT_        │
│  CATEGORIES      │
│                  │
│ • category_id(PK)│
│ • category_name  │
│ • icon_image     │
│   (BYTEA)        │
└────────┬─────────┘
         │
         │ 1:N
         ▼
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│    PRODUCTS      │◄───────┤ PRODUCT_IMAGES   │         │ PRODUCT_REVIEWS  │
│                  │  1:N    │                  │         │                  │
│ • product_id(PK) │         │ • image_id (PK)  │         │ • review_id (PK) │
│ • name           │         │ • product_id(FK) │         │ • product_id(FK) │
│ • brand          │         │ • image_data     │         │ • user_id (FK)   │
│ • category_id(FK)│         │   (BYTEA)        │         │ • rating         │
│ • generic_name   │         │ • image_order    │         │ • comment        │
│ • price          │         └──────────────────┘         │ • review_images  │
│ • stock          │                                      │   (BYTEA[])      │
│ • main_image     │◄──────────────────────────────────┤  └──────────────────┘
│   (BYTEA)        │                        1:N
│ • prescription_  │
│   required       │
│ • ingredients[]  │
│ • precaution[]   │
└────────┬─────────┘
         │
         │ N:1
         ▼
┌──────────────────┐         ┌──────────────────┐
│   CART_ITEMS     │         │  SAVED_FOR_      │
│                  │         │     LATER        │
│ • cart_id (PK)   │         │ • saved_id (PK)  │
│ • user_id (FK)   │         │ • user_id (FK)   │
│ • product_id(FK) │         │ • product_id(FK) │
│ • quantity       │         │ • saved_at       │
└──────────────────┘         └──────────────────┘
```

```
┌──────────────────┐
│     COUPONS      │
│                  │
│ • coupon_id (PK) │
│ • code           │
│ • discount_type  │
│ • discount_value │
│ • min_purchase   │
│ • usage_limit    │
│ • start_date     │
│ • end_date       │
└────────┬─────────┘
         │
         │ 1:N
         ▼
┌──────────────────┐         ┌──────────────────┐
│  COUPON_USAGE    │         │     ORDERS       │
│                  │         │                  │
│ • usage_id (PK)  │         │ • order_id (PK)  │
│ • coupon_id (FK) ├────────►│ • order_number   │
│ • user_id (FK)   │         │ • user_id (FK)   │
│ • order_id (FK)  │         │ • customer_name  │
│ • discount_amt   │         │ • customer_phone │
└──────────────────┘         │ • subtotal       │
                             │ • total_amount   │
                             │ • payment_method │
         ┌───────────────────│ • payment_status │
         │                   │ • order_status   │
         │                   │ • prescription_  │
         │                   │   image (BYTEA)  │
         │                   │ • payment_proof  │
         │                   │   (BYTEA)        │
         │                   └────────┬─────────┘
         │                            │
         │ 1:N                        │ 1:N
         ▼                            ▼
┌──────────────────┐         ┌──────────────────┐
│  ORDER_STATUS_   │         │   ORDER_ITEMS    │
│     HISTORY      │         │                  │
│                  │         │ • order_item_id  │
│ • history_id(PK) │         │   (PK)           │
│ • order_id (FK)  │         │ • order_id (FK)  │
│ • old_status     │         │ • product_id(FK) │
│ • new_status     │         │ • product_name   │
│ • notes          │         │ • product_price  │
│ • changed_by(FK) │         │ • quantity       │
│ • changed_at     │         │ • subtotal       │
└──────────────────┘         └──────────────────┘
```

```
┌──────────────────┐
│  ADMIN_ACTIVITY  │
│      _LOGS       │
│                  │
│ • log_id (PK)    │
│ • admin_id (FK)  │────┐
│ • action_type    │    │
│ • target_type    │    │ References USERS
│ • target_id      │    │ (admin role)
│ • description    │    │
│ • old_values     │◄───┘
│   (JSONB)        │
│ • new_values     │
│   (JSONB)        │
│ • ip_address     │
│ • created_at     │
└──────────────────┘
```

```
┌──────────────────┐
│  SALES_REPORTS   │
│                  │
│ • report_id (PK) │
│ • report_date    │
│ • total_orders   │
│ • completed_ord  │
│ • total_revenue  │
│ • total_tax      │
│ • total_discount │
│ • net_revenue    │
│ • top_selling_   │
│   product_id(FK) │
└──────────────────┘
```

## BYTEA (Binary) Columns Map

```
┌─────────────────────────────────────────────────────────────┐
│              TABLES WITH BINARY IMAGE STORAGE               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. USERS                                                   │
│     └─ profile_photo (BYTEA)                                │
│        photo_mime_type, photo_filename                      │
│                                                             │
│  2. PRODUCTS                                                │
│     └─ main_image (BYTEA)                                   │
│        main_image_mime_type, main_image_filename            │
│                                                             │
│  3. PRODUCT_IMAGES                                          │
│     └─ image_data (BYTEA)                                   │
│        image_mime_type, image_filename, image_order         │
│                                                             │
│  4. PRODUCT_CATEGORIES                                      │
│     └─ icon_image (BYTEA)                                   │
│        icon_mime_type                                       │
│                                                             │
│  5. ORDERS                                                  │
│     ├─ prescription_image (BYTEA)                           │
│     │  prescription_mime_type                               │
│     └─ payment_proof (BYTEA)                                │
│        payment_proof_mime_type                              │
│                                                             │
│  6. NOTIFICATIONS                                           │
│     └─ notification_image (BYTEA)                           │
│        notification_image_mime_type                         │
│                                                             │
│  7. PRODUCT_REVIEWS                                         │
│     └─ review_images (BYTEA[])  ← Array!                    │
│        review_images_mime_types (TEXT[])                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Database Views

```
VIEW: admin_dashboard_stats
├─ total_active_products
├─ low_stock_products
├─ today_orders
├─ pending_orders
├─ today_revenue
├─ monthly_revenue
├─ total_customers
└─ new_customers_today

VIEW: top_selling_products
├─ product_id
├─ name, brand, price
├─ stock, sold_count
├─ total_orders
├─ total_quantity_sold
└─ total_revenue

VIEW: user_order_history
├─ order_id, order_number
├─ user_id, customer_name
├─ total_amount, order_status
├─ payment_status, payment_method
└─ total_items, total_quantity
```

## Automated Functions & Triggers

```
FUNCTIONS:
1. update_updated_at_column()
   └─ Auto update 'updated_at' timestamp

2. generate_order_number()
   └─ Generate unique order number (PHARMAHUB-YYYYMMDD-XXXXX)

3. update_product_stock_after_order()
   └─ Auto decrease product stock when order created

4. create_order_notification()
   └─ Auto create notification on order status change

5. check_low_stock()
   └─ Auto notify admin when product stock is low

TRIGGERS:
• update_users_updated_at
• update_products_updated_at
• update_orders_updated_at
• update_cart_items_updated_at
• trigger_update_stock (AFTER INSERT ON order_items)
• trigger_order_notification (AFTER INSERT/UPDATE ON orders)
• trigger_low_stock_alert (AFTER INSERT/UPDATE ON products)
```

## Key Relationships Summary

```
USERS (1) ──────── (N) USER_ADDRESSES
USERS (1) ──────── (N) PASSWORD_RESET_TOKENS
USERS (1) ──────── (N) CART_ITEMS
USERS (1) ──────── (N) SAVED_FOR_LATER
USERS (1) ──────── (N) ORDERS
USERS (1) ──────── (N) NOTIFICATIONS
USERS (1) ──────── (1) NOTIFICATION_PREFERENCES
USERS (1) ──────── (N) PRODUCT_REVIEWS
USERS (1) ──────── (N) ADMIN_ACTIVITY_LOGS

PRODUCT_CATEGORIES (1) ──────── (N) PRODUCTS

PRODUCTS (1) ──────── (N) PRODUCT_IMAGES
PRODUCTS (1) ──────── (N) PRODUCT_REVIEWS
PRODUCTS (1) ──────── (N) CART_ITEMS
PRODUCTS (1) ──────── (N) SAVED_FOR_LATER
PRODUCTS (1) ──────── (N) ORDER_ITEMS

ORDERS (1) ──────── (N) ORDER_ITEMS
ORDERS (1) ──────── (N) ORDER_STATUS_HISTORY
ORDERS (1) ──────── (N) COUPON_USAGE

COUPONS (1) ──────── (N) COUPON_USAGE
```

## Index Strategy

```
PRIMARY KEYS (Auto-indexed):
• All *_id columns

FOREIGN KEYS (Recommended indexes):
• All FK columns automatically indexed

CUSTOM INDEXES:
• users.email (UNIQUE, frequently queried)
• users.phone (search/filter)
• users.role (filter by role)
• products.name (search)
• products.generic_name (search)
• products.category_id (filter)
• orders.order_number (UNIQUE, lookup)
• orders.customer_phone (search)
• orders.order_status (filter)
• orders.created_at (DESC - sorting)
• notifications.user_id + is_read (composite)
• coupons.code (UNIQUE, validation)
```

## Data Types Reference

```
COMMON TYPES:
• SERIAL → Auto-incrementing integer (PK)
• VARCHAR(n) → Variable character (max n)
• TEXT → Unlimited text
• INTEGER → 4-byte integer
• BOOLEAN → True/False
• DECIMAL(m,n) → Decimal with precision
• TIMESTAMP → Date + Time
• DATE → Date only
• BYTEA → Binary data (images)
• TEXT[] → Array of text
• JSONB → JSON Binary (faster)

SPECIAL CONSTRAINTS:
• CHECK → Value validation
• UNIQUE → No duplicates
• NOT NULL → Required field
• DEFAULT → Default value
• ON DELETE CASCADE → Delete related
• ON DELETE SET NULL → Nullify related
```

## Database Size Estimation

```
TYPICAL STORAGE (per record):

USERS:
• Base data: ~500 bytes
• With photo (200KB avg): ~200KB
• Estimated: ~200-500KB per user

PRODUCTS:
• Base data: ~2KB (with arrays)
• With main_image (500KB avg): ~500KB
• Estimated: ~500KB - 1MB per product

PRODUCT_IMAGES:
• Per image: ~500KB - 2MB
• Multiple images per product

ORDERS:
• Base data: ~1KB
• With prescription: ~1MB
• Estimated: ~1-2KB per order (no images)

ESTIMATED TOTAL (1000 users, 500 products, 10000 orders):
• Users: 200-500 MB
• Products: 250-500 MB
• Product Images: 1-5 GB (if many images)
• Orders: 10-20 MB
• Other tables: 50-100 MB
• Total: ~2-6 GB (with images)

RECOMMENDATION:
• Use external storage (S3/Cloudinary) for production
• Keep database < 20GB for optimal performance
```

---

**ERD Version:** 1.0
**Last Updated:** November 21, 2025
**Compatible with:** PostgreSQL 12+
