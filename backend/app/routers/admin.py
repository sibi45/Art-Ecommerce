from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import Painting, Inquiry, User, Category
from app.schemas import AdminDashboardStats, CategoryCreate, CategoryUpdate, CategoryResponse, UserResponse
from app.dependencies import get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    return db.query(User).order_by(User.created_at.desc()).all()

@router.put("/users/{user_id}/toggle-active", response_model=UserResponse)
def toggle_user_active(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    if target_user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own admin account")
    target_user.is_active = not target_user.is_active
    db.commit()
    db.refresh(target_user)
    return target_user

@router.get("/stats", response_model=AdminDashboardStats)
def get_admin_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    total_paintings = db.query(Painting).count()
    available_paintings = db.query(Painting).filter(Painting.status == "available").count()
    sold_paintings = db.query(Painting).filter(Painting.status == "sold").count()

    total_inquiries = db.query(Inquiry).count()
    new_inquiries = db.query(Inquiry).filter(Inquiry.status == "new").count()
    confirmed_orders = db.query(Inquiry).filter(Inquiry.status.in_(["confirmed", "completed"])).count()

    # Sum of quoted prices in active inquiries
    pipeline_val = (
        db.query(func.sum(Inquiry.quoted_price))
        .filter(Inquiry.status.in_(["new", "contacted", "negotiating", "confirmed"]))
        .scalar()
    ) or 0.0

    return AdminDashboardStats(
        total_paintings=total_paintings,
        available_paintings=available_paintings,
        sold_paintings=sold_paintings,
        total_inquiries=total_inquiries,
        new_inquiries=new_inquiries,
        confirmed_orders=confirmed_orders,
        estimated_pipeline_value=float(pipeline_val)
    )

@router.post("/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    category_in: CategoryCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    name = category_in.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Category name cannot be empty")

    existing = db.query(Category).filter(Category.name.ilike(name)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category with this name already exists")

    slug = (category_in.slug or name).strip().lower().replace(" ", "-")
    cat = Category(
        name=name,
        slug=slug,
        description=category_in.description.strip() if category_in.description else None,
        image_url=category_in.image_url.strip() if category_in.image_url else None
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)
    
    resp = CategoryResponse(
        id=cat.id,
        name=cat.name,
        slug=cat.slug,
        description=cat.description,
        image_url=cat.image_url,
        created_at=cat.created_at,
        paintings_count=0
    )
    return resp

@router.put("/categories/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    category_in: CategoryUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")

    update_data = category_in.model_dump(exclude_unset=True)
    if "name" in update_data and update_data["name"]:
        name = update_data["name"].strip()
        existing = db.query(Category).filter(
            Category.name.ilike(name),
            Category.id != category_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Another category with this name already exists")
        cat.name = name

    if "slug" in update_data and update_data["slug"]:
        slug = update_data["slug"].strip().lower().replace(" ", "-")
        existing = db.query(Category).filter(
            Category.slug == slug,
            Category.id != category_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Another category with this slug already exists")
        cat.slug = slug

    if "description" in update_data:
        cat.description = update_data["description"].strip() if update_data["description"] else None
    if "image_url" in update_data:
        cat.image_url = update_data["image_url"].strip() if update_data["image_url"] else None

    db.commit()
    db.refresh(cat)
    
    count = db.query(func.count(Painting.id)).filter(Painting.category_id == cat.id).scalar() or 0
    resp = CategoryResponse(
        id=cat.id,
        name=cat.name,
        slug=cat.slug,
        description=cat.description,
        image_url=cat.image_url,
        created_at=cat.created_at,
        paintings_count=count
    )
    return resp

@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Nullify category on paintings
    db.query(Painting).filter(Painting.category_id == category_id).update({Painting.category_id: None})
    db.delete(cat)
    db.commit()
    return None
