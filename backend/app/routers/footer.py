import os
import uuid
import shutil
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from PIL import Image

from app.database import get_db
from app.models import FooterConfig, User
from app.schemas import FooterConfigResponse, FooterConfigUpdate
from app.dependencies import get_current_admin

router = APIRouter(tags=["Footer"])

DEFAULT_FEATURE_BADGES = [
    {
        "icon": "truck",
        "title": "FREE GLOBAL INSURED DELIVERY",
        "subtitle": "Climate-controlled custom art crates"
    },
    {
        "icon": "shield",
        "title": "100% AUTHENTICITY GUARANTEE",
        "subtitle": "Signed certificate with forensic provenance"
    },
    {
        "icon": "refresh",
        "title": "30-DAY CURATED RETURN WINDOW",
        "subtitle": "Risk-free visual trial in your residence"
    }
]

DEFAULT_CUSTOM_LINKS = [
    {"title": "Direct WhatsApp Advisory", "url": "#"},
    {"title": "Custom Bespoke Framing", "url": "#"},
    {"title": "Art Authentication Registry", "url": "#"},
    {"title": "White-Glove Courier Setup", "url": "#"}
]

def get_or_create_footer_config(db: Session) -> FooterConfig:
    config = db.query(FooterConfig).first()
    if not config:
        config = FooterConfig(
            brand_name="",
            brand_subtitle="",
            brand_logo_url="",
            brand_description="Original Fine Art, Curated Paintings & Bespoke Framing.",
            studio_location="Studio: Mumbai & Chennai, India",
            payment_image_url="https://preview.colorlib.com/theme/malefashion/img/payment.png",
            show_payment_methods=False,
            feature_badges=DEFAULT_FEATURE_BADGES,
            categories_title="CURATED CATEGORIES",
            max_categories_to_show=7,
            custom_column_title="CURATION DESK",
            custom_links=DEFAULT_CUSTOM_LINKS,
            newsletter_title="NEWSLETTER",
            newsletter_description="Be the first to know about new arrivals, private salon exhibitions & exclusive sales!",
            newsletter_placeholder="Your email",
            copyright_text="Copyright © 2026 All rights reserved | Art Gallery Curations & Studio",
            contact_phone="+91 98765 43210",
            contact_email="support@artweb.com",
            social_links={
                "instagram": "https://instagram.com",
                "facebook": "https://facebook.com",
                "twitter": "https://twitter.com",
                "whatsapp": "+91 98765 43210",
                "logo_width": 240
            }
        )
        db.add(config)
        db.commit()
        db.refresh(config)
    return config


# ----------------- Public Customer Endpoints -----------------
@router.get("/footer", response_model=FooterConfigResponse)
def get_public_footer(db: Session = Depends(get_db)):
    """Retrieve storefront footer configuration."""
    return get_or_create_footer_config(db)


# ----------------- Admin Management Endpoints -----------------
@router.get("/admin/footer", response_model=FooterConfigResponse)
def get_admin_footer(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Retrieve footer configuration for admin editing."""
    return get_or_create_footer_config(db)


@router.put("/admin/footer", response_model=FooterConfigResponse)
def update_footer_config(
    footer_in: FooterConfigUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Update footer configuration and save changes."""
    config = get_or_create_footer_config(db)

    update_dict = footer_in.model_dump(exclude_unset=True)

    # Convert pydantic models inside lists if present
    if "feature_badges" in update_dict and update_dict["feature_badges"] is not None:
        config.feature_badges = [
            b if isinstance(b, dict) else b.model_dump()
            for b in update_dict["feature_badges"]
        ]
    if "custom_links" in update_dict and update_dict["custom_links"] is not None:
        config.custom_links = [
            l if isinstance(l, dict) else l.model_dump()
            for l in update_dict["custom_links"]
        ]

    for key, value in update_dict.items():
        if key not in ("feature_badges", "custom_links"):
            setattr(config, key, value)

    db.commit()
    db.refresh(config)
    return config


@router.post("/admin/footer/upload-logo")
def upload_store_logo(
    file: UploadFile = File(...),
    admin: User = Depends(get_current_admin)
):
    """Upload store logo and automatically trim excess whitespace borders."""
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif"]:
        raise HTTPException(status_code=400, detail="Only image files (.png, .jpg, .jpeg, .webp, .svg, .gif) are allowed")

    upload_dir = os.path.join(os.getcwd(), "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    file_name = f"logo_{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(upload_dir, file_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Automatically trim excess whitespace borders for raster formats
    if ext in [".jpg", ".jpeg", ".png", ".webp"]:
        try:
            with Image.open(file_path) as im:
                if im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info):
                    rgba = im.convert('RGBA')
                    alpha = rgba.split()[3]
                    bbox = alpha.getbbox()
                else:
                    gray = im.convert('L')
                    non_bg = [(x, y) for y in range(im.height) for x in range(im.width) if gray.getpixel((x, y)) < 238]
                    if non_bg:
                        x1 = max(0, min(x for x, y in non_bg) - 10)
                        y1 = max(0, min(y for x, y in non_bg) - 8)
                        x2 = min(im.width, max(x for x, y in non_bg) + 10)
                        y2 = min(im.height, max(y for x, y in non_bg) + 8)
                        bbox = (x1, y1, x2, y2)
                    else:
                        bbox = None

                if bbox:
                    cropped = im.crop(bbox)
                    cropped.save(file_path, quality=95)
        except Exception:
            pass

    return {"url": f"/uploads/{file_name}", "filename": file_name}


@router.post("/admin/footer/trim-logo")
def trim_existing_logo(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Trim excess whitespace borders from the current store logo."""
    config = get_or_create_footer_config(db)
    if not config.brand_logo_url:
        raise HTTPException(status_code=400, detail="No logo currently configured to trim")

    url_path = config.brand_logo_url
    if "/uploads/" in url_path:
        filename = url_path.split("/uploads/")[-1]
        file_path = os.path.join(os.getcwd(), "uploads", filename)
        if os.path.exists(file_path):
            try:
                with Image.open(file_path) as im:
                    if im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info):
                        rgba = im.convert('RGBA')
                        bbox = rgba.split()[3].getbbox()
                    else:
                        gray = im.convert('L')
                        non_bg = [(x, y) for y in range(im.height) for x in range(im.width) if gray.getpixel((x, y)) < 238]
                        bbox = (
                            max(0, min(x for x, y in non_bg) - 10),
                            max(0, min(y for x, y in non_bg) - 8),
                            min(im.width, max(x for x, y in non_bg) + 10),
                            min(im.height, max(y for x, y in non_bg) + 8)
                        ) if non_bg else None
                    if bbox:
                        cropped = im.crop(bbox)
                        cropped.save(file_path, quality=95)
                return {"message": "Logo whitespace trimmed successfully!", "url": config.brand_logo_url}
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to trim logo: {str(e)}")
    return {"message": "Logo is external or already optimized"}

