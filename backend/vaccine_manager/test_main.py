# testing code from: https://fastapi.tiangolo.com/advanced/testing-database/
# minimally adapted for this project
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


models.Base.metadata.create_all(bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


def test_create_user():
    response = client.post(
        "/users/",
        json={"email": "christian@example.com", "name": "christian"},
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["email"] == "christian@example.com"
    assert "id" in data
    user_id = data["id"]

    response = client.get(f"/users")
    assert response.status_code == 200, response.text
    data = response.json()
    assert len(data) == 1
    assert data[0]["email"] == "christian@example.com"
    assert data[0]["id"] == user_id
