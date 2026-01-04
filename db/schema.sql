-- KosHub Living Support Database Schema

-- Laundry Services Table
CREATE TABLE IF NOT EXISTS laundry_services (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    booking_id INTEGER NOT NULL,
    service_type VARCHAR(50) NOT NULL CHECK (service_type IN ('wash', 'wash_iron', 'dry_clean', 'iron_only')),
    weight DECIMAL(5,2) NOT NULL,
    pickup_date DATE NOT NULL,
    pickup_time TIME NOT NULL,
    delivery_date DATE,
    delivery_time TIME,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'picked_up', 'in_progress', 'ready', 'delivered', 'cancelled')),
    total_price DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Catering Orders Table
CREATE TABLE IF NOT EXISTS catering_orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    booking_id INTEGER NOT NULL,
    meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    menu_name VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    delivery_date DATE NOT NULL,
    delivery_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'on_delivery', 'delivered', 'cancelled')),
    total_price DECIMAL(10,2),
    delivery_address TEXT,
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    service_type VARCHAR(20) NOT NULL CHECK (service_type IN ('laundry', 'catering')),
    service_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    notification_type VARCHAR(20) CHECK (notification_type IN ('info', 'warning', 'success', 'error')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_laundry_user_id ON laundry_services(user_id);
CREATE INDEX idx_laundry_booking_id ON laundry_services(booking_id);
CREATE INDEX idx_laundry_status ON laundry_services(status);
CREATE INDEX idx_catering_user_id ON catering_orders(user_id);
CREATE INDEX idx_catering_booking_id ON catering_orders(booking_id);
CREATE INDEX idx_catering_status ON catering_orders(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to laundry_services
CREATE TRIGGER update_laundry_updated_at BEFORE UPDATE ON laundry_services
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to catering_orders
CREATE TRIGGER update_catering_updated_at BEFORE UPDATE ON catering_orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
