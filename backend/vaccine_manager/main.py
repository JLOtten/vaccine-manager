from fastapi import Depends, FastAPI
from sqlalchemy.orm import Session
from typing import List

import models
import pydantic_models
from db import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()


# Create db session
def get_db():
    db = SessionLocal(bind=engine)
    try:
        yield db
    finally:
        db.close()


@app.post("/users/", response_model=pydantic_models.User)
def create_user(user: pydantic_models.UserCreate, db: Session = Depends(get_db)):
    db_user = models.User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@app.post("/users/{user_id}/families/", response_model=pydantic_models.Family)
def create_family(
    user_id: int, family: pydantic_models.FamilyCreate, db: Session = Depends(get_db)
):
    # make sure the user exists (or throw exception, TOOD: make this exception nicer)
    user = db.query(models.User).filter_by(id = user_id).one()
    db_family = models.Family(**family.dict())
    db_family.user_id = user.id
    db.add(db_family)
    db.commit()
    db.refresh(db_family)
    return db_family


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
    family = db.query(models.Family).filter(models.Family.id == family_id, models.User.id == user_id).one()
    db_member = models.FamilyMember(**member.dict())
    db_member.family_id = family_id
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member
