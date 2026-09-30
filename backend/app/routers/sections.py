from typing import List, Optional
import re
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import ProductSection, Painting, User
from app.schemas import (
    ProductSectionResponse,
    ProductSectionCreate,
    ProductSectionUpdate
)
from app.dependencies import get_current_admin

router = APIRouter(tags=["Product Sections"])


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    return re.sub(r'[-\s]+', '-', text)


# ----------------- Public Customer Endpoints -----------------
@router.get("/sections", response_model=List[ProductSectionResponse])
def get_active_sections(db: Session = Depends(get_db)):
    """Retrieve all active product sections for customer storefront."""
    sections = (
        db.query(ProductSection)
        .filter(ProductSection.is_active == True)
        .order_by(ProductSection.display_order.asc(), ProductSection.id.asc())
        .all()
    )
    
    result = []
    for s in sections:
        count = db.query(func.count(Painting.id)).filter(Painting.section_id == s.id).scalar() or 0
        resp = ProductSectionResponse.model_validate(s)
        resp.paintings_count = count
        result.append(resp)
    return result


# ----------------- Admin Management Endpoints -----------------
@router.get("/admin/sections", response_model=List[ProductSectionResponse])
def get_all_sections_admin(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Retrieve all product sections for admin management."""
    sections = (
        db.query(ProductSection)
        .order_by(ProductSection.display_order.asc(), ProductSection.id.asc())
        .all()
    )
    result = []
    for s in sections:
        count = db.query(func.count(Painting.id)).filter(Painting.section_id == s.id).scalar() or 0
        resp = ProductSectionResponse.model_validate(s)
        resp.paintings_count = count
        result.append(resp)
    return result


@router.post("/admin/sections", response_model=ProductSectionResponse, status_code=status.HTTP_201_CREATED)
def create_section(
    section_in: ProductSectionCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Create a new product section."""
    name = section_in.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Section name cannot be empty.")

    slug = section_in.slug.strip() if section_in.slug else slugify(name)
    
    # Check uniqueness
    existing = db.query(ProductSection).filter(
        (ProductSection.name.ilike(name)) | (ProductSection.slug == slug)
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Section with name '{name}' or slug '{slug}' already exists."
        )

    # Determine display order if not set
    display_order = section_in.display_order
    if display_order == 0:
        max_order = db.query(func.max(ProductSection.display_order)).scalar() or 0
        display_order = max_order + 1

    section = ProductSection(
        name=name,
        slug=slug,
        description=section_in.description.strip() if section_in.description else None,
        image_url=section_in.image_url.strip() if section_in.image_url else None,
        display_order=display_order,
        is_active=section_in.is_active
    )
    db.add(section)
    db.commit()
    db.refresh(section)

    resp = ProductSectionResponse.model_validate(section)
    resp.paintings_count = 0
    return resp


@router.put("/admin/sections/{section_id}", response_model=ProductSectionResponse)
def update_section(
    section_id: int,
    section_in: ProductSectionUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Update an existing section."""
    section = db.query(ProductSection).filter(ProductSection.id == section_id).first()
    if not section:
        raise HTTPException(status_code=404, detail="Section not found.")

    update_data = section_in.model_dump(exclude_unset=True)
    if "name" in update_data and update_data["name"]:
        name = update_data["name"].strip()
        existing = db.query(ProductSection).filter(
            ProductSection.name.ilike(name),
            ProductSection.id != section_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail=f"Another section with name '{name}' already exists.")
        section.name = name

    if "slug" in update_data and update_data["slug"]:
        slug = update_data["slug"].strip()
        existing = db.query(ProductSection).filter(
            ProductSection.slug == slug,
            ProductSection.id != section_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail=f"Another section with slug '{slug}' already exists.")
        section.slug = slug

    if "description" in update_data:
        section.description = update_data["description"]
    if "image_url" in update_data:
        section.image_url = update_data["image_url"].strip() if update_data["image_url"] else None
    if "display_order" in update_data:
        section.display_order = update_data["display_order"]
    if "is_active" in update_data:
        section.is_active = update_data["is_active"]

    db.commit()
    db.refresh(section)

    count = db.query(func.count(Painting.id)).filter(Painting.section_id == section.id).scalar() or 0
    resp = ProductSectionResponse.model_validate(section)
    resp.paintings_count = count
    return resp


@router.delete("/admin/sections/{section_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_section(
    section_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Delete a section. Paintings under this section will have section_id set to NULL."""
    section = db.query(ProductSection).filter(ProductSection.id == section_id).first()
    if not section:
        raise HTTPException(status_code=404, detail="Section not found.")

    # Unassign paintings first
    db.query(Painting).filter(Painting.section_id == section_id).update({Painting.section_id: None})
    db.delete(section)
    db.commit()
    return None
