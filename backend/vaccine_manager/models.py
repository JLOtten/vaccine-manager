from datetime import date, datetime
from typing import List, Optional
from uuid import UUID

import sqlalchemy as sa
import uuid6
from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.types import CHAR, TypeDecorator


class GUID(TypeDecorator):
    """Platform-independent GUID type.
    Uses PostgreSQL's UUID type, otherwise uses CHAR(36), storing as stringified hex values.
    """

    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(PostgresUUID())
        else:
            return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == "postgresql":
            return str(value)
        else:
            if not isinstance(value, UUID):
                return str(UUID(value))
            return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        else:
            if not isinstance(value, UUID):
                return UUID(value)
            return value


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"
    id: Mapped[UUID] = mapped_column(
        GUID(), primary_key=True, default=lambda: uuid6.uuid7()
    )
    name: Mapped[str]
    email: Mapped[str]
    created_at: Mapped[datetime] = mapped_column(default=sa.func.now())
    updated_at: Mapped[datetime] = mapped_column(
        default=sa.func.now(), onupdate=sa.func.now()
    )

    family_members: Mapped[List["FamilyMember"]] = relationship(back_populates="user")


class FamilyMember(Base):
    __tablename__ = "family_members"
    id: Mapped[UUID] = mapped_column(
        GUID(), primary_key=True, default=lambda: uuid6.uuid7()
    )
    name: Mapped[str]
    birthdate: Mapped[date]
    sex: Mapped[str]
    user_id: Mapped[UUID] = mapped_column(GUID(), ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(default=sa.func.now())
    updated_at: Mapped[datetime] = mapped_column(
        default=sa.func.now(), onupdate=sa.func.now()
    )

    user: Mapped["User"] = relationship(back_populates="family_members")
    vaccine_records: Mapped[List["VaccineRecord"]] = relationship(
        back_populates="family_member"
    )

    __table_args__ = (UniqueConstraint("user_id", "name", "birthdate"),)


class Vaccine(Base):
    __tablename__ = "vaccines"
    id: Mapped[UUID] = mapped_column(
        GUID(), primary_key=True, default=lambda: uuid6.uuid7()
    )
    name: Mapped[str]
    description: Mapped[str]
    created_at: Mapped[datetime] = mapped_column(default=sa.func.now())
    updated_at: Mapped[datetime] = mapped_column(
        default=sa.func.now(), onupdate=sa.func.now()
    )

    __table_args__ = (UniqueConstraint("name"),)


class VaccineRecord(Base):
    __tablename__ = "vaccine_records"
    id: Mapped[UUID] = mapped_column(
        GUID(), primary_key=True, default=lambda: uuid6.uuid7()
    )
    family_member_id: Mapped[UUID] = mapped_column(
        GUID(), ForeignKey("family_members.id")
    )
    location: Mapped[str]
    dosage: Mapped[Optional[str]]
    vaccine_id: Mapped[UUID] = mapped_column(GUID(), ForeignKey("vaccines.id"))
    date: Mapped[date]
    created_at: Mapped[datetime] = mapped_column(default=sa.func.now())
    updated_at: Mapped[datetime] = mapped_column(
        default=sa.func.now(), onupdate=sa.func.now()
    )

    vaccine: Mapped["Vaccine"] = relationship()
    family_member: Mapped["FamilyMember"] = relationship(
        back_populates="vaccine_records"
    )

    __table_args__ = (UniqueConstraint("family_member_id", "vaccine_id"),)
