from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import Testimonial, User
from app.schemas import (
    TestimonialResponse,
    TestimonialCreate,
    TestimonialUpdate
)
from app.dependencies import get_current_admin

router = APIRouter(tags=["Testimonials"])


# ----------------- Public Customer Endpoints -----------------
@router.get("/testimonials", response_model=List[TestimonialResponse])
def get_active_testimonials(db: Session = Depends(get_db)):
    """Retrieve all active patron testimonials for the storefront."""
    return (
        db.query(Testimonial)
        .filter(Testimonial.is_active == True)
        .order_by(Testimonial.display_order.asc(), Testimonial.id.asc())
        .all()
    )


# ----------------- Admin Management Endpoints -----------------
@router.get("/admin/testimonials", response_model=List[TestimonialResponse])
def get_all_testimonials_admin(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Retrieve all testimonials for admin management."""
    return (
        db.query(Testimonial)
        .order_by(Testimonial.display_order.asc(), Testimonial.id.asc())
        .all()
    )


@router.post("/admin/testimonials", response_model=TestimonialResponse, status_code=status.HTTP_201_CREATED)
def create_testimonial(
    testimonial_in: TestimonialCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Create a new patron testimonial."""
    name = testimonial_in.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Patron name cannot be empty.")
    
    quote = testimonial_in.quote.strip()
    if not quote:
        raise HTTPException(status_code=400, detail="Testimonial quote cannot be empty.")

    display_order = testimonial_in.display_order
    if display_order <= 0:
        max_order = db.query(func.max(Testimonial.display_order)).scalar() or 0
        display_order = max_order + 1

    testimonial = Testimonial(
        name=name,
        location=testimonial_in.location.strip() if testimonial_in.location else None,
        quote=quote,
        rating=max(1, min(5, testimonial_in.rating)),
        avatar_url=testimonial_in.avatar_url.strip() if testimonial_in.avatar_url else None,
        display_order=display_order,
        is_active=testimonial_in.is_active
    )
    db.add(testimonial)
    db.commit()
    db.refresh(testimonial)
    return testimonial


@router.put("/admin/testimonials/{testimonial_id}", response_model=TestimonialResponse)
def update_testimonial(
    testimonial_id: int,
    testimonial_in: TestimonialUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Update an existing testimonial."""
    testimonial = db.query(Testimonial).filter(Testimonial.id == testimonial_id).first()
    if not testimonial:
        raise HTTPException(status_code=404, detail="Testimonial not found.")

    update_data = testimonial_in.model_dump(exclude_unset=True)
    if "name" in update_data and update_data["name"]:
        testimonial.name = update_data["name"].strip()
    if "location" in update_data:
        testimonial.location = update_data["location"].strip() if update_data["location"] else None
    if "quote" in update_data and update_data["quote"]:
        testimonial.quote = update_data["quote"].strip()
    if "rating" in update_data and update_data["rating"] is not None:
        testimonial.rating = max(1, min(5, update_data["rating"]))
    if "avatar_url" in update_data:
        testimonial.avatar_url = update_data["avatar_url"].strip() if update_data["avatar_url"] else None
    if "display_order" in update_data and update_data["display_order"] is not None:
        testimonial.display_order = update_data["display_order"]
    if "is_active" in update_data and update_data["is_active"] is not None:
        testimonial.is_active = update_data["is_active"]

    db.commit()
    db.refresh(testimonial)
    return testimonial


@router.put("/admin/testimonials/{testimonial_id}/toggle-active", response_model=TestimonialResponse)
def toggle_testimonial_active(
    testimonial_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Toggle visibility status of a testimonial."""
    testimonial = db.query(Testimonial).filter(Testimonial.id == testimonial_id).first()
    if not testimonial:
        raise HTTPException(status_code=404, detail="Testimonial not found.")

    testimonial.is_active = not testimonial.is_active
    db.commit()
    db.refresh(testimonial)
    return testimonial


@router.delete("/admin/testimonials/{testimonial_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_testimonial(
    testimonial_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Delete a testimonial."""
    testimonial = db.query(Testimonial).filter(Testimonial.id == testimonial_id).first()
    if not testimonial:
        raise HTTPException(status_code=404, detail="Testimonial not found.")

    db.delete(testimonial)
    db.commit()
    return None
