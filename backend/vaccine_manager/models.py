from sqlalchemy import (Column, Date, DateTime, ForeignKey, Integer, String,
                        UniqueConstraint)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)

    families = relationship('Family', back_populates='user')

class Family(Base):
    __tablename__ = 'families' 
    id = Column(Integer, primary_key=True)
    name = Column(String)
    user_id = Column(Integer, ForeignKey('users.id'))
    created_at = Column(DateTime)
    updated_at = Column(DateTime)

    user = relationship('User', back_populates='families')
    members = relationship('FamilyMember', back_populates='family')

    __table_args__ = (UniqueConstraint('user_id','name'),)
    
class FamilyMember(Base):
    __tablename__ = 'family_members'
    id = Column(Integer, primary_key=True)
    name = Column(String)
    birthdate = Column(Date)
    sex = Column(String)
    family_id = Column(Integer, ForeignKey('families.id'))
    created_at = Column(DateTime)
    updated_at = Column(DateTime)

    family = relationship('Family', back_populates='members')

    __table_args__ = (UniqueConstraint('family_id', 'name', 'birthdate'),)