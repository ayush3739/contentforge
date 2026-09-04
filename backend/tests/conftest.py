import pytest
from app.core.database import get_db
from app.main import app


@pytest.fixture(autouse=True)
def mock_db_session():
    """
    Supplies None as DB session during unit tests if no live Postgres is available,
    allowing services to exercise their robust in-memory fallbacks cleanly without network hangs.
    """
    def _mock_get_db():
        yield None

    app.dependency_overrides[get_db] = _mock_get_db
    yield
    app.dependency_overrides.pop(get_db, None)
