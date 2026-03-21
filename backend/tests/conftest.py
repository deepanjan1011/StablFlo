import pytest
import sys
from unittest.mock import MagicMock


@pytest.fixture(autouse=True)
def mock_firebase_admin():
    """
    Patch sys.modules with a fresh MagicMock for firebase_admin before each test.
    This ensures tests don't depend on execution order and prevents the real
    firebase_admin.initialize_app from raising 'app already exists' on reload.
    """
    mock_fa = MagicMock()
    sys.modules['firebase_admin'] = mock_fa
    sys.modules['firebase_admin.credentials'] = mock_fa.credentials
    sys.modules['firebase_admin.auth'] = mock_fa.auth
    yield mock_fa
    # Cleanup: remove so next test gets a fresh mock
    for key in ['firebase_admin', 'firebase_admin.credentials', 'firebase_admin.auth']:
        sys.modules.pop(key, None)
    # Also remove cached main module so next test's reload starts clean
    sys.modules.pop('main', None)
