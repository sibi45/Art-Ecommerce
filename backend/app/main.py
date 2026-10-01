import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.models import User, Category, Painting, ProductSection, Testimonial, FooterConfig
from app.security import get_password_hash
from app.routers import auth, paintings, inquiries, admin, banners, sections, testimonials, footer, showcases

# Automatic table creation & default data seed on startup
def init_db_and_seed():
    # Run manual migration for product_sections and paintings.section_id
    try:
        with engine.connect() as conn:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS product_sections (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100) UNIQUE NOT NULL,
                    slug VARCHAR(100) UNIQUE NOT NULL,
                    description TEXT,
                    display_order INTEGER DEFAULT 0,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc')
                );
                ALTER TABLE paintings ADD COLUMN IF NOT EXISTS section_id INTEGER REFERENCES product_sections(id) ON DELETE SET NULL;
                ALTER TABLE paintings ADD COLUMN IF NOT EXISTS mrp NUMERIC(12, 2);
                ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url TEXT;

                CREATE TABLE IF NOT EXISTS testimonials (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(120) NOT NULL,
                    location VARCHAR(120),
                    quote TEXT NOT NULL,
                    rating INTEGER DEFAULT 5 NOT NULL,
                    avatar_url TEXT,
                    display_order INTEGER DEFAULT 1 NOT NULL,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc'),
                    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc')
                );

                CREATE TABLE IF NOT EXISTS footer_config (
                    id SERIAL PRIMARY KEY,
                    brand_name VARCHAR(120) DEFAULT 'Art Gallery' NOT NULL,
                    brand_description TEXT NOT NULL,
                    payment_image_url TEXT,
                    show_payment_methods BOOLEAN DEFAULT TRUE,
                    feature_badges JSON NOT NULL,
                    categories_title VARCHAR(120) DEFAULT 'CURATED CATEGORIES' NOT NULL,
                    max_categories_to_show INTEGER DEFAULT 7 NOT NULL,
                    custom_column_title VARCHAR(120) DEFAULT 'CURATION DESK' NOT NULL,
                    custom_links JSON NOT NULL,
                    newsletter_title VARCHAR(120) DEFAULT 'NEWSLETTER' NOT NULL,
                    newsletter_description TEXT NOT NULL,
                    newsletter_placeholder VARCHAR(120) DEFAULT 'Your email' NOT NULL,
                    copyright_text VARCHAR(255) DEFAULT 'Copyright © 2026 All rights reserved | Art Gallery Curations & Studio' NOT NULL,
                    contact_phone VARCHAR(60),
                    contact_email VARCHAR(120),
                    social_links JSON,
                    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc')
                );
                ALTER TABLE footer_config ADD COLUMN IF NOT EXISTS brand_subtitle VARCHAR(200);
                ALTER TABLE footer_config ADD COLUMN IF NOT EXISTS studio_location VARCHAR(200);
                ALTER TABLE product_sections ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

                CREATE TABLE IF NOT EXISTS showcase_items (
                    id SERIAL PRIMARY KEY,
                    image_url TEXT NOT NULL,
                    title VARCHAR(200),
                    tag VARCHAR(100) DEFAULT 'FEATURED',
                    description TEXT,
                    display_order INTEGER DEFAULT 1 NOT NULL,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc'),
                    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc')
                );
            """))
            conn.commit()
    except Exception as me:
        print(f"Migration note: {me}")

    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        # 1. Seed Admin User if not present (only hardcoded item — everything else via Admin Dashboard)
        admin_user = db.query(User).filter(User.email == settings.DEFAULT_ADMIN_EMAIL).first()
        if not admin_user:
            admin_user = User(
                full_name=settings.DEFAULT_ADMIN_NAME,
                email=settings.DEFAULT_ADMIN_EMAIL,
                hashed_password=get_password_hash(settings.DEFAULT_ADMIN_PASSWORD),
                phone="",
                address="",
                city="",
                role="admin",
                is_active=True
            )
            db.add(admin_user)

        # 2. Seed default "Trending Products" section if not present
        trending_sec = db.query(ProductSection).filter(
            (ProductSection.slug == "trending-products") | (ProductSection.name == "Trending Products")
        ).first()
        if not trending_sec:
            trending_sec = ProductSection(
                name="Trending Products",
                slug="trending-products",
                description="Our most sought-after artworks and trending collector pieces.",
                display_order=1,
                is_active=True
            )
            db.add(trending_sec)

        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Database initialization error: {e}")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure uploads directory exists
    os.makedirs("uploads", exist_ok=True)
    # Initialize DB & Seed data
    init_db_and_seed()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Production-ready FastAPI backend for Art Painting E-Commerce & Inquiries",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to settings.cors_origins_list
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount local uploads for static serving
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(paintings.router, prefix=settings.API_V1_STR)
app.include_router(inquiries.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(banners.router, prefix=settings.API_V1_STR)
app.include_router(sections.router, prefix=settings.API_V1_STR)
app.include_router(testimonials.router, prefix=settings.API_V1_STR)
app.include_router(footer.router, prefix=settings.API_V1_STR)
app.include_router(showcases.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "documentation": "/docs",
        "health": "ok"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
