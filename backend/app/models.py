from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Numeric, Boolean,
    DateTime, ForeignKey, Enum, JSON
)
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    phone = Column(String(30), nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    role = Column(String(20), default="customer", index=True) # "customer" or "admin"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    inquiries = relationship("Inquiry", back_populates="user", cascade="all, delete-orphan")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(80), unique=True, nullable=False)
    slug = Column(String(80), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    paintings = relationship("Painting", back_populates="category")


class ProductSection(Base):
    __tablename__ = "product_sections"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    paintings = relationship("Painting", back_populates="section")


class Painting(Base):
    __tablename__ = "paintings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    artist_name = Column(String(120), nullable=False, default="Master Artist")
    description = Column(Text, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    section_id = Column(Integer, ForeignKey("product_sections.id", ondelete="SET NULL"), nullable=True)
    medium = Column(String(100), nullable=False)
    dimensions = Column(String(100), nullable=False)
    year_created = Column(Integer, nullable=True)
    price = Column(Numeric(12, 2), nullable=False)
    mrp = Column(Numeric(12, 2), nullable=True)
    currency = Column(String(10), default="INR")
    image_url = Column(Text, nullable=False)
    image_url_2 = Column(Text, nullable=True)
    image_url_3 = Column(Text, nullable=True)
    is_framed = Column(Boolean, default=False)
    status = Column(String(30), default="available", index=True) # "available", "reserved", "sold", "inactive"
    featured = Column(Boolean, default=False, index=True)
    views_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    category = relationship("Category", back_populates="paintings")
    section = relationship("ProductSection", back_populates="paintings")
    inquiries = relationship("Inquiry", back_populates="painting", cascade="all, delete-orphan")


class Inquiry(Base):
    __tablename__ = "inquiries"

    id = Column(Integer, primary_key=True, index=True)
    inquiry_code = Column(String(30), unique=True, index=True, nullable=False)
    painting_id = Column(Integer, ForeignKey("paintings.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    customer_name = Column(String(100), nullable=False)
    customer_email = Column(String(150), nullable=False)
    customer_phone = Column(String(30), nullable=False)
    shipping_address = Column(Text, nullable=False)
    preferred_contact = Column(String(30), default="whatsapp") # "whatsapp", "phone", "email"
    message = Column(Text, nullable=True)
    quoted_price = Column(Numeric(12, 2), nullable=False)
    
    status = Column(String(30), default="new", index=True) # "new", "contacted", "negotiating", "confirmed", "completed", "cancelled"
    admin_notes = Column(Text, nullable=True)
    contacted_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    painting = relationship("Painting", back_populates="inquiries")
    user = relationship("User", back_populates="inquiries")


class Banner(Base):
    __tablename__ = "banners"

    id = Column(Integer, primary_key=True, index=True)
    tag = Column(String(150), default="ABSTRACT & MODERN CURATION", nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    button_text = Column(String(60), default="SHOP NOW", nullable=False)
    image_url = Column(Text, nullable=False)
    artist_name = Column(String(120), default="Master Artist", nullable=False)
    price = Column(Numeric(12, 2), default=0.0, nullable=False)
    circle_color = Column(String(30), default="#edd9ce", nullable=False)
    bg_color = Column(String(50), default="#f3f2ee", nullable=False)
    text_color = Column(String(50), default="#ffffff", nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Testimonial(Base):
    __tablename__ = "testimonials"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    location = Column(String(120), nullable=True) # e.g. Chennai, Mumbai
    quote = Column(Text, nullable=False)
    rating = Column(Integer, default=5, nullable=False) # 1 to 5 stars
    avatar_url = Column(Text, nullable=True)
    display_order = Column(Integer, default=1, nullable=False)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class FooterConfig(Base):
    __tablename__ = "footer_config"

    id = Column(Integer, primary_key=True, index=True)
    brand_name = Column(String(120), default="shopbypriya", nullable=False)
    brand_subtitle = Column(String(200), default="HANDCRAFTED SILK & READY-TO-SHIP BLOUSES", nullable=True)
    brand_description = Column(Text, default="Atelier blouses for sarees. Ready-made and made to measure.", nullable=False)
    studio_location = Column(String(200), default="Studio: Mumbai & Chennai, India", nullable=True)
    payment_image_url = Column(Text, default="https://preview.colorlib.com/theme/malefashion/img/payment.png", nullable=True)
    show_payment_methods = Column(Boolean, default=False)

    # List of badges: [{"icon": "truck", "title": "...", "subtitle": "..."}]
    feature_badges = Column(JSON, default=list, nullable=False)

    categories_title = Column(String(120), default="CURATED CATEGORIES", nullable=False)
    max_categories_to_show = Column(Integer, default=7, nullable=False)

    custom_column_title = Column(String(120), default="CURATION DESK", nullable=False)
    custom_links = Column(JSON, default=list, nullable=False)

    newsletter_title = Column(String(120), default="NEWSLETTER", nullable=False)
    newsletter_description = Column(Text, default="Be the first to know about new arrivals, private salon exhibitions & exclusive sales!", nullable=False)
    newsletter_placeholder = Column(String(120), default="Your email", nullable=False)

    copyright_text = Column(String(255), default="Copyright © 2026 All rights reserved | Art Gallery Curations & Studio", nullable=False)

    contact_phone = Column(String(60), default="+91 98765 43210", nullable=True)
    contact_email = Column(String(120), default="hello@shopbypriya.com", nullable=True)
    social_links = Column(JSON, default=dict, nullable=True)

    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
