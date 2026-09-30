# ArtWeb — Fine Art Painting E-Commerce & Acquisition Platform

A full-stack, production-grade e-commerce application for original paintings built with **React + TypeScript** (Frontend) and **FastAPI** (Backend) with **PostgreSQL** schema support.

---

## 🌟 Core Architecture & Flow Highlights

1. **Authenticated Customer Purchase Flow (Inquiry Model)**:
   - Customers can browse original paintings, filter by medium/category, and inspect high-resolution artworks.
   - To buy or initiate an acquisition, **the customer must be logged in**. Unauthenticated visitors are automatically prompted to sign in or register.
   - When a logged-in customer clicks **"Inquire to Buy"**, no instant credit card charge occurs. Instead, an **Acquisition Inquiry** is created with the customer's phone number, shipping address, preferred contact channel (**WhatsApp**, Phone Call, or Email), and custom notes.
   - The painting status updates to `reserved` and a unique inquiry reference (e.g. `INQ-2026-XXXX`) is issued.
   - The gallery team contacts the collector directly to confirm certificate of authenticity, delivery crating, and process external/tailored payment.
   - Customers can track all their acquisition requests live under **"My Inquiries"**.

2. **Curator Admin Dashboard**:
   - **Metrics & Pipeline Valuation**: Live counts of total paintings, available works, sold pieces, pending inquiries, confirmed orders, and total active pipeline value in USD.
   - **Artwork Catalog Management**: Upload new artworks (with image file upload or direct URL, medium, dimensions, price, framed status, curatorial description), edit details, toggle availability, or delete artworks.
   - **Inquiries & Orders CRM**: Real-time table of all collector inquiries with customer contact info, phone, address, and **1-click WhatsApp quick-contact link**. Change status (`New` ➔ `Contacted` ➔ `Negotiating` ➔ `Confirmed` ➔ `Completed` ➔ `Cancelled`) and save internal curator notes.

---

## 🗂️ Production Folder Structure

```
ArtWeb/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app, CORS, static uploads, auto-seeder
│   │   ├── config.py            # Pydantic environment settings
│   │   ├── database.py          # SQLAlchemy engine (Postgres / SQLite)
│   │   ├── models.py            # ORM Models (User, Category, Painting, Inquiry)
│   │   ├── schemas.py           # Pydantic request/response validation schemas
│   │   ├── security.py          # Bcrypt password hashing & JWT token generator
│   │   ├── dependencies.py      # Auth guards (get_current_user, get_current_admin)
│   │   └── routers/
│   │       ├── auth.py          # /api/auth/register, /api/auth/login, /api/auth/me
│   │       ├── paintings.py     # /api/paintings (Catalog, filter, admin CRUD, image upload)
│   │       ├── inquiries.py     # /api/inquiries (Auth-gated customer inquiries & tracking)
│   │       └── admin.py         # /api/admin/stats, categories management
│   ├── database/
│   │   └── schema.sql           # Complete PostgreSQL DDL & Seed queries
│   ├── uploads/                 # Local directory for uploaded artwork images
│   ├── requirements.txt         # Production Python packages
│   ├── .env.example             # Backend configuration template
│   ├── Dockerfile               # Containerized deployment file
│   └── render.yaml              # Render.com 1-click deployment configuration
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.tsx             # Sticky header, brand logo, auth controls & view switch
    │   │   ├── HeroSection.tsx        # Curated gallery banner with feature highlights
    │   │   ├── GalleryView.tsx        # Art catalog with search, medium filters & sorting
    │   │   ├── PaintingCard.tsx       # Artwork card with frame aesthetics, price & inquiry CTA
    │   │   ├── PaintingDetailModal.tsx# High-res preview, provenance & specs table
    │   │   ├── InquiryModal.tsx       # Purchase inquiry form with auth gating & offline notice
    │   │   ├── AuthModal.tsx          # Login & Register modal with 1-click Demo Fill buttons
    │   │   ├── CustomerInquiriesModal.tsx # Collector tracking portal
    │   │   ├── AdminDashboard.tsx     # Curator Command Center (Stats, Inventory, Inquiries CRM)
    │   │   └── Footer.tsx             # Gallery provenance guarantees & contacts
    │   ├── context/
    │   │   └── AuthContext.tsx        # React authentication context with JWT persistence
    │   ├── services/
    │   │   └── api.ts                 # Full typed API client
    │   ├── types/
    │   │   └── index.ts               # TypeScript interfaces
    │   ├── App.tsx                    # Main root component
    │   ├── index.css                  # Modern luxury dark-mode design system with gold accents
    │   └── main.tsx
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts
```

---

## 🗄️ Database Schema (PostgreSQL)

You can run `backend/database/schema.sql` directly inside your PostgreSQL database (e.g. **Neon.tech**, **Supabase**, or **Render PostgreSQL**):

```sql
-- 1. Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    address TEXT,
    city VARCHAR(100),
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories Table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(80) UNIQUE NOT NULL,
    slug VARCHAR(80) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Paintings Table
CREATE TABLE paintings (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    artist_name VARCHAR(120) NOT NULL DEFAULT 'Master Artist',
    description TEXT NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    medium VARCHAR(100) NOT NULL,
    dimensions VARCHAR(100) NOT NULL,
    year_created INTEGER,
    price NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    image_url TEXT NOT NULL,
    is_framed BOOLEAN DEFAULT FALSE,
    status VARCHAR(30) DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold')),
    featured BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Inquiries Table
CREATE TABLE inquiries (
    id SERIAL PRIMARY KEY,
    inquiry_code VARCHAR(30) UNIQUE NOT NULL,
    painting_id INTEGER NOT NULL REFERENCES paintings(id) ON DELETE RESTRICT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(30) NOT NULL,
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
```

*(Note: When you run the FastAPI backend, it automatically generates and seeds these tables if not already created!)*

---

## 🔑 Default Credentials (Pre-seeded)

| Role | Email | Password | Features Accessible |
| :--- | :--- | :--- | :--- |
| **Admin (Curator)** | `admin@artweb.com` | `Admin@123` | Full Admin Portal: Upload artwork, edit pricing, manage CRM inquiries, update status |
| **Customer (Collector)** | `customer@artweb.com` | `User@123` | Browse catalog, submit purchase inquiries, view "My Inquiries" tracking portal |

*Tip: The Sign In modal features **1-click quick-fill buttons** for both roles!*

---

## 🚀 Running Locally

### 1. Backend (FastAPI)
```bash
cd backend
# Create virtual environment (if not already done)
python -m venv venv
.\venv\Scripts\activate   # On Windows (or source venv/bin/activate on Mac/Linux)

# Install dependencies
pip install -r requirements.txt

# Run backend server
uvicorn app.main:app --reload --port 8080
```
- API Docs (Swagger UI): **`http://localhost:8080/docs`**
- API Health Check: **`http://localhost:8080/health`**

### 2. Frontend (React + TypeScript)
```bash
cd frontend
npm install
npm run dev
```
- Open browser at: **`http://localhost:5173`**

---

## 🌐 100% Free Production Deployment Guide

You can deploy this entire application completely **free of cost** using standard free-tier cloud platforms:

### Step 1: Free PostgreSQL Database (**Neon.tech** or **Supabase**)
1. Go to [neon.tech](https://neon.tech) or [supabase.com](https://supabase.com) and create a free account.
2. Create a new PostgreSQL project.
3. In the SQL Editor, copy and run the contents of [`backend/database/schema.sql`](./backend/database/schema.sql).
4. Copy your PostgreSQL connection string:
   ```
   postgresql://user:password@ep-sample-xyz.neon.tech/neondb?sslmode=require
   ```

### Step 2: Deploy Backend to **Render.com** (Free)
1. Push your repository to **GitHub**.
2. Sign in to [render.com](https://render.com) and click **New + ➔ Web Service**.
3. Select your GitHub repository.
4. Set the following options:
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`
5. In **Environment Variables**, add:
   - `DATABASE_URL`: *(Your Neon.tech / Supabase PostgreSQL connection string)*
   - `SECRET_KEY`: *(Any random 32+ character string)*
   - `CORS_ORIGINS`: `*`
6. Click **Deploy Web Service**. Render gives you a free public URL (e.g. `https://artweb-backend.onrender.com`).

### Step 3: Deploy Frontend to **Vercel** (Free)
1. Sign in to [vercel.com](https://vercel.com) and click **Add New Project**.
2. Import your GitHub repository.
3. Set **Root Directory** to `frontend`.
4. In **Environment Variables**, add:
   - `VITE_API_URL`: `https://artweb-backend.onrender.com/api` *(Your Render backend URL + `/api`)*
5. Click **Deploy**. Vercel will build and deploy your React + TypeScript frontend with free HTTPS and global CDN!
