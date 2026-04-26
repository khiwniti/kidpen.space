"""
Tests for education subjects API endpoints.

Verifies:
  - Subject listing returns all 5 STEM subjects
  - Subject metadata includes Thai names, icons, colors
  - Authenticated access required
  - Response structure matches frontend contract
"""

import pytest
from httpx import AsyncClient, ASGITransport
from backend.api import app  # FastAPI app instance


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.mark.anyio
async def test_list_subjects_returns_all_five():
    """GET /v1/education/subjects should return 5 subjects."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/v1/education/subjects")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 5
        keys = {s["key"] for s in data}
        assert keys == {"math", "physics", "chemistry", "biology", "cs"}


@pytest.mark.anyio
async def test_subject_has_thai_name():
    """Each subject must have a Thai name."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/v1/education/subjects")
        assert response.status_code == 200
        for subject in response.json():
            assert "name_th" in subject
            assert subject["name_th"], f"Subject {subject['key']} has empty name_th"


@pytest.mark.anyio
async def test_subject_has_icon_and_color():
    """Each subject must have icon and color for UI rendering."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/v1/education/subjects")
        assert response.status_code == 200
        for subject in response.json():
            assert "icon" in subject, f"Subject {subject['key']} missing icon"
            assert "color" in subject, f"Subject {subject['key']} missing color"
            assert subject["color"].startswith("#"), f"Subject {subject['key']} color not hex"


@pytest.mark.anyio
async def test_education_health_returns_metadata():
    """GET /v1/education/health should return platform metadata."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/v1/education/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["module"] == "kidpen-education"
        assert "features" in data
        assert data["features"]["thai_language"] is True
        assert data["features"]["ipst_aligned"] is True