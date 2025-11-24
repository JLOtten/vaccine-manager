from typing import List
from uuid import UUID

from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session

from . import models, pydantic_models
from .db import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()


# Create db session
def get_db():
    db = SessionLocal(bind=engine)
    try:
        yield db
    finally:
        db.close()


# Helper function to get or create the single user
def get_current_user(db: Session) -> models.User:
    user = db.query(models.User).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="No user found. Please create a user first using POST /user",
        )
    return user


@app.post("/user", response_model=pydantic_models.User)
def create_user(user: pydantic_models.UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(models.User).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="User already exists. Use GET /user to retrieve the current user.",
        )
    db_user = models.User(name=user.name, email=user.email)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@app.get("/user", response_model=pydantic_models.User)
def get_user(db: Session = Depends(get_db)):
    return get_current_user(db)


@app.post("/family_members", response_model=pydantic_models.FamilyMember)
def create_family_member(
    member: pydantic_models.FamilyMemberCreate,
    db: Session = Depends(get_db),
):
    user = get_current_user(db)
    db_member = models.FamilyMember(**member.model_dump())
    db_member.user_id = user.id
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member


@app.get("/family_members", response_model=List[pydantic_models.FamilyMember])
def get_family_members(db: Session = Depends(get_db)):
    user = get_current_user(db)
    return db.query(models.FamilyMember).filter_by(user_id=user.id).all()


@app.get("/vaccines", response_model=List[pydantic_models.Vaccine])
def get_vaccines(db: Session = Depends(get_db)):
    return db.query(models.Vaccine).all()


@app.post(
    "/family_members/{family_member_id}/vaccine_records",
    response_model=pydantic_models.VaccineRecord,
)
def create_vaccine_record(
    family_member_id: UUID,
    record: pydantic_models.VaccineRecordCreate,
    db: Session = Depends(get_db),
):
    # Verify family member belongs to current user
    user = get_current_user(db)
    family_member = (
        db.query(models.FamilyMember)
        .filter(
            models.FamilyMember.id == family_member_id,
            models.FamilyMember.user_id == user.id,
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
def get_vaccine_records(family_member_id: UUID, db: Session = Depends(get_db)):
    # Verify family member belongs to current user
    user = get_current_user(db)
    family_member = (
        db.query(models.FamilyMember)
        .filter(
            models.FamilyMember.id == family_member_id,
            models.FamilyMember.user_id == user.id,
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
