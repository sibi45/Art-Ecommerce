from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserRegister, UserLogin, UserResponse, TokenResponse, UserUpdate, ChangePasswordRequest
from app.security import verify_password, get_password_hash, create_access_token
from app.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    # Check if user with this email already exists
    existing = db.query(User).filter(User.email.ilike(user_in.email)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists"
        )
    
    new_user = User(
        full_name=user_in.full_name,
        email=user_in.email.lower().strip(),
        hashed_password=get_password_hash(user_in.password),
        phone=user_in.phone,
        address=user_in.address,
        city=user_in.city,
        role="customer",
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(subject=new_user.id)
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user)
    )

@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email.ilike(credentials.email.strip())).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account has been deactivated"
        )

    access_token = create_access_token(subject=user.id)
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
def update_me(
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if user_in.full_name is not None and user_in.full_name.strip():
        current_user.full_name = user_in.full_name.strip()
    if user_in.email is not None and user_in.email.strip():
        new_email = user_in.email.lower().strip()
        if new_email != current_user.email:
            existing = db.query(User).filter(User.email == new_email, User.id != current_user.id).first()
            if existing:
                raise HTTPException(status_code=400, detail="Email is already used by another account")
            current_user.email = new_email
    if user_in.phone is not None:
        current_user.phone = user_in.phone.strip() or None
    if user_in.address is not None:
        current_user.address = user_in.address.strip() or None
    if user_in.city is not None:
        current_user.city = user_in.city.strip() or None

    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/change-password")
def change_password(
    req: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if req.old_password:
        if not verify_password(req.old_password, current_user.hashed_password):
            raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters long")

    current_user.hashed_password = get_password_hash(req.new_password)
    db.commit()
    return {"message": "Password changed successfully"}
