# testing code from: https://fastapi.tiangolo.com/advanced/testing-database/
# minimally adapted for this project
import os
from uuid import UUID

import pytest
import uuid6
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

SQLALCHEMY_DATABASE_URL = "sqlite://"

# Set test environment variables before importing modules
os.environ["COOKIE_SECRET_KEY"] = "test-secret-key-for-testing-only"
os.environ["CORS_ORIGINS"] = '["http://localhost:3000"]'  # JSON array format

from . import auth, models  # noqa: E402
from .main import app  # noqa: E402

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


app.dependency_overrides[auth.get_db] = override_get_db

client = TestClient(app)


def register_user(
    username: str = "testuser", password: str = "testpass", name: str = "Test User"
):
    """Helper function to register a user and return the client with cookies."""
    response = client.post(
        "/register",
        json={"username": username, "password": password, "name": name},
    )
    assert response.status_code == 200, response.text
    return response


def test_register_and_get_user():
    """Test registering and retrieving a user"""
    response = register_user("christian", "password123", "Christian")
    assert response.status_code == 200, response.text
    data = response.json()
    assert "access_token" in data
    assert "token_type" in data

    # Get the user (should work with cookie from registration)
    response = client.get("/user")
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["username"] == "christian"
    assert data["name"] == "Christian"
    assert "id" in data
    UUID(data["id"])  # Verify ID is a valid UUID


def test_register_duplicate_username():
    """Test that registering with duplicate username fails"""
    # Register first user
    response = register_user("testuser", "password123")
    assert response.status_code == 200, response.text

    # Try to register with same username (should fail)
    response = client.post(
        "/register",
        json={"username": "testuser", "password": "different", "name": "Different"},
    )
    assert response.status_code == 400, response.text
    assert "already registered" in response.json()["detail"].lower()


def test_login():
    """Test login functionality"""
    # Register a user first
    register_user("loginuser", "password123", "Login User")

    # Login with correct credentials
    response = client.post(
        "/login",
        json={"username": "loginuser", "password": "password123"},
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert "access_token" in data

    # Login with wrong password
    response = client.post(
        "/login",
        json={"username": "loginuser", "password": "wrongpassword"},
    )
    assert response.status_code == 401, response.text

    # Login with non-existent user
    response = client.post(
        "/login",
        json={"username": "nonexistent", "password": "password"},
    )
    assert response.status_code == 401, response.text


def test_create_and_get_family_member():
    """Test creating and retrieving family members"""
    # Register a user first (this sets the auth cookie)
    register_user("parent", "password123", "Parent")

    # Get user to verify authentication
    response = client.get("/user")
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
    # Register a user first (this sets the auth cookie)
    register_user("user", "password123", "User")

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
    # Register a user first (vaccines endpoint requires authentication)
    register_user("vaccineuser", "password123")

    response = client.get("/vaccines")
    assert response.status_code == 200, response.text
    vaccines = response.json()
    assert isinstance(vaccines, list)
    # If there are vaccines, verify they have UUID IDs
    for vaccine in vaccines:
        assert "id" in vaccine
        UUID(vaccine["id"])  # Should be a valid UUID
        assert "name" in vaccine


def test_unauthenticated_access():
    """Test that unauthenticated requests return 401"""
    # Try to access protected endpoint without authentication
    response = client.get("/user")
    assert response.status_code == 401, response.text

    response = client.get("/family_members")
    assert response.status_code == 401, response.text

    response = client.get("/vaccines")
    assert response.status_code == 401, response.text
