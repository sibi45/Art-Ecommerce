-- =============================================================================
-- ArtWeb: Painting E-Commerce & Inquiry Platform Database Schema
-- Compatible with PostgreSQL (Supabase, Neon, Render, Local Postgres)
-- =============================================================================

-- 1. Create extension for UUID generation (if using PostgreSQL)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables if re-creating
DROP TABLE IF EXISTS inquiries CASCADE;
DROP TABLE IF EXISTS paintings CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 3. Users Table (Customers & Admins)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- 4. Categories Table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(80) UNIQUE NOT NULL,
    slug VARCHAR(80) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Paintings / Products Table
CREATE TABLE paintings (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    artist_name VARCHAR(120) NOT NULL DEFAULT 'Master Artist',
    description TEXT NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    medium VARCHAR(100) NOT NULL, -- e.g. 'Oil on Canvas', 'Acrylic on Wood', 'Watercolor', etc.
    dimensions VARCHAR(100) NOT NULL, -- e.g. '36 x 48 inches (91 x 122 cm)'
    year_created INTEGER,
    price NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    image_url TEXT NOT NULL,
    additional_images TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_framed BOOLEAN DEFAULT FALSE,
    status VARCHAR(30) DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold')),
    featured BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_paintings_status ON paintings(status);
CREATE INDEX idx_paintings_category ON paintings(category_id);
CREATE INDEX idx_paintings_featured ON paintings(featured);

-- 6. Inquiries Table (When customer inquires to purchase a painting)
CREATE TABLE inquiries (
    id SERIAL PRIMARY KEY,
    inquiry_code VARCHAR(30) UNIQUE NOT NULL, -- e.g. 'INQ-2026-9821'
    painting_id INTEGER NOT NULL REFERENCES paintings(id) ON DELETE RESTRICT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(25) NOT NULL,
    shipping_address TEXT NOT NULL,
    preferred_contact VARCHAR(30) DEFAULT 'whatsapp' CHECK (preferred_contact IN ('whatsapp', 'phone', 'email')),
    message TEXT,
    quoted_price NUMERIC(12, 2) NOT NULL,
    status VARCHAR(30) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'negotiating', 'confirmed', 'completed', 'cancelled')),
    admin_notes TEXT,
    contacted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inquiries_user_id ON inquiries(user_id);
CREATE INDEX idx_inquiries_painting_id ON inquiries(painting_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at DESC);

-- =============================================================================
-- SEED DATA (Initial Categories, Sample Paintings, and Default Admin)
-- Password for admin is 'Admin@123' (bcrypt hash below)
-- Password for customer is 'User@123' (bcrypt hash below)
-- =============================================================================

-- Categories
INSERT INTO categories (name, slug, description) VALUES
('Oil Painting', 'oil-painting', 'Rich, textured traditional and modern oil paintings on stretched canvas'),
('Acrylics', 'acrylics', 'Vibrant, fast-drying acrylic works featuring expressive strokes and modern palettes'),
('Watercolor', 'watercolor', 'Fluid, ethereal, and delicate translucent watercolor artwork on premium cotton paper'),
('Abstract & Modern', 'abstract-modern', 'Contemporary non-representational works evoking deep emotion, texture, and form'),
('Landscape & Nature', 'landscape-nature', 'Breathtaking scenic views, forests, mountains, ocean horizons, and floral scenes'),
('Portrait & Figurative', 'portrait-figurative', 'Expressive human forms, classical portraiture, and emotive character studies');

-- Default Users:
-- Admin: admin@artweb.com / Admin@123
-- Customer: customer@artweb.com / User@123
INSERT INTO users (full_name, email, hashed_password, phone, address, city, role) VALUES
('Art Gallery Curator', 'admin@artweb.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', '+1 (555) 019-2831', '124 Museum Way', 'New York', 'admin'),
('Jane Sterling', 'customer@artweb.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', '+1 (555) 748-9922', '452 Blossom Street, Apt 3B', 'San Francisco', 'customer');

-- Sample Paintings
INSERT INTO paintings (title, artist_name, description, category_id, medium, dimensions, year_created, price, currency, image_url, is_framed, status, featured) VALUES
(
    'Echoes of the Golden Horizon',
    'Elena Rostova',
    'A breathtaking atmospheric oil study capturing the fleeting twilight moments across rugged coastal bluffs. Thick impasto strokes blend cadmium golds, deep prussian blues, and rose ochres.',
    1,
    'Oil on Heavy Linen Canvas',
    '40 x 54 inches (102 x 137 cm)',
    2025,
    3450.00,
    'USD',
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    TRUE,
    'available',
    TRUE
),
(
    'Symphony in Cobalt & Raw Sienna',
    'Marcus Vance',
    'Bold gestural abstract composition meditating on urban energy and contemplative silence. Layers of raw pigment and dry brushing create extraordinary depth under varying gallery lighting.',
    4,
    'Mixed Media & Acrylic on Canvas',
    '48 x 48 inches (122 x 122 cm)',
    2026,
    2800.00,
    'USD',
    'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80',
    FALSE,
    'available',
    TRUE
),
(
    'Morning Mist over Tuscan Vineyards',
    'Claire DeWitt',
    'Soft washes of sage, umber, and translucent gold bring the tranquil rolling hills of Tuscany into gentle focus. Museum-grade archival watercolor with handmade deckled edges.',
    3,
    'Watercolor on 300gsm Arches Paper',
    '24 x 36 inches (61 x 91 cm)',
    2025,
    1650.00,
    'USD',
    'https://images.unsplash.com/photo-1582561424760-0321d75e81fa?auto=format&fit=crop&w=1200&q=80',
    TRUE,
    'available',
    FALSE
),
(
    'Solitude of the Gilded Muse',
    'Aurelius Thorne',
    'Classical figurative study rendered with Renaissance chiaroscuro technique. Gold leaf accents harmonize with deep umber shadows, celebrating introspective human warmth.',
    6,
    'Oil and 24k Gold Leaf on Belgian Canvas',
    '30 x 42 inches (76 x 107 cm)',
    2025,
    4200.00,
    'USD',
    'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1200&q=80',
    TRUE,
    'available',
    TRUE
),
(
    'Crimson Nocturne',
    'Sofia Chen',
    'Dynamic acrylic exploration of midnight rainfall on illuminated city pavements. Fluid glazes meet sharp palette-knife textures to evoke movement and emotional intensity.',
    2,
    'Acrylic on Birch Panel',
    '36 x 36 inches (91 x 91 cm)',
    2026,
    1950.00,
    'USD',
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
    FALSE,
    'available',
    FALSE
),
(
    'Serenade of Whispering Pines',
    'Julian Brandt',
    'A tranquil Nordic mountain landscape bathed in the alpine glow of late autumn. Textural layers give tangible presence to evergreens, stone, and crystal-clear reflective water.',
    5,
    'Oil on Stretched Canvas',
    '38 x 52 inches (96 x 132 cm)',
    2025,
    3100.00,
    'USD',
    'https://images.unsplash.com/photo-1578925518470-4def7a0f08bb?auto=format&fit=crop&w=1200&q=80',
    TRUE,
    'available',
    TRUE
);

-- Sample Initial Inquiry
INSERT INTO inquiries (
    inquiry_code,
    painting_id,
    user_id,
    customer_name,
    customer_email,
    customer_phone,
    shipping_address,
    preferred_contact,
    message,
    quoted_price,
    status,
    admin_notes
) VALUES (
    'INQ-2026-001',
    1,
    2,
    'Jane Sterling',
    'customer@artweb.com',
    '+1 (555) 748-9922',
    '452 Blossom Street, Apt 3B, San Francisco, CA 94102',
    'whatsapp',
    'Hello, I am interested in Echoes of the Golden Horizon for my living room wall. Does it come with certificate of authenticity? Please contact me on WhatsApp.',
    3450.00,
    'new',
    'Customer prefers WhatsApp contact during afternoon PT hours.'
);
