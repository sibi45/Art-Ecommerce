import os
import shutil
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from app.database import get_db
from app.models import Painting, Category, User, Inquiry
from app.schemas import PaintingResponse, PaintingCreate, PaintingUpdate, CategoryResponse
from app.dependencies import get_current_admin

router = APIRouter(tags=["Paintings & Gallery"])

# ---------------- Public Catalog Endpoints ----------------

@router.get("/categories", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).order_by(Category.name.asc()).all()
    result = []
    for c in categories:
        count = db.query(func.count(Painting.id)).filter(Painting.category_id == c.id).scalar() or 0
        resp = CategoryResponse(
            id=c.id,
            name=c.name,
            slug=c.slug,
            description=c.description,
            image_url=c.image_url,
            created_at=c.created_at,
            paintings_count=count
        )
        result.append(resp)
    return result


@router.get("/paintings", response_model=List[PaintingResponse])
def list_paintings(
    search: Optional[str] = Query(None, description="Search by title, artist, or description"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    section_id: Optional[int] = Query(None, description="Filter by product section ID"),
    medium: Optional[str] = Query(None, description="Filter by medium"),
    status: Optional[str] = Query(None, description="Filter by status (available, reserved, sold)"),
    featured: Optional[bool] = Query(None, description="Filter by featured flag"),
    min_price: Optional[float] = Query(None, description="Minimum price filter"),
    max_price: Optional[float] = Query(None, description="Maximum price filter"),
    sort: Optional[str] = Query("newest", description="Sort by: newest, price_asc, price_desc, popular"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(Painting)

    if status:
        query = query.filter(Painting.status == status)
    if category_id:
        query = query.filter(Painting.category_id == category_id)
    if section_id:
        query = query.filter(Painting.section_id == section_id)
    if featured is not None:
        query = query.filter(Painting.featured == featured)
    if medium:
        query = query.filter(Painting.medium.ilike(f"%{medium}%"))
    if min_price is not None:
        query = query.filter(Painting.price >= min_price)
    if max_price is not None:
        query = query.filter(Painting.price <= max_price)

    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Painting.title.ilike(search_fmt),
                Painting.artist_name.ilike(search_fmt),
                Painting.description.ilike(search_fmt),
                Painting.medium.ilike(search_fmt)
            )
        )

    # Sorting
    if sort == "price_asc":
        query = query.order_by(Painting.price.asc())
    elif sort == "price_desc":
        query = query.order_by(Painting.price.desc())
    elif sort == "popular":
        query = query.order_by(Painting.views_count.desc())
    else: # newest
        query = query.order_by(Painting.created_at.desc())

    paintings = query.offset(offset).limit(limit).all()
    return paintings


@router.get("/paintings/{painting_id}", response_model=PaintingResponse)
def get_painting_detail(painting_id: int, db: Session = Depends(get_db)):
    painting = db.query(Painting).filter(Painting.id == painting_id).first()
    if not painting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Painting not found"
        )
    # Increment view count
    painting.views_count = (painting.views_count or 0) + 1
    db.commit()
    db.refresh(painting)
    return painting


# ---------------- Admin Management Endpoints ----------------

@router.post("/paintings", response_model=PaintingResponse, status_code=status.HTTP_201_CREATED)
def create_painting(
    painting_in: PaintingCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    painting = Painting(**painting_in.model_dump())
    db.add(painting)
    db.commit()
    db.refresh(painting)
    return painting


@router.put("/paintings/{painting_id}", response_model=PaintingResponse)
def update_painting(
    painting_id: int,
    painting_in: PaintingUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    painting = db.query(Painting).filter(Painting.id == painting_id).first()
    if not painting:
        raise HTTPException(status_code=404, detail="Painting not found")

    update_data = painting_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(painting, field, value)

    db.commit()
    db.refresh(painting)
    return painting


@router.delete("/paintings/{painting_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_painting(
    painting_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    painting = db.query(Painting).filter(Painting.id == painting_id).first()
    if not painting:
        raise HTTPException(status_code=404, detail="Painting not found")
    
    # Cleanly remove associated inquiries first so foreign keys are satisfied
    db.query(Inquiry).filter(Inquiry.painting_id == painting_id).delete()

    db.delete(painting)
    db.commit()
    return None


@router.post("/paintings/upload-image")
def upload_painting_image(
    file: UploadFile = File(...),
    admin: User = Depends(get_current_admin)
):
    UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    # Allowed extensions
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp", ".avif"]:
        raise HTTPException(status_code=400, detail="Only image files (.jpg, .jpeg, .png, .webp) are allowed")

    file_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, file_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"url": f"/uploads/{file_name}", "filename": file_name}
