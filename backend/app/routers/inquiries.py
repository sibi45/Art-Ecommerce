import random
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Inquiry, Painting, User
from app.schemas import (
    InquiryCreate,
    InquiryStatusUpdate,
    InquiryResponse,
    AdminDashboardStats
)
from app.dependencies import get_current_user, get_current_admin

router = APIRouter(prefix="/inquiries", tags=["Inquiries & Orders"])

def generate_inquiry_code() -> str:
    year = datetime.utcnow().year
    random_digits = random.randint(1000, 9999)
    return f"INQ-{year}-{random_digits}"

@router.post("", response_model=InquiryResponse, status_code=status.HTTP_201_CREATED)
def create_inquiry(
    inquiry_in: InquiryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify the painting exists
    painting = db.query(Painting).filter(Painting.id == inquiry_in.painting_id).first()
    if not painting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The requested painting was not found"
        )

    if painting.status == "sold":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This artwork has already been sold. Please choose another painting."
        )

    # Unique inquiry code
    code = generate_inquiry_code()
    while db.query(Inquiry).filter(Inquiry.inquiry_code == code).first():
        code = generate_inquiry_code()

    new_inquiry = Inquiry(
        inquiry_code=code,
        painting_id=painting.id,
        user_id=current_user.id,
        customer_name=current_user.full_name,
        customer_email=current_user.email,
        customer_phone=inquiry_in.customer_phone.strip(),
        shipping_address=inquiry_in.shipping_address.strip(),
        preferred_contact=inquiry_in.preferred_contact,
        message=inquiry_in.message,
        quoted_price=float(painting.price),
        status="new"
    )

    # Update painting status to reserved if still available
    if painting.status == "available":
        painting.status = "reserved"

    db.add(new_inquiry)
    db.commit()
    db.refresh(new_inquiry)

    return new_inquiry


@router.get("/my", response_model=List[InquiryResponse])
def get_my_inquiries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Customer sees their own submitted purchase inquiries"""
    inquiries = (
        db.query(Inquiry)
        .options(joinedload(Inquiry.painting))
        .filter(Inquiry.user_id == current_user.id)
        .order_by(Inquiry.created_at.desc())
        .all()
    )
    return inquiries


@router.get("/all", response_model=List[InquiryResponse])
def get_all_inquiries(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Admin views all customer purchase inquiries"""
    query = (
        db.query(Inquiry)
        .options(joinedload(Inquiry.painting), joinedload(Inquiry.user))
    )

    if status_filter:
        query = query.filter(Inquiry.status == status_filter)

    return query.order_by(Inquiry.created_at.desc()).all()


@router.get("/{inquiry_id}", response_model=InquiryResponse)
def get_inquiry_detail(
    inquiry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inquiry = (
        db.query(Inquiry)
        .options(joinedload(Inquiry.painting), joinedload(Inquiry.user))
        .filter(Inquiry.id == inquiry_id)
        .first()
    )
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")

    # Only the owner or admin can view
    if inquiry.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden access")

    return inquiry


@router.patch("/{inquiry_id}/status", response_model=InquiryResponse)
def update_inquiry_status(
    inquiry_id: int,
    status_update: InquiryStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    inquiry = (
        db.query(Inquiry)
        .options(joinedload(Inquiry.painting))
        .filter(Inquiry.id == inquiry_id)
        .first()
    )
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")

    valid_statuses = ["new", "contacted", "negotiating", "confirmed", "completed", "cancelled"]
    if status_update.status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )

    inquiry.status = status_update.status
    if status_update.admin_notes is not None:
        inquiry.admin_notes = status_update.admin_notes

    if status_update.status == "contacted" and not inquiry.contacted_at:
        inquiry.contacted_at = datetime.utcnow()

    # Synchronize painting status with inquiry resolution
    if status_update.status in ["confirmed", "completed"]:
        inquiry.painting.status = "sold"
    elif status_update.status == "cancelled":
        # Check if there are other active inquiries for this painting
        active_inquiries = (
            db.query(Inquiry)
            .filter(
                Inquiry.painting_id == inquiry.painting_id,
                Inquiry.id != inquiry.id,
                Inquiry.status.in_(["new", "contacted", "negotiating"])
            )
            .count()
        )
        if active_inquiries == 0:
            inquiry.painting.status = "available"

    db.commit()
    db.refresh(inquiry)
    return inquiry
