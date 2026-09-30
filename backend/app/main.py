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
from app.routers import auth, paintings, inquiries, admin, banners, sections, testimonials, footer

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
            """))
            conn.commit()
    except Exception as me:
        print(f"Migration note: {me}")

    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        # 1. Seed Admin User if not present
        admin_user = db.query(User).filter(User.email == settings.DEFAULT_ADMIN_EMAIL).first()
        if not admin_user:
            admin_user = User(
                full_name=settings.DEFAULT_ADMIN_NAME,
                email=settings.DEFAULT_ADMIN_EMAIL,
                hashed_password=get_password_hash(settings.DEFAULT_ADMIN_PASSWORD),
                phone="+1 (555) 019-2831",
                address="124 Museum Way",
                city="New York",
                role="admin",
                is_active=True
            )
            db.add(admin_user)

        # 2. Seed Sample Customer if not present
        customer_user = db.query(User).filter(User.email == "customer@artweb.com").first()
        if not customer_user:
            customer_user = User(
                full_name="Jane Sterling",
                email="customer@artweb.com",
                hashed_password=get_password_hash("User@123"),
                phone="+1 (555) 748-9922",
                address="452 Blossom Street, Apt 3B",
                city="San Francisco",
                role="customer",
                is_active=True
            )
            db.add(customer_user)

        # 3. Seed Default Categories if empty
        if db.query(Category).count() == 0:
            categories_data = [
                Category(name="Oil Painting", slug="oil-painting", description="Rich, textured traditional and modern oil paintings on stretched canvas"),
                Category(name="Acrylics", slug="acrylics", description="Vibrant, fast-drying acrylic works featuring expressive strokes and modern palettes"),
                Category(name="Watercolor", slug="watercolor", description="Fluid, ethereal, and delicate translucent watercolor artwork on premium cotton paper"),
                Category(name="Abstract & Modern", slug="abstract-modern", description="Contemporary non-representational works evoking deep emotion, texture, and form"),
                Category(name="Landscape & Nature", slug="landscape-nature", description="Breathtaking scenic views, forests, mountains, ocean horizons, and floral scenes"),
                Category(name="Portrait & Figurative", slug="portrait-figurative", description="Expressive human forms, classical portraiture, and emotive character studies")
            ]
            db.add_all(categories_data)
            db.commit()

        # 4. Seed Sample Paintings if empty
        if db.query(Painting).count() == 0:
            cat_oil = db.query(Category).filter(Category.slug == "oil-painting").first()
            cat_acrylic = db.query(Category).filter(Category.slug == "acrylics").first()
            cat_water = db.query(Category).filter(Category.slug == "watercolor").first()
            cat_abstract = db.query(Category).filter(Category.slug == "abstract-modern").first()
            cat_portrait = db.query(Category).filter(Category.slug == "portrait-figurative").first()
            cat_landscape = db.query(Category).filter(Category.slug == "landscape-nature").first()

            paintings_data = [
                Painting(
                    title="Echoes of the Golden Horizon",
                    artist_name="Elena Rostova",
                    description="A breathtaking atmospheric oil study capturing the fleeting twilight moments across rugged coastal bluffs. Thick impasto strokes blend cadmium golds, deep prussian blues, and rose ochres.",
                    category_id=cat_oil.id if cat_oil else None,
                    medium="Oil on Heavy Linen Canvas",
                    dimensions="40 x 54 inches (102 x 137 cm)",
                    year_created=2025,
                    price=3450.00,
                    currency="USD",
                    image_url="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80",
                    is_framed=True,
                    status="available",
                    featured=True,
                    views_count=142
                ),
                Painting(
                    title="Symphony in Cobalt & Raw Sienna",
                    artist_name="Marcus Vance",
                    description="Bold gestural abstract composition meditating on urban energy and contemplative silence. Layers of raw pigment and dry brushing create extraordinary depth under varying gallery lighting.",
                    category_id=cat_abstract.id if cat_abstract else None,
                    medium="Mixed Media & Acrylic on Canvas",
                    dimensions="48 x 48 inches (122 x 122 cm)",
                    year_created=2026,
                    price=2800.00,
                    currency="USD",
                    image_url="https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80",
                    is_framed=False,
                    status="available",
                    featured=True,
                    views_count=98
                ),
                Painting(
                    title="Morning Mist over Tuscan Vineyards",
                    artist_name="Claire DeWitt",
                    description="Soft washes of sage, umber, and translucent gold bring the tranquil rolling hills of Tuscany into gentle focus. Museum-grade archival watercolor with handmade deckled edges.",
                    category_id=cat_water.id if cat_water else None,
                    medium="Watercolor on 300gsm Arches Paper",
                    dimensions="24 x 36 inches (61 x 91 cm)",
                    year_created=2025,
                    price=1650.00,
                    currency="USD",
                    image_url="https://images.unsplash.com/photo-1582561424760-0321d75e81fa?auto=format&fit=crop&w=1200&q=80",
                    is_framed=True,
                    status="available",
                    featured=False,
                    views_count=67
                ),
                Painting(
                    title="Solitude of the Gilded Muse",
                    artist_name="Aurelius Thorne",
                    description="Classical figurative study rendered with Renaissance chiaroscuro technique. Gold leaf accents harmonize with deep umber shadows, celebrating introspective human warmth.",
                    category_id=cat_portrait.id if cat_portrait else None,
                    medium="Oil and 24k Gold Leaf on Belgian Canvas",
                    dimensions="30 x 42 inches (76 x 107 cm)",
                    year_created=2025,
                    price=4200.00,
                    currency="USD",
                    image_url="https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1200&q=80",
                    is_framed=True,
                    status="available",
                    featured=True,
                    views_count=215
                ),
                Painting(
                    title="Crimson Nocturne",
                    artist_name="Sofia Chen",
                    description="Dynamic acrylic exploration of midnight rainfall on illuminated city pavements. Fluid glazes meet sharp palette-knife textures to evoke movement and emotional intensity.",
                    category_id=cat_acrylic.id if cat_acrylic else None,
                    medium="Acrylic on Birch Panel",
                    dimensions="36 x 36 inches (91 x 91 cm)",
                    year_created=2026,
                    price=1950.00,
                    currency="USD",
                    image_url="https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80",
                    is_framed=False,
                    status="available",
                    featured=False,
                    views_count=43
                ),
                Painting(
                    title="Serenade of Whispering Pines",
                    artist_name="Julian Brandt",
                    description="A tranquil Nordic mountain landscape bathed in the alpine glow of late autumn. Textural layers give tangible presence to evergreens, stone, and crystal-clear reflective water.",
                    category_id=cat_landscape.id if cat_landscape else None,
                    medium="Oil on Stretched Canvas",
                    dimensions="38 x 52 inches (96 x 132 cm)",
                    year_created=2025,
                    price=3100.00,
                    currency="USD",
                    image_url="https://images.unsplash.com/photo-1578925518470-4def7a0f08bb?auto=format&fit=crop&w=1200&q=80",
                    is_framed=True,
                    status="available",
                    featured=True,
                    views_count=189
                )
            ]
            db.add_all(paintings_data)

        # 5. Seed Default Product Sections if empty
        if db.query(ProductSection).count() == 0:
            sec_best = ProductSection(
                name="Best Sellers",
                slug="best-sellers",
                description="Our most celebrated and sought-after original artworks",
                display_order=1,
                is_active=True
            )
            sec_new = ProductSection(
                name="New Arrivals",
                slug="new-arrivals",
                description="Freshly created and curated works just added to the gallery",
                display_order=2,
                is_active=True
            )
            sec_hot = ProductSection(
                name="Hot Sales",
                slug="hot-sales",
                description="High-demand pieces with exceptional curation and limited availability",
                display_order=3,
                is_active=True
            )
            db.add_all([sec_best, sec_new, sec_hot])
            db.commit()

            # Assign some initial paintings to sections
            all_paintings = db.query(Painting).all()
            for idx, p in enumerate(all_paintings):
                if idx % 3 == 0:
                    p.section_id = sec_best.id
                elif idx % 3 == 1:
                    p.section_id = sec_new.id
                else:
                    p.section_id = sec_hot.id
            db.commit()

        # 6. Seed Default Testimonials if empty
        if db.query(Testimonial).count() == 0:
            testimonials_data = [
                Testimonial(
                    name="Meera Iyer",
                    location="Chennai",
                    quote="The custom silk artwork sat perfectly. The finish and textures were thoroughly taken seriously.",
                    rating=5,
                    display_order=1,
                    is_active=True
                ),
                Testimonial(
                    name="Rhea Kapoor",
                    location="Mumbai",
                    quote="Quiet luxury. The ivory Banarasi fine art piece is our interior centerpiece now.",
                    rating=5,
                    display_order=2,
                    is_active=True
                ),
                Testimonial(
                    name="Nandini Rao",
                    location="Hyderabad",
                    quote="Clear communication and a beautiful finish on the zardozi work. Arrived in pristine museum crating.",
                    rating=5,
                    display_order=3,
                    is_active=True
                ),
            ]
            db.add_all(testimonials_data)
            db.commit()

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
