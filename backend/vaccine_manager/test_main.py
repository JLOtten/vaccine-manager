# testing code from: https://fastapi.tiangolo.com/advanced/testing-database/
# minimally adapted for this project
from uuid import UUID

import pytest
import uuid6
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

SQLALCHEMY_DATABASE_URL = "sqlite://"

from . import models
from .main import app, get_db

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def reset_database():
    """Reset the database before each test"""
    models.Base.metadata.drop_all(bind=engine)
    models.Base.metadata.create_all(bind=engine)
    yield
    models.Base.metadata.drop_all(bind=engine)


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


def test_create_and_get_user():
    """Test creating and retrieving a user"""
    response = client.post(
        "/user",
        json={"email": "christian@example.com", "name": "christian"},
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["email"] == "christian@example.com"
    assert data["name"] == "christian"
    assert "id" in data
    # Verify ID is a valid UUID
    user_id = UUID(data["id"])
    assert isinstance(user_id, UUID)

    # Get the user
    response = client.get("/user")
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["email"] == "christian@example.com"
    assert data["name"] == "christian"
    assert UUID(data["id"]) == user_id


def test_create_user_duplicate():
    """Test that creating a second user fails"""
    # Create first user
    response = client.post(
        "/user",
        json={"email": "test@example.com", "name": "test"},
    )
    assert response.status_code == 200, response.text

    # Try to create second user (should fail)
    response = client.post(
        "/user",
        json={"email": "test2@example.com", "name": "test2"},
    )
    assert response.status_code == 400, response.text
    assert "already exists" in response.json()["detail"].lower()


def test_create_and_get_family_member():
    """Test creating and retrieving family members"""
    # First create a user
    response = client.post(
        "/user",
        json={"email": "parent@example.com", "name": "Parent"},
    )
    assert response.status_code == 200, response.text
    user_data = response.json()
    user_id = UUID(user_data["id"])

    # Create a family member
    response = client.post(
        "/family_members",
        json={
            "name": "Child",
            "birthdate": "2020-01-01",
            "sex": "M",
        },
    )
    assert response.status_code == 200, response.text
    member_data = response.json()
    assert member_data["name"] == "Child"
    assert member_data["birthdate"] == "2020-01-01"
    assert member_data["sex"] == "M"
    assert UUID(member_data["user_id"]) == user_id
    member_id = UUID(member_data["id"])

    # Get all family members
    response = client.get("/family_members")
    assert response.status_code == 200, response.text
    members = response.json()
    assert len(members) == 1
    assert members[0]["name"] == "Child"
    assert UUID(members[0]["id"]) == member_id


def test_create_vaccine_record():
    """Test creating a vaccine record for a family member"""
    # Create user
    response = client.post(
        "/user",
        json={"email": "user@example.com", "name": "User"},
    )
    assert response.status_code == 200, response.text

    # Create family member
    response = client.post(
        "/family_members",
        json={
            "name": "Patient",
            "birthdate": "2015-05-15",
            "sex": "F",
        },
    )
    assert response.status_code == 200, response.text
    member_data = response.json()
    member_id = UUID(member_data["id"])

    # Create a vaccine directly in the database (since POST /vaccines was removed)
    db = TestingSessionLocal()
    try:
        vaccine = models.Vaccine(name="COVID-19", description="COVID-19 vaccine")
        db.add(vaccine)
        db.commit()
        db.refresh(vaccine)
        vaccine_id = vaccine.id
    finally:
        db.close()

    # Create a vaccine record
    response = client.post(
        f"/family_members/{member_id}/vaccine_records",
        json={
            "vaccine_id": str(vaccine_id),
            "date": "2024-01-01",
            "location": "Clinic",
            "dosage": "1ml",
        },
    )
    assert response.status_code == 200, response.text
    record_data = response.json()
    assert record_data["date"] == "2024-01-01"
    assert record_data["location"] == "Clinic"
    assert record_data["dosage"] == "1ml"
    assert UUID(record_data["vaccine_id"]) == vaccine_id
    assert UUID(record_data["family_member_id"]) == member_id
    record_id = UUID(record_data["id"])

    # Get vaccine records for the family member
    response = client.get(f"/family_members/{member_id}/vaccine_records")
    assert response.status_code == 200, response.text
    records = response.json()
    assert len(records) == 1
    assert UUID(records[0]["id"]) == record_id

    # Test that creating a record with invalid family_member_id fails
    # Use uuid7 to generate a valid UUIDv7 that doesn't exist in the database
    fake_member_id = uuid6.uuid7()
    response = client.post(
        f"/family_members/{fake_member_id}/vaccine_records",
        json={
            "vaccine_id": str(vaccine_id),
            "date": "2024-01-01",
            "location": "Clinic",
            "dosage": "1ml",
        },
    )
    assert response.status_code == 404, response.text
    assert "not found" in response.json()["detail"].lower()


def test_get_vaccines():
    """Test getting the list of vaccines"""
    response = client.get("/vaccines")
    assert response.status_code == 200, response.text
    vaccines = response.json()
    assert isinstance(vaccines, list)
    # If there are vaccines, verify they have UUID IDs
    for vaccine in vaccines:
        assert "id" in vaccine
        UUID(vaccine["id"])  # Should be a valid UUID
        assert "name" in vaccine
