from pathlib import Path
from typing import List
from uuid import UUID

from fastapi import Depends, FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from vaccine_manager import auth, models, pydantic_models
from vaccine_manager.config import settings
from vaccine_manager.db import engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Configure CORS from settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files (frontend build)
# Try multiple possible locations for static directory
# Docker: /app/vaccine_manager/main.py -> /app/static (parent.parent)
# Local dev: backend/vaccine_manager/main.py -> project_root/static (parent.parent.parent)
# Also check frontend/public for local development
_base_paths = [
    Path(__file__).parent.parent / "static",  # Docker: /app/static
    Path(__file__).parent.parent.parent / "static",  # Local: project_root/static
    Path(__file__).parent.parent.parent.parent
    / "frontend"
    / "public",  # Local: frontend/public
]
static_dir = Path(__file__).parent.parent / "static"  # Default to Docker structure
for path in _base_paths:
    if path.exists():
        static_dir = path
        break

if static_dir.exists():
    # Mount static assets (JS, CSS, images, etc.)
    app.mount("/assets", StaticFiles(directory=static_dir / "assets"), name="assets")


# Authentication endpoints (public)
@app.post("/register", response_model=pydantic_models.Token)
def register(
    user_data: pydantic_models.UserRegister,
    response: Response,
    db: Session = Depends(auth.get_db),
):
    """Register a new user."""
    # Check if username already exists
    existing_user = (
        db.query(models.User).filter(models.User.username == user_data.username).first()
    )
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )

    # Create new user
    hashed_password = auth.get_password_hash(user_data.password)
    db_user = models.User(
        username=user_data.username,
        name=user_data.name,
        email=user_data.email,
        hashed_password=hashed_password,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Create access token and set HTTP-only cookie
    access_token = auth.create_access_token(data={"sub": db_user.username})
    auth.set_auth_cookie(response, access_token)
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/login", response_model=pydantic_models.Token)
def login(
    credentials: pydantic_models.UserLogin,
    response: Response,
    db: Session = Depends(auth.get_db),
):
    """Login with username and password."""
    user = (
        db.query(models.User)
        .filter(models.User.username == credentials.username)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    # Verify password
    if not auth.verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    # Create access token and set HTTP-only cookie
    access_token = auth.create_access_token(data={"sub": user.username})
    auth.set_auth_cookie(response, access_token)
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/logout")
def logout(response: Response):
    """Logout and clear authentication cookie."""
    auth.clear_auth_cookie(response)
    return {"message": "Logged out successfully"}


@app.get("/user", response_model=pydantic_models.User)
def get_user(current_user: models.User = Depends(auth.get_current_user)):
    """Get current user information."""
    return current_user


@app.post("/family_members", response_model=pydantic_models.FamilyMember)
def create_family_member(
    member: pydantic_models.FamilyMemberCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(auth.get_db),
):
    db_member = models.FamilyMember(**member.model_dump())
    db_member.user_id = current_user.id
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member


@app.get("/family_members", response_model=List[pydantic_models.FamilyMember])
def get_family_members(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(auth.get_db),
):
    return db.query(models.FamilyMember).filter_by(user_id=current_user.id).all()


@app.get("/vaccines", response_model=List[pydantic_models.Vaccine])
def get_vaccines(
    _current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(auth.get_db),
):
    """Get all available vaccines. Requires authentication."""
    return db.query(models.Vaccine).all()


@app.post(
    "/family_members/{family_member_id}/vaccine_records",
    response_model=pydantic_models.VaccineRecord,
)
def create_vaccine_record(
    family_member_id: UUID,
    record: pydantic_models.VaccineRecordCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(auth.get_db),
):
    # Verify family member belongs to current user
    family_member = (
        db.query(models.FamilyMember)
        .filter(
            models.FamilyMember.id == family_member_id,
            models.FamilyMember.user_id == current_user.id,
        )
        .first()
    )
    if not family_member:
        raise HTTPException(status_code=404, detail="Family member not found")
    db_vaccine_record = models.VaccineRecord(
        family_member_id=family_member_id,
        location=record.location,
        dosage=record.dosage,
        vaccine_id=record.vaccine_id,
        date=record.date,
    )
    db.add(db_vaccine_record)
    db.commit()
    db.refresh(db_vaccine_record)
    return db_vaccine_record


@app.get(
    "/family_members/{family_member_id}/vaccine_records",
    response_model=List[pydantic_models.VaccineRecord],
)
def get_vaccine_records(
    family_member_id: UUID,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(auth.get_db),
):
    # Verify family member belongs to current user
    family_member = (
        db.query(models.FamilyMember)
        .filter(
            models.FamilyMember.id == family_member_id,
            models.FamilyMember.user_id == current_user.id,
        )
        .first()
    )
    if not family_member:
        raise HTTPException(status_code=404, detail="Family member not found")
    return (
        db.query(models.VaccineRecord)
        .filter_by(family_member_id=family_member_id)
        .all()
    )


# Serve static files and index.html for all non-API routes (SPA routing) - MUST be last
if static_dir.exists():

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't serve index.html for API routes or static assets
        if full_path.startswith(("api/", "assets/", "docs", "openapi.json", "redoc")):
            raise HTTPException(status_code=404)

        # Check if the requested path is a static file
        static_file_path = static_dir / full_path
        if static_file_path.is_file() and static_file_path.exists():
            return FileResponse(static_file_path)

        # Otherwise serve index.html for SPA routing
        index_path = static_dir / "index.html"
        if index_path.exists():
            return FileResponse(index_path)
        raise HTTPException(status_code=404)
