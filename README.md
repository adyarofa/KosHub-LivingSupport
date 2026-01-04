# KosHub Living Support Microservice

🏠 **Microservice untuk layanan dukungan kehidupan penghuni kos** - Laundry, Catering, dan Notifikasi

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-blue.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-ready-blue.svg)](https://www.docker.com/)

---

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Teknologi](#-teknologi)
- [Prerequisites](#-prerequisites)
- [Instalasi & Setup](#-instalasi--setup)
- [API Documentation](#-api-documentation)
- [Deployment dengan Docker](#-deployment-dengan-docker)
- [Environment Variables](#-environment-variables)
- [Database Schema](#-database-schema)
- [Testing API](#-testing-api)

---

## Fitur Utama

### 1. **Laundry Service** 
- Request layanan laundry (wash, wash+iron, dry clean, iron only)
- Tracking status laundry (pending → picked_up → in_progress → ready → delivered)
- Otomatis hitung harga berdasarkan berat dan jenis layanan
- Update/cancel request laundry

### 2. **Catering Service** 
- Lihat menu catering (breakfast, lunch, dinner, snack)
- Order makanan dengan jadwal pengiriman
- Tracking status pesanan (pending → confirmed → preparing → on_delivery → delivered)
- Custom request dan delivery address

### 3. **Notification System** 
- Notifikasi otomatis untuk setiap perubahan status layanan
- Mark as read/unread
- Unread notification count
- Delete notifikasi yang sudah dibaca

### 4. **Security & Authorization** 
- JWT Authentication (terintegrasi dengan microservice Accommodation)
- Validasi user harus punya **active booking** untuk menggunakan layanan
- Token-based authorization pada semua endpoint

---

## 🛠 Teknologi

- **Runtime**: Node.js 20.x
- **Framework**: Express.js 5.x
- **Database**: PostgreSQL 16
- **Authentication**: JWT (jsonwebtoken)
- **Container**: Docker & Docker Compose
- **HTTP Client**: Axios (untuk komunikasi antar microservice)

---

## 📦 Prerequisites

**Pilihan 1: Supabase (Recommended for Production)** 
- [Node.js](https://nodejs.org/) (v20 atau lebih baru)
- [Supabase Account](https://supabase.com) (Gratis!)
- [Git](https://git-scm.com/)

**Pilihan 2: Local Development** 💻
- [Node.js](https://nodejs.org/) (v20 atau lebih baru)
- [PostgreSQL](https://www.postgresql.org/) (v16 atau lebih baru)
- [Docker](https://www.docker.com/) & Docker Compose (untuk deployment)
- [Git](https://git-scm.com/)

> 📘 **Lihat [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) untuk panduan lengkap setup Supabase**

---

## Instalasi & Setup

> **Recommended**: Pakai Supabase untuk deployment yang mudah!  

### Quick Start dengan Supabase 

```bash
# 1. Clone repository
git clone https://github.com/adyarofa/KosHub-LivingSupport.git
cd KosHub-LivingSupport

# 2. Install dependencies
npm install

# 3. Setup environment (copy dan edit dengan credentials Supabase)
cp .env.supabase.example .env
# Edit .env dengan credentials dari supabase.com

# 4. Run database schema di Supabase SQL Editor
# Copy isi db/schema.sql → Paste di Supabase SQL Editor → Run

# 5. Start service
npm start
```

**Dapatkan Supabase Credentials:**
1. Buat project di [supabase.com](https://supabase.com)
2. Settings → Database → Copy **Connection String (URI)**
3. Settings → API → Copy **JWT Secret**
4. Done

---

### Setup dengan PostgreSQL Local 

<details>
<summary>Klik untuk lihat panduan lengkap</summary>

### 1. Clone Repository

\`\`\`bash
git clone https://github.com/adyarofa/KosHub-LivingSupport.git
cd KosHub-LivingSupport
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Setup Database

**a. Buat database PostgreSQL:**

\`\`\`bash
# Login ke PostgreSQL
psql -U postgres

# Buat database
CREATE DATABASE koshub_living_support;

# Keluar
\\q
\`\`\`

**b. Import schema:**

\`\`\`bash
psql -U postgres -d koshub_living_support -f db/schema.sql
\`\`\`

### 4. Setup Environment Variables

Copy file `.env.example` menjadi `.env`:

\`\`\`bash
cp .env.example .env
\`\`\`

Edit file `.env` sesuai konfigurasi Anda:

\`\`\`env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=koshub_living_support
JWT_SECRET=same_secret_as_accommodation_service
ACCOMMODATION_SERVICE_URL=http://localhost:3001
\`\`\`

**PENTING**: Gunakan `JWT_SECRET` yang **SAMA** dengan microservice Accommodation!

### 5. Jalankan Service

\`\`\`bash
# Development mode (dengan auto-reload)
npm run dev

# Production mode
npm start
\`\`\`

Service akan berjalan di: **http://localhost:3002**

</details>

---

## API Documentation

Base URL: `http://localhost:3002`

### Public Endpoints

#### Health Check
\`\`\`http
GET /health
\`\`\`

**Response:**
\`\`\`json
{
  "status": "OK",
  "service": "KosHub Living Support Service",
  "timestamp": "2026-01-04T12:00:00.000Z"
}
\`\`\`

---

### Protected Endpoints

**Authentication Required**: Semua endpoint di bawah memerlukan header:
\`\`\`
Authorization: Bearer <access_token>
\`\`\`

Token didapat dari **login** di microservice Accommodation.

---

### Laundry Endpoints

**Requirements**: Authentication + Active Booking

#### 1. Create Laundry Request

\`\`\`http
POST /api/laundry
Content-Type: application/json
Authorization: Bearer <token>

{
  "service_type": "wash_iron",
  "weight": 5.5,
  "pickup_date": "2026-01-10",
  "pickup_time": "09:00:00",
  "notes": "Pisahkan putih dan berwarna"
}
\`\`\`

**Service Types & Prices (per kg):**
- `wash`: Rp 5,000
- `wash_iron`: Rp 7,000
- `dry_clean`: Rp 15,000
- `iron_only`: Rp 3,000

**Response:**
\`\`\`json
{
  "id": 1,
  "user_id": 123,
  "booking_id": 456,
  "service_type": "wash_iron",
  "weight": "5.50",
  "pickup_date": "2026-01-10",
  "pickup_time": "09:00:00",
  "total_price": "38500.00",
  "status": "pending",
  "notes": "Pisahkan putih dan berwarna",
  "created_at": "2026-01-04T12:00:00.000Z"
}
\`\`\`

#### 2. Get All Laundry Requests

\`\`\`http
GET /api/laundry
Authorization: Bearer <token>
\`\`\`

#### 3. Get Specific Laundry

\`\`\`http
GET /api/laundry/:id
Authorization: Bearer <token>
\`\`\`

#### 4. Update Laundry Request

\`\`\`http
PUT /api/laundry/:id
Authorization: Bearer <token>

{
  "pickup_date": "2026-01-11",
  "pickup_time": "10:00:00",
  "notes": "Updated notes"
}
\`\`\`

**Note**: Hanya bisa update jika status masih `pending`

#### 5. Update Laundry Status

\`\`\`http
PUT /api/laundry/:id/status
Authorization: Bearer <token>

{
  "status": "picked_up",
  "delivery_date": "2026-01-12",
  "delivery_time": "15:00:00"
}
\`\`\`

**Valid Statuses:**
- `pending` → `picked_up` → `in_progress` → `ready` → `delivered`
- `cancelled`

#### 6. Cancel Laundry

\`\`\`http
DELETE /api/laundry/:id
Authorization: Bearer <token>
\`\`\`

---

### Catering Endpoints

**Requirements**: Authentication + Active Booking

#### 1. Get Catering Menu

\`\`\`http
GET /api/catering/menu
Authorization: Bearer <token>
\`\`\`

**Response:**
\`\`\`json
{
  "message": "Available catering menu",
  "menu": {
    "breakfast": [
      { "name": "Nasi Goreng + Telur", "price": 15000 },
      { "name": "Bubur Ayam", "price": 12000 }
    ],
    "lunch": [
      { "name": "Nasi Ayam Geprek", "price": 20000 },
      { "name": "Nasi Rendang", "price": 25000 }
    ],
    "dinner": [...],
    "snack": [...]
  }
}
\`\`\`

#### 2. Create Catering Order

\`\`\`http
POST /api/catering
Authorization: Bearer <token>

{
  "meal_type": "lunch",
  "menu_name": "Nasi Ayam Geprek",
  "quantity": 2,
  "delivery_date": "2026-01-05",
  "delivery_time": "12:00:00",
  "special_requests": "Extra sambal, less spicy"
}
\`\`\`

**Response:**
\`\`\`json
{
  "id": 1,
  "user_id": 123,
  "booking_id": 456,
  "meal_type": "lunch",
  "menu_name": "Nasi Ayam Geprek",
  "quantity": 2,
  "delivery_date": "2026-01-05",
  "delivery_time": "12:00:00",
  "total_price": "40000.00",
  "status": "pending",
  "delivery_address": "Room 101",
  "special_requests": "Extra sambal, less spicy",
  "created_at": "2026-01-04T12:00:00.000Z"
}
\`\`\`

#### 3. Get All Catering Orders

\`\`\`http
GET /api/catering
Authorization: Bearer <token>
\`\`\`

#### 4. Get Specific Order

\`\`\`http
GET /api/catering/:id
Authorization: Bearer <token>
\`\`\`

#### 5. Update Catering Order

\`\`\`http
PUT /api/catering/:id
Authorization: Bearer <token>

{
  "quantity": 3,
  "delivery_time": "12:30:00"
}
\`\`\`

#### 6. Update Order Status

\`\`\`http
PUT /api/catering/:id/status
Authorization: Bearer <token>

{
  "status": "confirmed"
}
\`\`\`

**Valid Statuses:**
- `pending` → `confirmed` → `preparing` → `on_delivery` → `delivered`
- `cancelled`

#### 7. Cancel Order

\`\`\`http
DELETE /api/catering/:id
Authorization: Bearer <token>
\`\`\`

---

### Notification Endpoints

**Requirements**: Authentication Only (tidak perlu active booking)

#### 1. Get All Notifications

\`\`\`http
GET /api/notifications?is_read=false&limit=50
Authorization: Bearer <token>
\`\`\`

**Query Parameters:**
- `is_read`: Filter by read status (`true`/`false`)
- `limit`: Maximum notifications to return (default: 50)

#### 2. Get Unread Count

\`\`\`http
GET /api/notifications/unread-count
Authorization: Bearer <token>
\`\`\`

**Response:**
\`\`\`json
{
  "unread_count": 5
}
\`\`\`

#### 3. Get Specific Notification

\`\`\`http
GET /api/notifications/:id
Authorization: Bearer <token>
\`\`\`

#### 4. Mark as Read

\`\`\`http
PUT /api/notifications/:id/read
Authorization: Bearer <token>
\`\`\`

#### 5. Mark All as Read

\`\`\`http
PUT /api/notifications/read-all
Authorization: Bearer <token>
\`\`\`

#### 6. Delete Notification

\`\`\`http
DELETE /api/notifications/:id
Authorization: Bearer <token>
\`\`\`

#### 7. Delete All Read Notifications

\`\`\`http
DELETE /api/notifications
Authorization: Bearer <token>
\`\`\`

---

## 🐳 Deployment dengan Docker

### Option 1: Docker Compose (Recommended)

\`\`\`bash
# Build dan jalankan semua services (app + database)
docker-compose up -d

# Lihat logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop dan hapus volumes (data akan hilang)
docker-compose down -v
\`\`\`

Service akan berjalan di:
- **App**: http://localhost:3002
- **Database**: localhost:5433

### Option 2: Docker Manual

\`\`\`bash
# Build image
docker build -t koshub-living-support .

# Run container
docker run -d \\
  --name koshub-living-support \\
  -p 3002:3002 \\
  -e DB_HOST=your_db_host \\
  -e DB_PASSWORD=your_password \\
  -e JWT_SECRET=your_secret \\
  koshub-living-support
\`\`\`

---

## Environment Variables

### Supabase Configuration (Recommended)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `PORT` | Port service berjalan | `3002` | No |
| `DATABASE_URL` | Supabase PostgreSQL connection string | `postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres` | Yes |
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` | Yes |
| `SUPABASE_ANON_KEY` | Supabase anon/public key | `eyJhbGc...` | No |
| `SUPABASE_JWT_SECRET` | Supabase JWT secret (HARUS SAMA dengan Accommodation!) | `vIySweWm...` | Yes |
| `ACCOMMODATION_SERVICE_URL` | URL microservice Accommodation | `http://localhost:3001` | Yes |

### Local PostgreSQL Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Port service berjalan | `3002` | No |
| `DB_HOST` | PostgreSQL host | `localhost` | Yes |
| `DB_PORT` | PostgreSQL port | `5432` | No |
| `DB_USER` | Database username | `postgres` | Yes |
| `DB_PASSWORD` | Database password | - | Yes |
| `DB_NAME` | Database name | `koshub_living_support` | Yes |
| `JWT_SECRET` | JWT secret key (HARUS SAMA dengan Accommodation!) | - | Yes |
| `ACCOMMODATION_SERVICE_URL` | URL microservice Accommodation | `http://localhost:3001` | Yes |

> **Note**: Code sudah di-setup untuk support **both** Supabase dan Local PostgreSQL!  
> Tinggal pilih mana yang mau dipakai berdasarkan environment variables yang di-set.

---

## 🗄️ Database Schema

### Tables

#### 1. `laundry_services`
\`\`\`sql
- id (SERIAL PRIMARY KEY)
- user_id (INTEGER, FK to users)
- booking_id (INTEGER, FK to bookings)
- service_type (VARCHAR: wash, wash_iron, dry_clean, iron_only)
- weight (DECIMAL)
- pickup_date (DATE)
- pickup_time (TIME)
- delivery_date (DATE)
- delivery_time (TIME)
- status (VARCHAR: pending, picked_up, in_progress, ready, delivered, cancelled)
- total_price (DECIMAL)
- notes (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
\`\`\`

#### 2. `catering_orders`
\`\`\`sql
- id (SERIAL PRIMARY KEY)
- user_id (INTEGER, FK to users)
- booking_id (INTEGER, FK to bookings)
- meal_type (VARCHAR: breakfast, lunch, dinner, snack)
- menu_name (VARCHAR)
- quantity (INTEGER)
- delivery_date (DATE)
- delivery_time (TIME)
- status (VARCHAR: pending, confirmed, preparing, on_delivery, delivered, cancelled)
- total_price (DECIMAL)
- delivery_address (TEXT)
- special_requests (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
\`\`\`

#### 3. `notifications`
\`\`\`sql
- id (SERIAL PRIMARY KEY)
- user_id (INTEGER)
- service_type (VARCHAR: laundry, catering)
- service_id (INTEGER)
- title (VARCHAR)
- message (TEXT)
- is_read (BOOLEAN)
- notification_type (VARCHAR: info, warning, success, error)
- created_at (TIMESTAMP)
\`\`\`

---

## Testing API

### 1. Register & Login (di Accommodation Service)

\`\`\`bash
# Register
curl -X POST http://localhost:3001/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User"
  }'

# Login (dapatkan token)
curl -X POST http://localhost:3001/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
\`\`\`

### 2. Create Booking (di Accommodation Service)

\`\`\`bash
curl -X POST http://localhost:3001/bookings \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{
    "accommodation_id": 1,
    "check_in_date": "2026-01-01",
    "check_out_date": "2026-06-01"
  }'
\`\`\`

### 3. Test Living Support Services

\`\`\`bash
# Health check
curl http://localhost:3002/health

# Create laundry request
curl -X POST http://localhost:3002/api/laundry \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{
    "service_type": "wash_iron",
    "weight": 5,
    "pickup_date": "2026-01-10",
    "pickup_time": "09:00:00"
  }'

# Get catering menu
curl -X GET http://localhost:3002/api/catering/menu \\
  -H "Authorization: Bearer YOUR_TOKEN"

# Create catering order
curl -X POST http://localhost:3002/api/catering \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{
    "meal_type": "lunch",
    "menu_name": "Nasi Ayam Geprek",
    "quantity": 2,
    "delivery_date": "2026-01-05",
    "delivery_time": "12:00:00"
  }'

# Get notifications
curl -X GET http://localhost:3002/api/notifications \\
  -H "Authorization: Bearer YOUR_TOKEN"
\`\`\`

---

## 🔗 Integration dengan Accommodation Service

Service ini berkomunikasi dengan **KosHub-Accommodation** untuk:

1. **Validasi Token JWT**: Menggunakan secret yang sama
2. **Check Active Booking**: Memanggil endpoint `/bookings/active/:userId`

Pastikan:
- Accommodation service sudah running di `http://localhost:3001`
- JWT_SECRET sama di kedua service
- User sudah punya booking aktif sebelum menggunakan laundry/catering

---

## Notes

### Notifikasi Otomatis

Sistem akan otomatis create notifikasi ketika:
- Laundry/catering request dibuat
- Status berubah (picked up, delivered, dll)
- Request di-update atau di-cancel

### Active Booking Requirement

User **HARUS punya booking aktif** untuk:
- Semua endpoint `/api/laundry/*`
- Semua endpoint `/api/catering/*`

User **TIDAK perlu** booking untuk:
- Endpoint `/api/notifications/*`

### Status Flow

**Laundry:**
```
pending → picked_up → in_progress → ready → delivered
         ↓
    cancelled
```

**Catering:**
```
pending → confirmed → preparing → on_delivery → delivered
         ↓
    cancelled
```

---

