from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field

# ----------------- Auth & User Schemas -----------------
class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None

class UserRegister(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    old_password: Optional[str] = None
    new_password: str = Field(..., min_length=6)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ----------------- Category Schemas -----------------
class CategoryBase(BaseModel):
    name: str
    slug: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None

class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime
    paintings_count: Optional[int] = 0

    class Config:
        from_attributes = True


# ----------------- Product Section Schemas -----------------
class ProductSectionBase(BaseModel):
    name: str
    slug: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    display_order: int = 0
    is_active: bool = True

class ProductSectionCreate(ProductSectionBase):
    pass

class ProductSectionUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None

class ProductSectionResponse(ProductSectionBase):
    id: int
    created_at: datetime
    paintings_count: Optional[int] = 0

    class Config:
        from_attributes = True


# ----------------- Painting Schemas -----------------
class PaintingBase(BaseModel):
    title: str
    artist_name: str = "Master Artist"
    description: str
    category_id: Optional[int] = None
    section_id: Optional[int] = None
    medium: str
    dimensions: str
    year_created: Optional[int] = None
    price: float
    mrp: Optional[float] = None
    currency: str = "INR"
    image_url: str
    image_url_2: Optional[str] = None
    image_url_3: Optional[str] = None
    is_framed: bool = False
    status: str = "available" # available, reserved, sold, inactive
    featured: bool = False

class PaintingCreate(PaintingBase):
    pass

class PaintingUpdate(BaseModel):
    title: Optional[str] = None
    artist_name: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    section_id: Optional[int] = None
    medium: Optional[str] = None
    dimensions: Optional[str] = None
    year_created: Optional[int] = None
    price: Optional[float] = None
    mrp: Optional[float] = None
    currency: Optional[str] = None
    image_url: Optional[str] = None
    image_url_2: Optional[str] = None
    image_url_3: Optional[str] = None
    is_framed: Optional[bool] = None
    status: Optional[str] = None
    featured: Optional[bool] = None

class PaintingResponse(PaintingBase):
    id: int
    uuid: Optional[str] = None
    views_count: int
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryResponse] = None
    section: Optional[ProductSectionResponse] = None

    class Config:
        from_attributes = True


# ----------------- Inquiry Schemas -----------------
class InquiryCreate(BaseModel):
    painting_id: int
    customer_phone: str
    shipping_address: str
    preferred_contact: str = "whatsapp" # whatsapp, phone, email
    message: Optional[str] = None

class InquiryStatusUpdate(BaseModel):
    status: str # new, contacted, negotiating, confirmed, completed, cancelled
    admin_notes: Optional[str] = None

class InquiryResponse(BaseModel):
    id: int
    inquiry_code: str
    painting_id: int
    user_id: int
    customer_name: str
    customer_email: str
    customer_phone: str
    shipping_address: str
    preferred_contact: str
    message: Optional[str] = None
    quoted_price: float
    status: str
    admin_notes: Optional[str] = None
    contacted_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    painting: Optional[PaintingResponse] = None
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True


# ----------------- Admin Analytics -----------------
class AdminDashboardStats(BaseModel):
    total_paintings: int
    available_paintings: int
    sold_paintings: int
    total_inquiries: int
    new_inquiries: int
    confirmed_orders: int
    estimated_pipeline_value: float


# ----------------- Banner Schemas -----------------
class BannerBase(BaseModel):
    tag: str = "ABSTRACT & MODERN CURATION"
    title: str
    description: str
    button_text: str = "SHOP NOW"
    image_url: str
    artist_name: str = "Master Artist"
    price: float = 0.0
    circle_color: str = "#edd9ce"
    bg_color: str = "#f3f2ee"
    text_color: Optional[str] = "#ffffff"
    is_active: bool = True
    display_order: int = 0

class BannerCreate(BannerBase):
    pass

class BannerUpdate(BaseModel):
    tag: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    button_text: Optional[str] = None
    image_url: Optional[str] = None
    artist_name: Optional[str] = None
    price: Optional[float] = None
    circle_color: Optional[str] = None
    bg_color: Optional[str] = None
    text_color: Optional[str] = None
    is_active: Optional[bool] = None
    display_order: Optional[int] = None

class BannerResponse(BannerBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ----------------- Testimonial Schemas -----------------
class TestimonialBase(BaseModel):
    name: str
    location: Optional[str] = None
    quote: str
    rating: int = 5
    avatar_url: Optional[str] = None
    display_order: int = 1
    is_active: bool = True

class TestimonialCreate(TestimonialBase):
    pass

class TestimonialUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    quote: Optional[str] = None
    rating: Optional[int] = None
    avatar_url: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None

class TestimonialResponse(TestimonialBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ----------------- Footer Configuration Schemas -----------------
class FeatureBadgeItem(BaseModel):
    icon: str = "truck"
    title: str
    subtitle: str

class CustomLinkItem(BaseModel):
    title: str
    url: str = "#"

class FooterConfigBase(BaseModel):
    brand_name: Optional[str] = ""
    brand_subtitle: Optional[str] = ""
    brand_logo_url: Optional[str] = None
    brand_description: str = "Original Fine Art, Curated Paintings & Bespoke Framing."
    studio_location: Optional[str] = "Studio: Mumbai & Chennai, India"
    payment_image_url: Optional[str] = "https://preview.colorlib.com/theme/malefashion/img/payment.png"
    show_payment_methods: bool = False

    feature_badges: List[FeatureBadgeItem] = Field(default_factory=list)

    categories_title: str = "CURATED CATEGORIES"
    max_categories_to_show: int = 7

    custom_column_title: str = "CURATION DESK"
    custom_links: List[CustomLinkItem] = Field(default_factory=list)

    newsletter_title: str = "NEWSLETTER"
    newsletter_description: str = "Be the first to know about new arrivals, private salon exhibitions & exclusive sales!"
    newsletter_placeholder: str = "Your email"

    copyright_text: str = "Copyright © 2026 All rights reserved | Art Gallery Curations & Studio"

    contact_phone: Optional[str] = "+91 98765 43210"
    contact_email: Optional[str] = "support@artweb.com"
    social_links: Optional[dict] = None

class FooterConfigUpdate(BaseModel):
    brand_name: Optional[str] = None
    brand_subtitle: Optional[str] = None
    brand_logo_url: Optional[str] = None
    brand_description: Optional[str] = None
    studio_location: Optional[str] = None
    payment_image_url: Optional[str] = None
    show_payment_methods: Optional[bool] = None

    feature_badges: Optional[List[FeatureBadgeItem]] = None

    categories_title: Optional[str] = None
    max_categories_to_show: Optional[int] = None

    custom_column_title: Optional[str] = None
    custom_links: Optional[List[CustomLinkItem]] = None

    newsletter_title: Optional[str] = None
    newsletter_description: Optional[str] = None
    newsletter_placeholder: Optional[str] = None

    copyright_text: Optional[str] = None

    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    social_links: Optional[dict] = None

class FooterConfigResponse(FooterConfigBase):
    id: int
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ----------------- Showcase Item Schemas -----------------
class ShowcaseItemBase(BaseModel):
    image_url: str
    title: Optional[str] = None
    tag: Optional[str] = "FEATURED"
    description: Optional[str] = None
    display_order: int = 1
    is_active: bool = True

class ShowcaseItemCreate(ShowcaseItemBase):
    pass

class ShowcaseItemUpdate(BaseModel):
    image_url: Optional[str] = None
    title: Optional[str] = None
    tag: Optional[str] = None
    description: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None

class ShowcaseItemResponse(ShowcaseItemBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True



