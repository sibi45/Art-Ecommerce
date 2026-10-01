from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import ShowcaseItem, User
from app.schemas import (
    ShowcaseItemResponse,
    ShowcaseItemCreate,
    ShowcaseItemUpdate
)
from app.dependencies import get_current_admin

router = APIRouter(tags=["Showcase Items"])


# ----------------- Public Customer Endpoints -----------------
@router.get("/showcases", response_model=List[ShowcaseItemResponse])
def get_active_showcase_items(db: Session = Depends(get_db)):
    """Retrieve all active showcase marquee images for the storefront."""
    return (
        db.query(ShowcaseItem)
        .filter(ShowcaseItem.is_active == True)
        .order_by(ShowcaseItem.display_order.asc(), ShowcaseItem.id.asc())
        .all()
    )


# ----------------- Admin Management Endpoints -----------------
@router.get("/admin/showcases", response_model=List[ShowcaseItemResponse])
def get_all_showcase_items_admin(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Retrieve all showcase images for admin management."""
    return (
        db.query(ShowcaseItem)
        .order_by(ShowcaseItem.display_order.asc(), ShowcaseItem.id.asc())
        .all()
    )


@router.post("/admin/showcases", response_model=ShowcaseItemResponse, status_code=status.HTTP_201_CREATED)
def create_showcase_item(
    item_in: ShowcaseItemCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Create a new showcase image card."""
    image_url = item_in.image_url.strip()
    if not image_url:
        raise HTTPException(status_code=400, detail="Image URL is required.")

    display_order = item_in.display_order
    if display_order <= 0:
        max_order = db.query(func.max(ShowcaseItem.display_order)).scalar() or 0
        display_order = max_order + 1

    item = ShowcaseItem(
        image_url=image_url,
        title=item_in.title.strip() if item_in.title else None,
        tag=item_in.tag.strip() if item_in.tag else None,
        description=item_in.description.strip() if item_in.description else None,
        display_order=display_order,
        is_active=item_in.is_active
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/admin/showcases/{item_id}", response_model=ShowcaseItemResponse)
def update_showcase_item(
    item_id: int,
    item_in: ShowcaseItemUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Update an existing showcase image card."""
    item = db.query(ShowcaseItem).filter(ShowcaseItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Showcase item not found.")

    update_data = item_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field in ["image_url", "title", "tag", "description"] and isinstance(value, str):
            setattr(item, field, value.strip() if value.strip() else None)
        else:
            setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return item


@router.patch("/admin/showcases/{item_id}/toggle-active", response_model=ShowcaseItemResponse)
def toggle_showcase_item_active(
    item_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Toggle visibility status of a showcase image."""
    item = db.query(ShowcaseItem).filter(ShowcaseItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Showcase item not found.")

    item.is_active = not item.is_active
    db.commit()
    db.refresh(item)
    return item


@router.delete("/admin/showcases/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_showcase_item(
    item_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Permanently delete a showcase image."""
    item = db.query(ShowcaseItem).filter(ShowcaseItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Showcase item not found.")

    db.delete(item)
    db.commit()
    return None
