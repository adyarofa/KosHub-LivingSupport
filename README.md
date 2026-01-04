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


## API Endpoints

Base URL: `http://localhost:3002`

### Authentication

Semua endpoint yang memerlukan autentikasi harus menyertakan header:
```
Authorization: Bearer <access_token>
```

Token diperoleh dari login di Accommodation Service.

### Laundry Service

**POST /api/laundry** - Create laundry request
```json
{
  "service_type": "wash_iron",
  "weight": 5.5,
  "pickup_date": "2026-01-10",
  "pickup_time": "09:00:00",
  "notes": "Pisahkan putih dan berwarna"
}
```

Service types dan harga per kg:
- `wash`: Rp 5,000
- `wash_iron`: Rp 7,000
- `dry_clean`: Rp 15,000
- `iron_only`: Rp 3,000

**GET /api/laundry** - Get all laundry requests

**GET /api/laundry/:id** - Get specific laundry request

**PUT /api/laundry/:id** - Update laundry request

**PUT /api/laundry/:id/status** - Update laundry status
```json
{
  "status": "picked_up",
  "delivery_date": "2026-01-12",
  "delivery_time": "15:00:00"
}
```

**DELETE /api/laundry/:id** - Cancel laundry request

### Catering Service

**GET /api/catering/menu** - Get available menu

**POST /api/catering** - Create catering order
```json
{
  "meal_type": "lunch",
  "menu_name": "Nasi Ayam Geprek",
  "quantity": 2,
  "delivery_date": "2026-01-05",
  "delivery_time": "12:00:00",
  "special_requests": "Extra sambal"
}
```

**GET /api/catering** - Get all orders

**GET /api/catering/:id** - Get specific order

**PUT /api/catering/:id** - Update order

**PUT /api/catering/:id/status** - Update order status

**DELETE /api/catering/:id** - Cancel order

### Notifications

**GET /api/notifications** - Get all notifications

**GET /api/notifications/unread-count** - Get unread count

**GET /api/notifications/:id** - Get specific notification

**PUT /api/notifications/:id/read** - Mark as read

**PUT /api/notifications/read-all** - Mark all as read

**DELETE /api/notifications/:id** - Delete notification

**DELETE /api/notifications** - Delete all read notifications



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

## Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Testing

```bash
# Register user (via Accommodation Service)
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# Create laundry request
curl -X POST http://localhost:3002/api/laundry \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "service_type": "wash_iron",
    "weight": 5,
    "pickup_date": "2026-01-10",
    "pickup_time": "09:00:00"
  }'
```

## Integration

Service ini terintegrasi dengan KosHub Accommodation untuk:
- Validasi token JWT menggunakan Supabase Auth yang sama
- Validasi active booking melalui API call atau direct database query
- Single sign-on untuk kedua service
