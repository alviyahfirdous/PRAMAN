import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.main import app
from app.database.session import Base, get_db
from app.core.security import get_password_hash
from app.models.user import User, UserRole
import uuid

TEST_DB_URL = "postgresql+asyncpg://praman_user:praman_secret@localhost:5432/praman_test"

test_engine = create_async_engine(TEST_DB_URL, echo=False)
TestSessionLocal = async_sessionmaker(bind=test_engine, class_=AsyncSession, expire_on_commit=False)


async def override_get_db():
    async with TestSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


app.dependency_overrides[get_db] = override_get_db


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_db():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def db():
    async with TestSessionLocal() as session:
        yield session


@pytest_asyncio.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c


@pytest_asyncio.fixture
async def demo_user(db):
    user = User(
        id=uuid.uuid4(),
        email="test@praman.demo",
        username="testuser",
        full_name="Test User",
        hashed_password=get_password_hash("Demo@123"),
        role=UserRole.STUDY_COORDINATOR,
        is_active=True,
        is_verified=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


class TestHealthEndpoint:
    @pytest.mark.asyncio
    async def test_health_ok(self, client):
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data
        assert "disclaimer" in data

    @pytest.mark.asyncio
    async def test_root(self, client):
        response = await client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["product"] == "PRAMAN"


class TestAuth:
    @pytest.mark.asyncio
    async def test_login_success(self, client, demo_user):
        response = await client.post("/api/v1/auth/login", json={
            "username": "test@praman.demo",
            "password": "Demo@123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == "test@praman.demo"
        assert data["user"]["role"] == "STUDY_COORDINATOR"

    @pytest.mark.asyncio
    async def test_login_wrong_password(self, client, demo_user):
        response = await client.post("/api/v1/auth/login", json={
            "username": "test@praman.demo",
            "password": "wrongpassword"
        })
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_me_requires_auth(self, client):
        response = await client.get("/api/v1/auth/me")
        assert response.status_code == 403  # No credentials provided

    @pytest.mark.asyncio
    async def test_me_with_token(self, client, demo_user):
        login = await client.post("/api/v1/auth/login", json={
            "username": "test@praman.demo", "password": "Demo@123"
        })
        token = login.json()["access_token"]
        response = await client.get("/api/v1/auth/me",
                                     headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        assert response.json()["email"] == "test@praman.demo"

    @pytest.mark.asyncio
    async def test_refresh_token(self, client, demo_user):
        login = await client.post("/api/v1/auth/login", json={
            "username": "test@praman.demo", "password": "Demo@123"
        })
        refresh_token = login.json()["refresh_token"]
        response = await client.post("/api/v1/auth/refresh", json={
            "refresh_token": refresh_token
        })
        assert response.status_code == 200
        assert "access_token" in response.json()
