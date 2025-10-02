from typing import List

from fastapi import Depends, FastAPI
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


@app.post("/users", response_model=pydantic_models.User)
def create_user(user: pydantic_models.UserCreate, db: Session = Depends(get_db)):
    # db_user = models.User(**user.dict())
    db_user = models.User(name=user.name, email=user.email)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@app.get("/users", response_model=List[pydantic_models.User])
def get_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()


@app.post("/users/{user_id}/families", response_model=pydantic_models.Family)
def create_family(
    user_id: int, family: pydantic_models.FamilyCreate, db: Session = Depends(get_db)
):
    # make sure the user exists (or throw exception, TOOD: make this exception nicer)
    user = db.query(models.User).filter_by(id=user_id).one()
    db_family = models.Family(**family.dict())
    db_family.user_id = user.id
    db.add(db_family)
    db.commit()
    db.refresh(db_family)
    return db_family


@app.get("/users/{user_id}/families", response_model=List[pydantic_models.Family])
def get_families(user_id: int, db: Session = Depends(get_db)):
    return db.query(models.Family).filter_by(user_id=user_id).all()


@app.post(
    "/users/{user_id}/families/{family_id}/family_members",
    response_model=pydantic_models.FamilyMember,
)
def create_member(
    user_id: int,
    family_id: int,
    member: pydantic_models.FamilyMemberCreate,
    db: Session = Depends(get_db),
):
    # verify family and user
    _ = (
        db.query(models.Family)
        .filter(models.Family.id == family_id, models.User.id == user_id)
        .one()
    )
    db_member = models.FamilyMember(**member.model_dump())
    db_member.family_id = family_id
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member


@app.get(
    "/users/{user_id}/families/{family_id}/family_members",
    response_model=List[pydantic_models.FamilyMember],
)
def get_family_members(user_id: int, family_id: int, db: Session = Depends(get_db)):
    family = (
        db.query(models.Family)
        .filter(models.Family.id == family_id, models.User.id == user_id)
        .one()
    )
    return db.query(models.FamilyMember).filter_by(family_id=family.id).all()


@app.post("/vaccines", response_model=pydantic_models.Vaccine)
def create_vaccine(
    vaccine: pydantic_models.VaccineCreate, db: Session = Depends(get_db)
):
    db_vaccine = models.Vaccine(name=vaccine.name, description=vaccine.description)
    db.add(db_vaccine)
    db.commit()
    db.refresh(db_vaccine)
    return db_vaccine


@app.get("/vaccines", response_model=List[pydantic_models.Vaccine])
def get_vaccines(db: Session = Depends(get_db)):
    return db.query(models.Vaccine).all()


@app.post(
    "/users/{user_id}/families/{family_id}/family_members/{family_member_id}/vaccine_records",
    response_model=pydantic_models.VaccineRecord,
)
def create_vaccine_record(
    user_id: int,
    family_id: int,
    family_member_id: int,
    record: pydantic_models.VaccineRecordCreate,
    db: Session = Depends(get_db),
):
    # verify family and user
    # gotta be a better way to do this...
    db.query(models.Family).filter(
        models.Family.id == family_id, models.User.id == user_id
    ).one()
    db.query(models.FamilyMember).filter(
        models.FamilyMember.id == family_member_id, models.Family.id == family_id
    ).one()
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
    "/users/{user_id}/families/{family_id}/family_members/{family_member_id}/vaccine_records",
    response_model=List[pydantic_models.VaccineRecord],
)
def get_vaccine_record(
    user_id: int, family_id: int, family_member_id: int, db: Session = Depends(get_db)
):
    return (
        db.query(models.VaccineRecord)
        .filter_by(family_member_id=family_member_id)
        .all()
    )
