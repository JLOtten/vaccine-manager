from datetime import date
from typing import Optional

from pydantic import BaseModel


class UserBase(BaseModel):
    name: str
    email: str

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    class Config:
        orm_mode = True

class FamilyBase(BaseModel):
    name: str

class FamilyCreate(FamilyBase):
    pass

class Family(FamilyBase):
    id: int
    class Config:
        orm_mode = True

class FamilyMemberBase(BaseModel):
    name: str
    birthdate: date
    sex: Optional[str] = None

class FamilyMemberCreate(FamilyMemberBase):
    pass

class FamilyMember(FamilyMemberBase):
    family_id: int
    id: int

    class Config: 
        orm_mode = True

class VaccineBase(BaseModel):
    name: str
    description: Optional[str] = None

class VaccineCreate(VaccineBase):
    pass

class Vaccine(VaccineBase):
    id: int
    class Config:
        orm_mode = True