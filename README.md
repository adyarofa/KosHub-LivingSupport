# KosHub Living Support Microservice

Microservice untuk layanan dukungan kehidupan penghuni kos yang menyediakan fitur laundry, catering, dan notifikasi. Terintegrasi dengan KosHub Accommodation Service untuk validasi booking aktif.

## Features

- **Laundry Service**: Kelola permintaan layanan laundry dengan berbagai jenis layanan dan tracking status lengkap
- **Catering Service**: Pemesanan makanan dengan menu yang beragam dan penjadwalan pengiriman
- **Notification System**: Notifikasi otomatis untuk setiap perubahan status layanan
- **Authentication**: Terintegrasi dengan Supabase Auth untuk single sign-on
- **Authorization**: Validasi active booking sebelum menggunakan layanan

## Technology Stack

- Node.js 20.x
- Express.js 5.x
- PostgreSQL 16 (Supabase)
- Supabase Auth
- Docker & Docker Compose

## Installation

```bash
# Clone repository
git clone https://github.com/adyarofa/KosHub-LivingSupport.git
cd KosHub-LivingSupport

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env dengan Supabase credentials

# Run database schema di Supabase SQL Editor
# Copy isi db/schema.sql ke Supabase SQL Editor dan execute

# Start service
npm start
```

## Configuration

Environment variables yang diperlukan:

```env
PORT=3002
DATABASE_URL=postgresql://postgres:password@host:5432/database
SUPABASE_URL=https://project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_JWT_SECRET=your_jwt_secret
ACCOMMODATION_SERVICE_URL=http://localhost:3000
```

---


## Database Schema

### laundry_services
- id, user_id, booking_id
- service_type, weight, total_price
- pickup_date, pickup_time, delivery_date, delivery_time
- status, notes
- created_at, updated_at

### catering_orders
- id, user_id, booking_id
- meal_type, menu_name, quantity, total_price
- delivery_date, delivery_time, delivery_address
- status, special_requests
- created_at, updated_at

### notifications
- id, user_id, service_type, service_id
- title, message, notification_type
- is_read, created_at

### users
- uuid, name, membership_level, discount_rate
- created_at, updated_at

## Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Integration

Service ini terintegrasi dengan KosHub Accommodation untuk:
- Validasi token JWT menggunakan Supabase Auth yang sama
- Validasi active booking melalui API call atau direct database query
- Single sign-on 
