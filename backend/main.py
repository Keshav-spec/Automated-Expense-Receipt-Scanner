from datetime import timedelta
import os
import secrets

from fastapi import (
    FastAPI,
    UploadFile,
    File,
    Depends,
    HTTPException
)

from fastapi.middleware.cors import CORSMiddleware

from fastapi.security import OAuth2PasswordRequestForm

from sqlalchemy import or_
from sqlalchemy.orm import Session

from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token

from backend.database import (
    engine,
    get_db,
    Base,
    run_migrations
)

from backend import models

from backend.schemas import GoogleAuthRequest

from backend.ocr_engine import extract_text

from backend.parser import parse_receipt

from backend.auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    GOOGLE_CLIENT_ID
)


# Create database tables
Base.metadata.create_all(bind=engine)
run_migrations()

# Create uploads folder
os.makedirs("uploads", exist_ok=True)


app = FastAPI(
    title="Expense Receipt Scanner API",
    version="1.0.0"
)


# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():

    return {
        "message": "Expense Receipt Scanner API Running"
    }


# AUTH ROUTES

@app.post("/auth/register")
def register(
    username: str,
    email: str,
    password: str,
    db: Session = Depends(get_db)
):

    existing = db.query(models.User).filter(
        models.User.username == username
    ).first()

    if existing:

        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    user = models.User(
        username=username,
        email=email,
        hashed_password=hash_password(password)
    )

    db.add(user)

    db.commit()

    db.refresh(user)

    return {
        "message": "User created successfully",
        "user_id": user.id
    }


@app.post("/auth/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    user = db.query(models.User).filter(
        models.User.username == form_data.username
    ).first()

    if (
        not user
        or not user.hashed_password
        or not verify_password(
            form_data.password,
            user.hashed_password
        )
    ):

        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password"
        )

    token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@app.post("/auth/google")
def google_login(
    body: GoogleAuthRequest,
    db: Session = Depends(get_db)
):

    if not GOOGLE_CLIENT_ID:

        raise HTTPException(
            status_code=500,
            detail="Google login is not configured on the server"
        )

    try:

        idinfo = google_id_token.verify_oauth2_token(
            body.id_token,
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )

    except ValueError:

        raise HTTPException(
            status_code=401,
            detail="Invalid Google token"
        )

    email = idinfo.get("email")

    if not email:

        raise HTTPException(
            status_code=400,
            detail="Google account must have an email address"
        )

    google_sub = idinfo.get("sub")

    user = db.query(models.User).filter(
        or_(
            models.User.google_id == google_sub,
            models.User.email == email
        )
    ).first()

    if not user:

        username = email.split("@")[0]
        base_username = username
        suffix = 1

        while db.query(models.User).filter(
            models.User.username == username
        ).first():

            username = f"{base_username}{suffix}"
            suffix += 1

        user = models.User(
            username=username,
            email=email,
            google_id=google_sub,
            hashed_password=hash_password(
                secrets.token_urlsafe(32)
            )
        )

        db.add(user)
        db.commit()
        db.refresh(user)

    elif not user.google_id:

        user.google_id = google_sub
        db.commit()

    token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "username": user.username
    }


# RECEIPT ROUTES

@app.post("/receipts/upload")
async def upload_receipt(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    # Validate file type
    if file.content_type not in [
        "image/jpeg",
        "image/png",
        "image/jpg"
    ]:

        raise HTTPException(
            status_code=400,
            detail="Only JPG/PNG images allowed"
        )

    # Read image
    image_bytes = await file.read()

    # Save uploaded image
    upload_path = (
        f"uploads/{current_user.id}_{file.filename}"
    )

    with open(upload_path, "wb") as f:
        f.write(image_bytes)

    # OCR + Parsing
    try:

        raw_text = extract_text(image_bytes)

        parsed = parse_receipt(raw_text)

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"OCR processing failed: {str(e)}"
        )

    # Save to database
    expense = models.Expense(
        merchant=parsed["merchant"],
        amount=parsed["amount"],
        date=parsed["date"],
        category=parsed["category"],
        raw_text=parsed["raw_text"],
        image_path=upload_path,
        user_id=current_user.id
    )

    db.add(expense)

    db.commit()

    db.refresh(expense)

    return {
        "id": expense.id,
        "merchant": expense.merchant,
        "amount": expense.amount,
        "date": expense.date,
        "category": expense.category,
        "message": "Receipt processed successfully"
    }


@app.get("/receipts/")
def get_all_receipts(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    expenses = db.query(models.Expense).filter(
        models.Expense.user_id == current_user.id
    ).order_by(
        models.Expense.date.desc()
    ).all()

    return expenses


@app.get("/receipts/{expense_id}")
def get_receipt(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    expense = db.query(models.Expense).filter(
        models.Expense.id == expense_id,
        models.Expense.user_id == current_user.id
    ).first()

    if not expense:

        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    return expense


@app.put("/receipts/{expense_id}")
def update_receipt(
    expense_id: int,
    merchant: str = None,
    amount: float = None,
    date: str = None,
    category: str = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    expense = db.query(models.Expense).filter(
        models.Expense.id == expense_id,
        models.Expense.user_id == current_user.id
    ).first()

    if not expense:

        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    if merchant is not None:
        expense.merchant = merchant

    if amount is not None:
        expense.amount = amount

    if date is not None:
        expense.date = date

    if category is not None:
        expense.category = category

    db.commit()

    return {
        "message": "Updated successfully"
    }


@app.delete("/receipts/{expense_id}")
def delete_receipt(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    expense = db.query(models.Expense).filter(
        models.Expense.id == expense_id,
        models.Expense.user_id == current_user.id
    ).first()

    if not expense:

        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    if expense.image_path and os.path.exists(expense.image_path):

        try:
            os.remove(expense.image_path)
        except OSError:
            pass

    db.delete(expense)

    db.commit()

    return {
        "message": "Deleted successfully"
    }


@app.get("/analytics/summary")
def get_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    expenses = db.query(models.Expense).filter(
        models.Expense.user_id == current_user.id
    ).all()

    total = sum(
        e.amount for e in expenses
        if e.amount
    )

    by_category = {}

    for e in expenses:

        if e.amount:

            by_category[e.category] = (
                by_category.get(e.category, 0)
                + e.amount
            )

    return {
        "total_expenses": total,
        "expense_count": len(expenses),
        "by_category": by_category
    }
