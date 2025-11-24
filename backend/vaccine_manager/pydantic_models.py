from datetime import date
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class UserBase(BaseModel):
    username: str
    name: str
    email: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserRegister(BaseModel):
    username: str
    name: str
    email: Optional[str] = None
    password: str


class User(UserBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class FamilyMemberBase(BaseModel):
    name: str
    birthdate: date
    sex: Optional[str] = None


class FamilyMemberCreate(FamilyMemberBase):
    pass


class FamilyMember(FamilyMemberBase):
    user_id: UUID
    id: UUID
    model_config = ConfigDict(from_attributes=True)


class VaccineBase(BaseModel):
    name: str
    description: Optional[str] = None


class Vaccine(VaccineBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)


class VaccineRecordBase(BaseModel):
    date: date
    vaccine_id: UUID
    location: str
    dosage: Optional[str] = None


class VaccineRecordCreate(VaccineRecordBase):
    pass


class VaccineRecord(VaccineRecordBase):
    id: UUID
    family_member_id: UUID
    model_config = ConfigDict(from_attributes=True)
