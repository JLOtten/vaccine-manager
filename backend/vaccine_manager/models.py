from sqlalchemy import (ForeignKey, String, Integer, UniqueConstraint, Date, DateTime)
from sqlalchemy.orm import (Mapped, mapped_column, relationship, DeclarativeBase)
import sqlalchemy as sa
from datetime import datetime, date
from typing import List, Optional


class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = 'users'
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    email: Mapped[str]
    created_at: Mapped[datetime] = mapped_column(default=sa.func.now())
    updated_at: Mapped[datetime] = mapped_column(default=sa.func.now(), onupdate=sa.func.now())

    families: Mapped[List["Family"]] = relationship(back_populates='user')

class Family(Base):
    __tablename__ = 'families' 
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'))
    created_at: Mapped[datetime] = mapped_column(default=sa.func.now())
    updated_at: Mapped[datetime] = mapped_column(default=sa.func.now(), onupdate=sa.func.now())


    user: Mapped["User"] = relationship(back_populates='families')
    members: Mapped[List["FamilyMember"]] = relationship(back_populates='family')

    __table_args__ = (UniqueConstraint('user_id','name'),)
    
class FamilyMember(Base):
    __tablename__ = 'family_members'
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    birthdate: Mapped[date]
    sex: Mapped[str]
    family_id: Mapped[int] = mapped_column(ForeignKey('families.id'))
    created_at: Mapped[datetime] = mapped_column(default=sa.func.now())
    updated_at: Mapped[datetime] = mapped_column(default=sa.func.now(), onupdate=sa.func.now())

    family: Mapped["Family"] = relationship(back_populates='members')
    vaccine_records: Mapped[List["VaccineRecord"]] = relationship(back_populates='family_members')

    __table_args__ = (UniqueConstraint('family_id', 'name', 'birthdate'),)

class Vaccine(Base):
    __tablename__ = 'vaccines'
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    description: Mapped[str]
    created_at: Mapped[datetime] = mapped_column(default=sa.func.now())
    updated_at: Mapped[datetime] = mapped_column(default=sa.func.now(), onupdate=sa.func.now())

    __table_args__ = (UniqueConstraint('name'),)

class VaccineRecord(Base):
    __tablename__ = 'vaccine_records'
    id: Mapped[int] = mapped_column(primary_key=True)
    family_member_id: Mapped[int] = mapped_column(ForeignKey('family_members.id'))
    location: Mapped[str]
    dosage: Mapped[Optional[str]]
    vaccine_id: Mapped[int] = mapped_column(ForeignKey('vaccines.id'))
    date: Mapped[date]
    created_at: Mapped[datetime] = mapped_column(default=sa.func.now())
    updated_at: Mapped[datetime] = mapped_column(default=sa.func.now(), onupdate=sa.func.now())

    vaccine: Mapped["Vaccine"] =  relationship()
    family_members: Mapped["FamilyMember"] = relationship(back_populates='vaccine_records')

    __table_args__ = (UniqueConstraint('family_member_id', 'vaccine_id'),)