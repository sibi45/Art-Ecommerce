from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Banner, User
from app.schemas import BannerResponse, BannerCreate, BannerUpdate
from app.dependencies import get_current_admin

router = APIRouter(tags=["Hero Banners"])

# ---------------- Public Hero Banner Endpoint ----------------
@router.get("/banners", response_model=List[BannerResponse])
def get_active_banners(db: Session = Depends(get_db)):
    """Retrieve all active banners for the customer store hero section."""
    return db.query(Banner).filter(Banner.is_active == True).order_by(Banner.display_order.asc(), Banner.created_at.desc()).all()


# ---------------- Admin Banner Management Endpoints ----------------
@router.get("/admin/banners", response_model=List[BannerResponse])
def get_all_banners_admin(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Retrieve all banners (active and inactive) for admin management."""
    return db.query(Banner).order_by(Banner.display_order.asc(), Banner.created_at.desc()).all()


@router.post("/admin/banners", response_model=BannerResponse, status_code=status.HTTP_201_CREATED)
def create_banner(
    banner_in: BannerCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Create a new hero banner."""
    banner = Banner(**banner_in.model_dump())
    db.add(banner)
    db.commit()
    db.refresh(banner)
    return banner


@router.put("/admin/banners/{banner_id}", response_model=BannerResponse)
def update_banner(
    banner_id: int,
    banner_in: BannerUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Update any content, image, text, or styling of a banner."""
    banner = db.query(Banner).filter(Banner.id == banner_id).first()
    if not banner:
        raise HTTPException(status_code=404, detail="Banner not found")

    update_data = banner_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(banner, field, value)

    db.commit()
    db.refresh(banner)
    return banner


@router.put("/admin/banners/{banner_id}/toggle-active", response_model=BannerResponse)
def toggle_banner_active(
    banner_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Toggle a banner's active status."""
    banner = db.query(Banner).filter(Banner.id == banner_id).first()
    if not banner:
        raise HTTPException(status_code=404, detail="Banner not found")

    banner.is_active = not banner.is_active
    db.commit()
    db.refresh(banner)
    return banner


@router.delete("/admin/banners/{banner_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_banner(
    banner_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Delete a hero banner."""
    banner = db.query(Banner).filter(Banner.id == banner_id).first()
    if not banner:
        raise HTTPException(status_code=404, detail="Banner not found")

    db.delete(banner)
    db.commit()
    return None
